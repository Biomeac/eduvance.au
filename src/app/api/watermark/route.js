import { NextResponse } from 'next/server';
import { PDFDocument, rgb, PDFName } from 'pdf-lib';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import fontkit from '@pdf-lib/fontkit';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Import security utilities
import { 
  authorizeStaff, 
  validateInput, 
  VALIDATION_SCHEMAS, 
  checkRateLimit, 
  getClientIP, 
  createSecurityError,
  addSecurityHeaders,
  sanitizeInput
} from '@/lib/security';
// Helper to get Google Drive file/folder ID from URL
function extractDriveId(url) {
  const fileMatch = url.match(/\/d\/(.*?)(\/|$)/);
  const folderMatch = url.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return { type: 'file', id: fileMatch[1] };
  if (folderMatch) return { type: 'folder', id: folderMatch[1] };
  return null;
}

// Helper to fetch PDF file from Google Drive (publicly shared)
async function fetchPdfFromDrive(fileId) {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch PDF from Google Drive');
  return Buffer.from(await res.arrayBuffer());
}

async function watermarkPdf(pdfBuffer, headerBuffer, footerBuffer) {
  const srcPdfDoc = await PDFDocument.load(pdfBuffer);
  srcPdfDoc.registerFontkit(fontkit);
  const totalPages = srcPdfDoc.getPageCount();
  const extraHeight = 50;
  const fontUrl = 'https://eduvance-org.vercel.app/fonts/poppins.ttf';
  const response = await fetch(fontUrl);
  const fontBytes = await response.arrayBuffer();
  const FONT = await srcPdfDoc.embedFont(fontBytes);
  for (let i = 0; i < totalPages; i++) {
    const originalPage = srcPdfDoc.getPage(i);
    const pageRef = originalPage.node;
    pageRef.delete(PDFName.of('CropBox'));
    pageRef.delete(PDFName.of('TrimBox'));
    pageRef.delete(PDFName.of('BleedBox'));
    const { width, height } = originalPage.getSize();    
    originalPage.setSize(width, height+extraHeight)
    originalPage.translateContent(0, extraHeight/2)
    // originalPage.drawRectangle({
    //   x: 0,
    //   y: -extraHeight/2,
    //   width: width,  
    //   height: extraHeight/2, 
    //   color: rgb(78/255, 140/255, 255/255),
    // }); 
    // Draws a blue rectangle for footer ^

    const footerFontSize = 8;
    const footerLine1 = "Disclaimer: Eduvance.au distributes notes for educational purposes only. Some content may be subject to copyright.";
    const footerLine2 = "If you are a rights holder and believe your material has been used improperly, please contact us.";

    const lineSpacing = 4;
    const baseY = -extraHeight / 2 + 4;

    originalPage.drawText(footerLine1, { 
      x: (width - FONT.widthOfTextAtSize(footerLine1, footerFontSize)) / 2, 
      y: baseY + footerFontSize + lineSpacing,
      font: FONT,
      size: footerFontSize
    });

    originalPage.drawText(footerLine2, { 
      x: (width - FONT.widthOfTextAtSize(footerLine2, footerFontSize)) / 2, 
      y: baseY,
      font: FONT,
      size: footerFontSize
    });

    // originalPage.drawRectangle({
    //   x: 0,
    //   y: height, 
    //   width: width,  
    //   height: extraHeight/2, 
    //   color: rgb(78/255, 140/255, 255/255), 
    // });
    const headerText = "Eduvance.au - Community Resource";
    originalPage.drawText(headerText, { 
      x: (width - FONT.widthOfTextAtSize(headerText, 12))/2, 
      y: height+5, 
      font: FONT,
      size: 12
    });
  }

  return await srcPdfDoc.save();
}

// Helper to fetch all PDF file IDs in a Google Drive folder (publicly shared, using Google Drive API)
async function fetchFolderPdfIds(folderId) {
  // Requires Google Drive API key
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  if (!apiKey) throw new Error('Google Drive API key not set');
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='application/pdf'&fields=files(id%2Cname)&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch folder contents from Google Drive');
  const data = await res.json();
  return data.files || [];
}

export async function POST(req) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP, '/api/watermark')) {
      return createSecurityError('Rate limit exceeded. Please try again later.', 429);
    }

    // Authorization check - staff access required
    const { authorized, error: authError } = await authorizeStaff(req, 'staff');
    if (!authorized) {
      return createSecurityError(authError, 403);
    }

    // Parse and validate input
    const rawData = await req.json();
    const { url } = sanitizeInput(rawData);
    
    if (!url) {
      return createSecurityError('Missing Google Drive URL', 400);
    }

    // Enhanced URL validation
    const validationErrors = validateInput({ url }, VALIDATION_SCHEMAS.watermark);
    if (validationErrors.length > 0) {
      return createSecurityError(`Invalid URL: ${validationErrors.join(', ')}`, 400);
    }

    const driveInfo = extractDriveId(url);
    if (!driveInfo) {
      return createSecurityError('Invalid Google Drive URL format', 400);
    }
    // Load header and footer images
    const headerPath = path.join(process.cwd(), 'public', 'Headermark.png');
    const footerPath = path.join(process.cwd(), 'public', 'Footermark.png');
    const headerBuffer = await fs.readFile(headerPath);
    const footerBuffer = await fs.readFile(footerPath);
    if (driveInfo.type === 'file') {
      const pdfBuffer = await fetchPdfFromDrive(driveInfo.id);
      const watermarked = await watermarkPdf(pdfBuffer, headerBuffer, footerBuffer);
      return new NextResponse(watermarked, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="watermarked.pdf"',
        },
      });
    } else if (driveInfo.type === 'folder') {
      // Fetch all PDF files in the folder
      const pdfFiles = await fetchFolderPdfIds(driveInfo.id);
      if (!pdfFiles.length) return NextResponse.json({ error: 'No PDF files found in folder.' }, { status: 404 });
      // Create a zip archive in memory
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks = [];
      archive.on('data', chunk => chunks.push(chunk));
      // For each PDF, fetch, watermark, and append to zip
      for (const file of pdfFiles) {
        try {
          const pdfBuffer = await fetchPdfFromDrive(file.id);
          const watermarked = await watermarkPdf(pdfBuffer, headerBuffer, footerBuffer);
          archive.append(Buffer.from(watermarked), { name: `watermarked_${file.name}` });
        } catch (err) {
          // Optionally skip or log errors for individual files
        }
      }
      await archive.finalize();
      const zipBuffer = Buffer.concat(chunks);
      return new NextResponse(zipBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="watermarked_pdfs.zip"',
        },
      });
    }
    return createSecurityError('Unknown error occurred', 500);
  } catch (err) {
    console.error('Watermark API error:', err.message);
    return createSecurityError('Internal server error', 500);
  }
} 

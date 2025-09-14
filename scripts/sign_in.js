import 'dotenv/config';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const auth = new google.auth.GoogleAuth({
  keyFile: './scripts/key.json', // Google Drive Service Account JSON
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

function getFileId(link) {
  const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

async function checkDriveFile(fileId) {
  try {
    await drive.files.get({ fileId, fields: 'id' });
    return true;
  } catch (err) {
    if (err.code === 404 || err.code === 403) return false; // missing or unauthorized
    throw err;
  }
}

async function checkResources() {
  const { data, error } = await supabase.from('community_resource_requests').select('*');
  if (error) throw error;

  for (let row of data) {
    console.log(row.link);
    const fileId = getFileId(row.link);
    if (!fileId) {
      console.log('Unapproved');
      await supabase
      .from('community_resource_requests')
      .update({ approved: 'Unapproved' })
      .eq('id', row.id);
      continue;
    }

    const exists = await checkDriveFile(fileId);
    if (!exists) {
      const { error: updateError } = await supabase
        .from('community_resource_requests')
        .update({ approved: 'Unapproved' })
        .eq('id', row.id);
      if (updateError) console.error(updateError);
      else console.log(`Unapproved`);
    } else {
      console.log(`Passed`);
    }
  }
}

checkResources();

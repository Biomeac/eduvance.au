# Vercel Deployment Guide - Environment Variables Setup

## 🚨 **CRITICAL: Environment Variables Required**

Your build is failing because the required environment variables are not set in Vercel. Follow these steps to fix the deployment:

## Step 1: Access Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Navigate to your project: `eduvance.au`
3. Click on the **Settings** tab
4. Click on **Environment Variables** in the left sidebar

## Step 2: Add Required Environment Variables

Add these environment variables one by one:

### **Supabase Configuration (Required)**
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### **Google Drive API (Required for watermarking)**
```
GOOGLE_DRIVE_API_KEY=your_google_drive_api_key
```

### **Discord Bot (Required for member count)**
```
BOT_TOKEN=your_discord_bot_token
GUILD_ID=your_discord_guild_id
```

## Step 3: Get Your Supabase Keys

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 4: Get Google Drive API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Drive API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key → `GOOGLE_DRIVE_API_KEY`

## Step 5: Get Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select existing one
3. Go to **Bot** section
4. Copy the **Token** → `BOT_TOKEN`
5. Get your server ID (right-click server → Copy Server ID) → `GUILD_ID`

## Step 6: Set Environment Variables in Vercel

For each environment variable:

1. Click **Add New**
2. Enter the **Name** (e.g., `SUPABASE_URL`)
3. Enter the **Value** (your actual key/URL)
4. Select **Production**, **Preview**, and **Development** environments
5. Click **Save**

## Step 7: Redeploy

After adding all environment variables:

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger a new deployment

## Step 8: Verify Deployment

1. Check the build logs to ensure no errors
2. Test the application functionality
3. Verify that API endpoints work correctly

## 🔒 **Security Notes**

- **NEVER** commit environment variables to your repository
- **NEVER** share your service role keys publicly
- The `SUPABASE_SERVICE_ROLE_KEY` has full database access - keep it secure
- The `GOOGLE_DRIVE_API_KEY` should be restricted to your domain

## 🚀 **Expected Result**

After setting up the environment variables, your deployment should:
- ✅ Build successfully without errors
- ✅ All API endpoints should work
- ✅ Staff authentication should function
- ✅ Database operations should work
- ✅ Cookie consent should appear
- ✅ All security features should be active

## 📞 **Need Help?**

If you're still having issues:
1. Check the Vercel build logs for specific errors
2. Verify all environment variables are set correctly
3. Ensure your Supabase project is active and accessible
4. Test the API endpoints individually

## 🔧 **Troubleshooting**

### Common Issues:
- **"Missing environment variables"** → Check all variables are set in Vercel
- **"Invalid credentials"** → Verify Supabase keys are correct
- **"API key not configured"** → Check Google Drive API key is set
- **"Bot token invalid"** → Verify Discord bot token is correct

### Quick Test:
Visit your deployed site and check:
- `/api/subjects` should return subject data
- `/api/exam-sessions` should return exam sessions
- Staff login should work at `/dashboard/staff`

# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for your AI workflow system.

## Prerequisites

- Google Cloud Console account
- Next.js application running
- Google APIs enabled

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable Google Sheets API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"
4. Also enable "Google Drive API" for spreadsheet search functionality

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Set the name (e.g., "Business Agents Google Sheets")
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
6. Click "Create"
7. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Google Sheets Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Ollama Configuration (if not already set)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=gemma3:1b

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Test the Integration

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/data-sources`

3. Click "Add Data Source" to open the Google Sheets connector

4. Click "Connect" to initiate OAuth flow

5. Complete the Google authentication process

6. You should see your Google Sheets data

## Features Available

### ✅ **Read Data**
- Browse and search your Google Sheets
- Select specific sheets and ranges
- Preview data in a table format
- Export data for use in workflows

### ✅ **Write Data**
- Write data to specific ranges
- Append data to sheets
- Batch operations for multiple ranges

### ✅ **Search & Discovery**
- Search for spreadsheets by name
- View spreadsheet metadata
- List all sheets in a spreadsheet

### ✅ **Real-time Integration**
- Live data preview
- Automatic token refresh
- Error handling and retry logic

## API Endpoints

The integration provides several API endpoints:

- `GET /api/google-sheets/auth` - Get OAuth URL
- `POST /api/google-sheets/auth` - Exchange code for tokens
- `GET /api/google-sheets/spreadsheets` - Search spreadsheets
- `GET /api/google-sheets/data` - Read spreadsheet data
- `POST /api/google-sheets/data` - Write data to spreadsheet

## Usage in Workflows

Once connected, you can use Google Sheets data in your AI workflows:

1. **Data Source Steps**: Use Google Sheets as a data source
2. **AI Processing**: Process spreadsheet data with AI
3. **Data Export**: Write AI results back to sheets
4. **Automation**: Schedule regular data sync operations

## Security Considerations

- **OAuth Tokens**: Stored securely in localStorage
- **API Keys**: Never expose client secrets in frontend code
- **Permissions**: Only request necessary Google Sheets permissions
- **Token Refresh**: Automatic token refresh for long-running sessions

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Ensure the redirect URI in Google Cloud Console matches exactly
   - Check for trailing slashes and protocol (http vs https)

2. **"Access blocked"**
   - Verify the OAuth consent screen is configured
   - Add your email to test users if in testing mode

3. **"API not enabled"**
   - Ensure Google Sheets API and Google Drive API are enabled
   - Check that billing is enabled for your project

4. **"Token expired"**
   - The system will automatically refresh tokens
   - If refresh fails, user needs to re-authenticate

### Debug Mode

Enable debug logging by adding to your environment:

```bash
DEBUG=google-sheets:*
```

## Production Deployment

For production deployment:

1. Update redirect URIs in Google Cloud Console
2. Set production environment variables
3. Configure OAuth consent screen for production
4. Test with production domain

## Next Steps

Once Google Sheets is connected:

1. **Create Data Workflows**: Build workflows that process spreadsheet data
2. **Set up Automation**: Schedule regular data processing
3. **Integrate with AI**: Use AI to analyze and process your data
4. **Export Results**: Write AI insights back to your sheets

For more information, visit the [Google Sheets API documentation](https://developers.google.com/sheets/api).

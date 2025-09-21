import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsConnector } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const authUrl = googleSheetsConnector.getAuthUrl();
    
    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error('Google Sheets auth error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate auth URL'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    const tokens = await googleSheetsConnector.getTokens(code);
    
    return NextResponse.json({
      success: true,
      tokens,
    });
  } catch (error) {
    console.error('Google Sheets token exchange error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to exchange authorization code'
      },
      { status: 500 }
    );
  }
}

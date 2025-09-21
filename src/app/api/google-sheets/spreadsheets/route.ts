import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsConnector } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const tokens = searchParams.get('tokens');
    
    if (!tokens) {
      return NextResponse.json(
        { success: false, error: 'Authentication tokens required' },
        { status: 401 }
      );
    }

    // Set credentials
    googleSheetsConnector.setCredentials(JSON.parse(tokens));

    if (query) {
      // Search spreadsheets
      const spreadsheets = await googleSheetsConnector.searchSpreadsheets(query);
      return NextResponse.json({
        success: true,
        spreadsheets,
      });
    } else {
      // Get user's spreadsheets (this would require additional implementation)
      return NextResponse.json({
        success: true,
        spreadsheets: [],
        message: 'Search functionality available. Use ?q=search_term to search for spreadsheets.',
      });
    }
  } catch (error) {
    console.error('Google Sheets spreadsheets error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch spreadsheets'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tokens, title, sheets } = await request.json();
    
    if (!tokens) {
      return NextResponse.json(
        { success: false, error: 'Authentication tokens required' },
        { status: 401 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Spreadsheet title is required' },
        { status: 400 }
      );
    }

    // Set credentials
    googleSheetsConnector.setCredentials(tokens);

    // Create spreadsheet
    const spreadsheet = await googleSheetsConnector.createSpreadsheet(title, sheets);
    
    return NextResponse.json({
      success: true,
      spreadsheet,
    });
  } catch (error) {
    console.error('Google Sheets create error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create spreadsheet'
      },
      { status: 500 }
    );
  }
}

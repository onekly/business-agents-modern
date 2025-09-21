import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsConnector } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spreadsheetId = searchParams.get('spreadsheetId');
    const range = searchParams.get('range');
    const majorDimension = searchParams.get('majorDimension') as 'ROWS' | 'COLUMNS' || 'ROWS';
    const tokens = searchParams.get('tokens');
    
    if (!tokens) {
      return NextResponse.json(
        { success: false, error: 'Authentication tokens required' },
        { status: 401 }
      );
    }

    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'Spreadsheet ID is required' },
        { status: 400 }
      );
    }

    // Set credentials
    googleSheetsConnector.setCredentials(JSON.parse(tokens));

    if (range) {
      // Read specific range
      const data = await googleSheetsConnector.readData(spreadsheetId, range, majorDimension);
      return NextResponse.json({
        success: true,
        data,
      });
    } else {
      // Get spreadsheet info and sheets
      const info = await googleSheetsConnector.getSpreadsheetInfo(spreadsheetId);
      const sheets = await googleSheetsConnector.getSheets(spreadsheetId);
      
      return NextResponse.json({
        success: true,
        info,
        sheets,
      });
    }
  } catch (error) {
    console.error('Google Sheets data read error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to read data'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tokens, spreadsheetId, range, values, valueInputOption = 'USER_ENTERED', operation = 'write' } = await request.json();
    
    if (!tokens) {
      return NextResponse.json(
        { success: false, error: 'Authentication tokens required' },
        { status: 401 }
      );
    }

    if (!spreadsheetId || !range || !values) {
      return NextResponse.json(
        { success: false, error: 'Spreadsheet ID, range, and values are required' },
        { status: 400 }
      );
    }

    // Set credentials
    googleSheetsConnector.setCredentials(tokens);

    if (operation === 'append') {
      await googleSheetsConnector.appendData(spreadsheetId, range, values, valueInputOption);
    } else {
      await googleSheetsConnector.writeData(spreadsheetId, range, values, valueInputOption);
    }
    
    return NextResponse.json({
      success: true,
      message: `Data ${operation === 'append' ? 'appended to' : 'written to'} spreadsheet successfully`,
    });
  } catch (error) {
    console.error('Google Sheets data write error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to write data'
      },
      { status: 500 }
    );
  }
}

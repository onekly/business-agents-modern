import { google } from 'googleapis';

export interface GoogleSheetsConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface SheetData {
  range: string;
  values: string[][];
  majorDimension: 'ROWS' | 'COLUMNS';
}

export interface SheetInfo {
  spreadsheetId: string;
  title: string;
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
      gridProperties: {
        rowCount: number;
        columnCount: number;
      };
    };
  }>;
}

export class GoogleSheetsConnector {
  private oauth2Client: any;
  private sheets: any;
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
    this.sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
  }

  // Generate OAuth2 authorization URL
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
      prompt: 'consent',
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  // Set credentials from stored tokens
  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Refresh access token if needed
  async refreshToken() {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      return credentials;
    } catch (error) {
      throw new Error('Failed to refresh token. Please re-authenticate.');
    }
  }

  // Get spreadsheet information
  async getSpreadsheetInfo(spreadsheetId: string): Promise<SheetInfo> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });
      
      return {
        spreadsheetId: response.data.spreadsheetId,
        title: response.data.properties.title,
        sheets: response.data.sheets.map((sheet: any) => ({
          properties: {
            sheetId: sheet.properties.sheetId,
            title: sheet.properties.title,
            gridProperties: {
              rowCount: sheet.properties.gridProperties.rowCount,
              columnCount: sheet.properties.gridProperties.columnCount,
            },
          },
        })),
      };
    } catch (error) {
      console.error('Error getting spreadsheet info:', error);
      throw new Error('Failed to get spreadsheet information');
    }
  }

  // Read data from a specific range
  async readData(
    spreadsheetId: string,
    range: string,
    majorDimension: 'ROWS' | 'COLUMNS' = 'ROWS'
  ): Promise<SheetData> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
        majorDimension,
      });

      return {
        range: response.data.range,
        values: response.data.values || [],
        majorDimension: response.data.majorDimension || 'ROWS',
      };
    } catch (error) {
      console.error('Error reading data:', error);
      throw new Error('Failed to read data from spreadsheet');
    }
  }

  // Write data to a specific range
  async writeData(
    spreadsheetId: string,
    range: string,
    values: string[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption,
        requestBody: {
          values,
        },
      });
    } catch (error) {
      console.error('Error writing data:', error);
      throw new Error('Failed to write data to spreadsheet');
    }
  }

  // Append data to a sheet
  async appendData(
    spreadsheetId: string,
    range: string,
    values: string[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption,
        requestBody: {
          values,
        },
      });
    } catch (error) {
      console.error('Error appending data:', error);
      throw new Error('Failed to append data to spreadsheet');
    }
  }

  // Get all sheets in a spreadsheet
  async getSheets(spreadsheetId: string) {
    try {
      const info = await this.getSpreadsheetInfo(spreadsheetId);
      return info.sheets.map(sheet => ({
        id: sheet.properties.sheetId,
        title: sheet.properties.title,
        rowCount: sheet.properties.gridProperties.rowCount,
        columnCount: sheet.properties.gridProperties.columnCount,
      }));
    } catch (error) {
      console.error('Error getting sheets:', error);
      throw new Error('Failed to get sheets');
    }
  }

  // Search for spreadsheets by title
  async searchSpreadsheets(query: string) {
    try {
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
      const response = await drive.files.list({
        q: `name contains '${query}' and mimeType='application/vnd.google-apps.spreadsheet'`,
        fields: 'files(id, name, modifiedTime, webViewLink)',
        orderBy: 'modifiedTime desc',
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error searching spreadsheets:', error);
      throw new Error('Failed to search spreadsheets');
    }
  }

  // Create a new spreadsheet
  async createSpreadsheet(title: string, sheets: Array<{ title: string }> = [{ title: 'Sheet1' }]) {
    try {
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title,
          },
          sheets: sheets.map(sheet => ({
            properties: {
              title: sheet.title,
            },
          })),
        },
      });

      return {
        spreadsheetId: response.data.spreadsheetId,
        spreadsheetUrl: response.data.spreadsheetUrl,
        title: response.data.properties.title,
      };
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw new Error('Failed to create spreadsheet');
    }
  }

  // Batch read multiple ranges
  async batchRead(spreadsheetId: string, ranges: string[]) {
    try {
      const response = await this.sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges,
      });

      return response.data.valueRanges.map((range: any) => ({
        range: range.range,
        values: range.values || [],
        majorDimension: range.majorDimension || 'ROWS',
      }));
    } catch (error) {
      console.error('Error batch reading:', error);
      throw new Error('Failed to batch read data');
    }
  }

  // Batch write multiple ranges
  async batchWrite(spreadsheetId: string, data: Array<{ range: string; values: string[][] }>) {
    try {
      const requests = data.map(item => ({
        range: item.range,
        values: item.values,
      }));

      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: requests,
        },
      });
    } catch (error) {
      console.error('Error batch writing:', error);
      throw new Error('Failed to batch write data');
    }
  }

  // Get cell formatting
  async getCellFormatting(spreadsheetId: string, range: string) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        ranges: [range],
        fields: 'sheets(properties,data(rowData(values(userEnteredFormat))))',
      });

      return response.data;
    } catch (error) {
      console.error('Error getting cell formatting:', error);
      throw new Error('Failed to get cell formatting');
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      // Try to get user info to test the connection
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      await oauth2.userinfo.get();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Default configuration
export const defaultGoogleSheetsConfig: GoogleSheetsConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
};

// Singleton instance
export const googleSheetsConnector = new GoogleSheetsConnector(defaultGoogleSheetsConfig);

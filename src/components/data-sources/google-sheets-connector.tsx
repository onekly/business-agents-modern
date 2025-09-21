'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';

interface GoogleSheetsConnectorProps {
  onDataSelect?: (data: any) => void;
  onConnectionChange?: (connected: boolean) => void;
  onConfigure?: (config: { spreadsheetId: string; sheetName: string; data: any }) => void;
}

interface Spreadsheet {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink: string;
}

interface Sheet {
  id: number;
  title: string;
  rowCount: number;
  columnCount: number;
}

interface SheetData {
  range: string;
  values: string[][];
  majorDimension: 'ROWS' | 'COLUMNS';
}

export default function GoogleSheetsConnector({ onDataSelect, onConnectionChange, onConfigure }: GoogleSheetsConnectorProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<string | null>(null);
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<Spreadsheet | null>(null);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have stored tokens
    const storedTokens = localStorage.getItem('google_sheets_tokens');
    if (storedTokens) {
      setTokens(storedTokens);
      setIsConnected(true);
      onConnectionChange?.(true);
    }
  }, [onConnectionChange]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/google-sheets/auth');
      const data = await response.json();

      if (data.success) {
        // Open auth URL in new window
        const authWindow = window.open(data.authUrl, 'google-auth', 'width=500,height=600');
        
        // Listen for auth completion
        const checkAuth = setInterval(async () => {
          if (authWindow?.closed) {
            clearInterval(checkAuth);
            // Try to get tokens from URL params or handle auth completion
            // This would typically be handled by a callback page
          }
        }, 1000);
      } else {
        setError(data.error || 'Failed to initiate authentication');
      }
    } catch (error) {
      setError('Failed to connect to Google Sheets');
      console.error('Connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthCallback = async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/google-sheets/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.success) {
        setTokens(JSON.stringify(data.tokens));
        localStorage.setItem('google_sheets_tokens', JSON.stringify(data.tokens));
        setIsConnected(true);
        onConnectionChange?.(true);
      } else {
        setError(data.error || 'Failed to authenticate');
      }
    } catch (error) {
      setError('Authentication failed');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSpreadsheets = async () => {
    if (!tokens || !searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/google-sheets/spreadsheets?q=${encodeURIComponent(searchQuery)}&tokens=${encodeURIComponent(tokens)}`);
      const data = await response.json();

      if (data.success) {
        setSpreadsheets(data.spreadsheets);
      } else {
        setError(data.error || 'Failed to search spreadsheets');
      }
    } catch (error) {
      setError('Failed to search spreadsheets');
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSpreadsheet = async (spreadsheet: Spreadsheet) => {
    if (!tokens) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/google-sheets/data?spreadsheetId=${spreadsheet.id}&tokens=${encodeURIComponent(tokens)}`);
      const data = await response.json();

      if (data.success) {
        setSelectedSpreadsheet(spreadsheet);
        setSheets(data.sheets);
        setSelectedSheet(null);
        setSheetData(null);
      } else {
        setError(data.error || 'Failed to load spreadsheet');
      }
    } catch (error) {
      setError('Failed to load spreadsheet');
      console.error('Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSheet = async (sheet: Sheet) => {
    if (!tokens || !selectedSpreadsheet) return;

    try {
      setIsLoading(true);
      setError(null);

      const range = `${sheet.title}!A1:Z1000`; // Load first 1000 rows
      const response = await fetch(`/api/google-sheets/data?spreadsheetId=${selectedSpreadsheet.id}&range=${range}&tokens=${encodeURIComponent(tokens)}`);
      const data = await response.json();

      if (data.success) {
        setSelectedSheet(sheet);
        setSheetData(data.data);
        onDataSelect?.(data.data);
        
        // Automatically create a basic configuration
        const basicConfig = {
          id: `gs_${Date.now()}`,
          name: `${selectedSpreadsheet.name} - ${sheet.title}`,
          description: `Google Sheets data from ${sheet.title} in ${selectedSpreadsheet.name}`,
          spreadsheetId: selectedSpreadsheet.id,
          sheetName: sheet.title,
          range: 'A1:Z1000',
          syncFrequency: 'hourly' as const,
          dataTransformation: {
            enabled: false,
            rules: []
          },
          filters: {
            enabled: false,
            conditions: []
          },
          aiProcessing: {
            enabled: false,
            taskType: 'analyze-data',
            prompt: 'Analyze this data and provide insights',
            model: 'gemma3:1b'
          },
          outputFormat: 'json' as const,
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Save to localStorage
        const savedConfigs = JSON.parse(localStorage.getItem('data_source_configs') || '[]');
        const existingIndex = savedConfigs.findIndex((c: any) => c.spreadsheetId === selectedSpreadsheet.id && c.sheetName === sheet.title);
        
        if (existingIndex >= 0) {
          savedConfigs[existingIndex] = { ...basicConfig, updatedAt: new Date() };
        } else {
          savedConfigs.push(basicConfig);
        }
        
        localStorage.setItem('data_source_configs', JSON.stringify(savedConfigs));
        console.log('Auto-saved Google Sheets configuration:', basicConfig);
        
        // Show success message
        alert(`✅ Data source "${basicConfig.name}" has been automatically configured and saved!`);
        
        // Trigger refresh of configured sources
        window.dispatchEvent(new CustomEvent('dataSourceUpdated'));
        
      } else {
        setError(data.error || 'Failed to load sheet data');
      }
    } catch (error) {
      setError('Failed to load sheet data');
      console.error('Data load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setTokens(null);
    localStorage.removeItem('google_sheets_tokens');
    setIsConnected(false);
    setSpreadsheets([]);
    setSelectedSpreadsheet(null);
    setSheets([]);
    setSelectedSheet(null);
    setSheetData(null);
    setError(null);
    onConnectionChange?.(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
              <CardTitle className="text-lg">Google Sheets Connector</CardTitle>
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            {isConnected ? (
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
            ) : (
              <Button onClick={handleConnect} disabled={isLoading}>
                {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Connect
              </Button>
            )}
          </div>
        </CardHeader>
        
        {error && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Search and Select Spreadsheet */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search Spreadsheets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search for spreadsheets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSpreadsheets()}
              />
              <Button onClick={handleSearchSpreadsheets} disabled={isLoading || !searchQuery.trim()}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {spreadsheets.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Search Results</h4>
                <div className="space-y-2">
                  {spreadsheets.map((spreadsheet) => (
                    <div
                      key={spreadsheet.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSpreadsheet?.id === spreadsheet.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectSpreadsheet(spreadsheet)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{spreadsheet.name}</h5>
                          <p className="text-sm text-gray-500">
                            Modified: {formatDate(spreadsheet.modifiedTime)}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sheet Selection */}
      {selectedSpreadsheet && sheets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Sheet</CardTitle>
            <p className="text-sm text-gray-600">
              Spreadsheet: {selectedSpreadsheet.name}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sheets.map((sheet) => (
                <div
                  key={sheet.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSheet?.id === sheet.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectSheet(sheet)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{sheet.title}</h5>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-500">
                    {sheet.rowCount} rows × {sheet.columnCount} columns
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {sheetData && selectedSheet && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Data Preview</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onConfigure?.({
                    spreadsheetId: selectedSpreadsheet?.id || '',
                    sheetName: selectedSheet?.title || '',
                    data: sheetData
                  })}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Configure
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Sheet: {selectedSheet.title} | Range: {sheetData.range}
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  {sheetData.values[0] && (
                    <tr className="bg-gray-50">
                      {sheetData.values[0].map((header, index) => (
                        <th key={index} className="border border-gray-300 px-3 py-2 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {sheetData.values.slice(1, 11).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border border-gray-300 px-3 py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {sheetData.values.length > 11 && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing first 10 rows of {sheetData.values.length - 1} total rows
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

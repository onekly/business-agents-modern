"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Plus, 
  Settings, 
  Trash2,
  Edit,
  MoreVertical,
  Activity,
  CheckCircle,
  AlertCircle,
  Globe,
  FileText,
  Zap,
  Link,
  RefreshCw,
  FileSpreadsheet
} from "lucide-react"
import ModernSidebar from "@/components/modern-sidebar"
import GoogleSheetsConnector from "@/components/data-sources/google-sheets-connector"
import DataSourceConfig from "@/components/data-sources/data-source-config"
import ConfiguredSources from "@/components/data-sources/configured-sources"

// Mock data for data sources
const dataSources = [
  {
    id: 1,
    name: "Google Sheets",
    type: "API",
    status: "connected",
    lastSync: "1 minute ago",
    records: "15K",
    description: "Spreadsheet data from Google Sheets",
    endpoint: "https://sheets.googleapis.com/v4/spreadsheets",
    category: "Spreadsheets"
  },
  {
    id: 2,
    name: "Google Analytics API",
    type: "API",
    status: "connected",
    lastSync: "2 minutes ago",
    records: "1.2M",
    description: "Website traffic and user behavior data",
    endpoint: "https://analytics.googleapis.com/analytics/v3/data/ga",
    category: "Web Analytics"
  },
  {
    id: 3,
    name: "Salesforce CRM",
    type: "API",
    status: "connected",
    lastSync: "5 minutes ago",
    records: "45K",
    description: "Customer relationship management data",
    endpoint: "https://api.salesforce.com/services/data/v52.0",
    category: "CRM"
  },
  {
    id: 4,
    name: "Social Media Feeds",
    type: "API",
    status: "connected",
    lastSync: "1 minute ago",
    records: "890K",
    description: "Twitter, Facebook, LinkedIn social media data",
    endpoint: "Multiple endpoints",
    category: "Social Media"
  },
  {
    id: 5,
    name: "Email Marketing Data",
    type: "Database",
    status: "connected",
    lastSync: "10 minutes ago",
    records: "234K",
    description: "Email campaign performance and subscriber data",
    endpoint: "Internal database",
    category: "Marketing"
  },
  {
    id: 6,
    name: "Financial Data API",
    type: "API",
    status: "error",
    lastSync: "2 hours ago",
    records: "0",
    description: "Stock prices and financial market data",
    endpoint: "https://api.financialdata.com/v1",
    category: "Financial"
  },
  {
    id: 7,
    name: "Customer Support Tickets",
    type: "Database",
    status: "connected",
    lastSync: "3 minutes ago",
    records: "12K",
    description: "Support ticket data and customer interactions",
    endpoint: "Internal database",
    category: "Support"
  }
]

const categories = [
  { name: "All", count: 7, active: true },
  { name: "Spreadsheets", count: 1, active: false },
  { name: "Web Analytics", count: 1, active: false },
  { name: "CRM", count: 1, active: false },
  { name: "Social Media", count: 1, active: false },
  { name: "Marketing", count: 1, active: false },
  { name: "Financial", count: 1, active: false },
  { name: "Support", count: 1, active: false }
]

export default function DataSources() {
  const [activeConnector, setActiveConnector] = useState<string | null>(null)
  const [googleSheetsConnected, setGoogleSheetsConnected] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [configData, setConfigData] = useState<{ spreadsheetId: string; sheetName: string; data: any } | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  
  const connectedSources = dataSources.filter(source => source.status === 'connected').length + (googleSheetsConnected ? 1 : 0)
  const totalRecords = dataSources.reduce((sum, source) => sum + parseInt(source.records.replace(/[KM]/g, '')) * (source.records.includes('M') ? 1000000 : 1000), 0)
  const errorSources = dataSources.filter(source => source.status === 'error').length

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernSidebar />
      
      <div className="lg:pl-72">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Sources</h1>
              <p className="text-gray-600 mt-1">Manage and monitor your data connections and integrations.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh All
              </Button>
              <Button 
                onClick={() => setActiveConnector('google-sheets')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Data Source
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Sources</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Database className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{dataSources.length}</div>
                <p className="text-xs text-gray-500 mt-1">Data connections</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Connected</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{connectedSources}</div>
                <p className="text-xs text-gray-500 mt-1">Active connections</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Records</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{(totalRecords / 1000000).toFixed(1)}M</div>
                <p className="text-xs text-gray-500 mt-1">Data points</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Errors</CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{errorSources}</div>
                <p className="text-xs text-gray-500 mt-1">Need attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={category.active ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Configured Data Sources */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Configured Data Sources</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRefreshKey(prev => prev + 1);
                    // Also trigger the custom event
                    window.dispatchEvent(new CustomEvent('dataSourceUpdated'));
                    console.log('Manually triggered data source refresh');
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Add a test configuration for debugging
                    const testConfig = {
                      id: `test_${Date.now()}`,
                      name: 'Test Google Sheets',
                      description: 'Test configuration',
                      spreadsheetId: 'test123',
                      sheetName: 'Test Sheet',
                      range: 'A1:Z100',
                      syncFrequency: 'hourly' as const,
                      dataTransformation: { enabled: false, rules: [] },
                      filters: { enabled: false, conditions: [] },
                      aiProcessing: { enabled: false, taskType: 'analyze-data', prompt: '', model: 'gemma3:1b' },
                      outputFormat: 'json' as const,
                      status: 'active' as const,
                      createdAt: new Date(),
                      updatedAt: new Date()
                    };
                    const savedConfigs = JSON.parse(localStorage.getItem('data_source_configs') || '[]');
                    savedConfigs.push(testConfig);
                    localStorage.setItem('data_source_configs', JSON.stringify(savedConfigs));
                    setRefreshKey(prev => prev + 1);
                    console.log('Added test configuration:', testConfig);
                    console.log('Updated localStorage:', localStorage.getItem('data_source_configs'));
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Test Config
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem('data_source_configs');
                    setRefreshKey(prev => prev + 1);
                    console.log('Cleared localStorage');
                    alert('localStorage cleared. Refresh the page.');
                  }}
                >
                  Clear All Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveConnector('google-sheets')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Source
                </Button>
              </div>
            </div>
            <ConfiguredSources key={refreshKey} />
          </div>

          {/* Google Sheets Connector */}
          {activeConnector === 'google-sheets' && (
            <div className="mb-8">
              <GoogleSheetsConnector 
                onConnectionChange={setGoogleSheetsConnected}
                onDataSelect={(data) => {
                  console.log('Selected data:', data);
                  // Handle data selection
                }}
                onConfigure={(config) => {
                  console.log('Configure button clicked with config:', config);
                  setConfigData(config);
                  setShowConfig(true);
                }}
              />
            </div>
          )}

          {/* Data Sources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataSources.map((source) => (
              <Card key={source.id} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        source.name === 'Google Sheets' ? 'bg-green-100' :
                        source.type === 'API' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {source.name === 'Google Sheets' ? (
                          <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        ) : source.type === 'API' ? (
                          <Globe className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Database className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">{source.name}</CardTitle>
                        <CardDescription className="text-gray-500">{source.category}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={source.status === 'connected' ? 'success' : 'destructive'}
                        className="text-xs"
                      >
                        {source.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed">{source.description}</p>
                  
                  {/* Source Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium text-gray-900">{source.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Records:</span>
                      <span className="font-medium text-gray-900">{source.records}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Last Sync:</span>
                      <span className="font-medium text-gray-900">{source.lastSync}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Endpoint:</span>
                      <span className="font-medium text-gray-900 text-xs truncate max-w-32">
                        {source.endpoint}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Sync
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <Settings className="mr-1 h-3 w-3" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State for when no sources */}
          {dataSources.length === 0 && (
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <Database className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No data sources yet</h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  Connect your first data source to start collecting and analyzing data with your AI agents.
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Data Source
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Data Source Configuration Modal */}
      {showConfig && configData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <DataSourceConfig
              spreadsheetId={configData.spreadsheetId}
              sheetName={configData.sheetName}
              data={configData.data}
              onConfigSave={(config) => {
                console.log('Configuration saved:', config);
                setShowConfig(false);
                setConfigData(null);
                setRefreshKey(prev => prev + 1); // Trigger refresh
              }}
              onClose={() => {
                setShowConfig(false);
                setConfigData(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

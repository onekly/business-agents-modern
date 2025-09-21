'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileSpreadsheet, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw, 
  Trash2, 
  Edit,
  Eye,
  Download,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Database
} from 'lucide-react';

interface ConfiguredDataSource {
  id: string;
  name: string;
  description: string;
  spreadsheetId: string;
  sheetName: string;
  range: string;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  dataTransformation: {
    enabled: boolean;
    rules: any[];
  };
  filters: {
    enabled: boolean;
    conditions: any[];
  };
  aiProcessing: {
    enabled: boolean;
    taskType: string;
    prompt: string;
    model: string;
  };
  outputFormat: 'json' | 'csv' | 'excel' | 'raw';
  status: 'active' | 'paused' | 'error';
  lastSync?: Date;
  recordCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function ConfiguredSources() {
  const [sources, setSources] = useState<ConfiguredDataSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfiguredSources();
    
    // Listen for data source updates
    const handleDataSourceUpdate = () => {
      console.log('Data source updated, refreshing...');
      loadConfiguredSources();
    };
    
    window.addEventListener('dataSourceUpdated', handleDataSourceUpdate);
    
    return () => {
      window.removeEventListener('dataSourceUpdated', handleDataSourceUpdate);
    };
  }, []);

  const loadConfiguredSources = () => {
    try {
      const savedConfigs = JSON.parse(localStorage.getItem('data_source_configs') || '[]');
      console.log('Loading configured sources from localStorage:', savedConfigs);
      console.log('Number of sources found:', savedConfigs.length);
      console.log('localStorage key exists:', localStorage.getItem('data_source_configs') !== null);
      setSources(savedConfigs);
    } catch (error) {
      console.error('Error loading configured sources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    if (!source) return;

    try {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update last sync time
      setSources(prev => prev.map(s => 
        s.id === sourceId 
          ? { ...s, lastSync: new Date(), status: 'active' }
          : s
      ));
    } catch (error) {
      console.error('Sync error:', error);
      setSources(prev => prev.map(s => 
        s.id === sourceId 
          ? { ...s, status: 'error' }
          : s
      ));
    }
  };

  const handleToggleStatus = (sourceId: string) => {
    setSources(prev => prev.map(s => 
      s.id === sourceId 
        ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
        : s
    ));
  };

  const handleDelete = (sourceId: string) => {
    if (confirm('Are you sure you want to delete this data source configuration?')) {
      setSources(prev => prev.filter(s => s.id !== sourceId));
      
      // Update localStorage
      const updatedConfigs = sources.filter(s => s.id !== sourceId);
      localStorage.setItem('data_source_configs', JSON.stringify(updatedConfigs));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getSyncFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'realtime':
        return 'Real-time';
      case 'hourly':
        return 'Every hour';
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'manual':
        return 'Manual';
      default:
        return frequency;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Database className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No configured data sources</h3>
          <p className="text-gray-600 text-center mb-4">
            Configure your first data source to start using it in workflows
          </p>
          <Button onClick={loadConfiguredSources} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => {
              console.log('Manual localStorage check:');
              console.log('data_source_configs:', localStorage.getItem('data_source_configs'));
              console.log('All localStorage keys:', Object.keys(localStorage));
              alert(`Found ${localStorage.getItem('data_source_configs') ? 'data' : 'no data'} in localStorage`);
            }} 
            variant="outline"
          >
            Debug localStorage
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sources.map((source) => (
        <Card key={source.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{source.name}</CardTitle>
                  <p className="text-sm text-gray-600">{source.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(source.status)}>
                  {getStatusIcon(source.status)}
                  <span className="ml-1">{source.status}</span>
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(source.id)}
                >
                  {source.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Spreadsheet</p>
                <p className="font-medium text-sm truncate">{source.sheetName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Range</p>
                <p className="font-medium text-sm">{source.range}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sync Frequency</p>
                <p className="font-medium text-sm">{getSyncFrequencyText(source.syncFrequency)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Sync</p>
                <p className="font-medium text-sm">
                  {source.lastSync ? formatDate(source.lastSync) : 'Never'}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              {source.dataTransformation.enabled && (
                <Badge variant="outline" className="text-xs">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Transformations ({source.dataTransformation.rules.length})
                </Badge>
              )}
              {source.filters.enabled && (
                <Badge variant="outline" className="text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Filters ({source.filters.conditions.length})
                </Badge>
              )}
              {source.aiProcessing.enabled && (
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Processing
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {source.outputFormat.toUpperCase()}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSync(source.id)}
                disabled={source.status === 'paused'}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Sync Now
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button size="sm" variant="outline">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(source.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

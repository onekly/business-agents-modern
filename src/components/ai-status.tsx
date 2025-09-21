'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';

interface AIStatusProps {
  className?: string;
}

interface AIStatusData {
  success: boolean;
  message?: string;
  models?: string[];
  defaultModel?: string;
  model?: string;
  error?: string;
  suggestion?: string;
}

export default function AIStatus({ className }: AIStatusProps) {
  const [status, setStatus] = useState<AIStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkAIStatus = async () => {
    setIsLoading(true);
    try {
      // Check Ollama directly
      const response = await fetch(`${process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || 'http://localhost:11434'}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const models = data.models || [];
        const hasGemma = models.some((model: any) => model.name.includes('gemma'));
        
        setStatus({
          success: true,
          model: hasGemma ? 'gemma3:1b' : 'ollama',
          message: `Connected to Ollama (${models.length} models available)`,
          suggestion: hasGemma ? 'Ready to process AI tasks' : 'Consider pulling the gemma3:1b model'
        });
      } else {
        throw new Error(`Ollama API returned ${response.status}`);
      }
      setLastChecked(new Date());
    } catch (error) {
      setStatus({
        success: false,
        error: 'Failed to connect to Ollama',
        suggestion: 'Please ensure Ollama is running on localhost:11434'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAIStatus();
  }, []);

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />;
    }
    
    if (status?.success) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = () => {
    if (isLoading) return 'border-blue-200 bg-blue-50';
    if (status?.success) return 'border-green-200 bg-green-50';
    return 'border-red-200 bg-red-50';
  };

  const getConnectionIcon = () => {
    if (status?.success) {
      return <Wifi className="w-4 h-4 text-green-600" />;
    }
    return <WifiOff className="w-4 h-4 text-red-600" />;
  };

  return (
    <Card className={`${getStatusColor()} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <CardTitle className="text-base">AI Service Status</CardTitle>
            {getStatusIcon()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkAIStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="text-sm text-gray-600">
            Checking AI service connection...
          </div>
        ) : status ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <span className="text-sm font-medium">
                {status.success ? 'Connected' : 'Disconnected'}
              </span>
              <Badge variant={status.success ? 'default' : 'destructive'}>
                {status.success ? 'Online' : 'Offline'}
              </Badge>
            </div>
            
            {status.success ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  {status.message}
                </div>
                {status.models && status.models.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Available Models:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {status.models.slice(0, 3).map((model, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                      {status.models.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{status.models.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                {status.defaultModel && (
                  <div className="text-xs text-gray-500">
                    Default: {status.defaultModel}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-red-600">
                  {status.error}
                </div>
                {status.suggestion && (
                  <div className="text-xs text-gray-500">
                    {status.suggestion}
                  </div>
                )}
              </div>
            )}
            
            {lastChecked && (
              <div className="text-xs text-gray-400">
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            Unable to check AI service status
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  EyeOff,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  SkipForward,
  MessageSquare,
  Code,
  Database,
  Globe
} from 'lucide-react';
import { WorkflowStep, UserInteraction } from '@/types/workflow';

interface AIStepExecutorProps {
  step: WorkflowStep;
  onUserInteraction: (interaction: Omit<UserInteraction, 'id' | 'timestamp'>) => void;
  isExecuting: boolean;
  showDetails?: boolean;
}

export default function AIStepExecutor({ 
  step, 
  onUserInteraction, 
  isExecuting, 
  showDetails = false 
}: AIStepExecutorProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiOutput, setAiOutput] = useState<string>('');
  const [reasoning, setReasoning] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);

  useEffect(() => {
    if (step.status === 'running' && step.type === 'ai_action') {
      simulateAIThinking();
    }
  }, [step.status, step.type]);

  const simulateAIThinking = async () => {
    setAiThinking(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate AI output based on step configuration
    const mockOutputs = {
      'analyze-requirements': {
        output: 'I have analyzed the product requirements and identified the key features needed for comparison.',
        reasoning: 'Based on the input parameters, I need to focus on price, reviews, availability, and specifications.',
        confidence: 0.92
      },
      'generate-response': {
        output: 'I have generated a professional response that addresses the customer\'s inquiry.',
        reasoning: 'The response follows our company tone guidelines and includes all necessary information.',
        confidence: 0.88
      },
      'extract-data': {
        output: 'I have successfully extracted structured data from the web pages.',
        reasoning: 'Using pattern recognition, I identified the relevant information and organized it into a structured format.',
        confidence: 0.95
      },
      'default': {
        output: `AI has completed the ${step.name.toLowerCase()} task.`,
        reasoning: 'I processed the input data according to the specified configuration and generated the appropriate output.',
        confidence: 0.85
      }
    };

    const output = mockOutputs[step.config.taskType as keyof typeof mockOutputs] || mockOutputs.default;
    
    setAiOutput(output.output);
    setReasoning(output.reasoning);
    setConfidence(output.confidence);
    setAiThinking(false);
  };

  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'paused':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (step.status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'running':
        return 'border-blue-200 bg-blue-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      case 'paused':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const handleApprove = () => {
    onUserInteraction({
      type: 'approval',
      data: { approved: true }
    });
  };

  const handleReject = () => {
    onUserInteraction({
      type: 'approval',
      data: { approved: false }
    });
  };

  const handleSkip = () => {
    onUserInteraction({
      type: 'skip',
      data: {}
    });
  };

  const handleRetry = () => {
    onUserInteraction({
      type: 'retry',
      data: {}
    });
  };

  const getStepIcon = () => {
    switch (step.type) {
      case 'ai_action':
        return <Bot className="w-5 h-5" />;
      case 'data_processing':
        return <Database className="w-5 h-5" />;
      case 'api_call':
        return <Globe className="w-5 h-5" />;
      default:
        return <Code className="w-5 h-5" />;
    }
  };

  return (
    <Card className={`transition-all duration-200 ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getStepIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{step.name}</CardTitle>
                {getStatusIcon()}
                {step.userApprovalRequired && (
                  <Badge variant="outline" className="text-xs">
                    Approval Required
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            {step.status === 'failed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* AI Thinking Animation */}
      {aiThinking && (
        <CardContent className="pt-0">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-blue-600 animate-pulse" />
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900">AI is thinking...</div>
                <div className="text-xs text-blue-700 mt-1">
                  Analyzing data and planning next actions
                </div>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      )}

      {/* AI Output */}
      {aiOutput && !aiThinking && (
        <CardContent className="pt-0">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Bot className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-2">AI Output</div>
                <div className="text-sm text-gray-700 mb-3">{aiOutput}</div>
                
                {reasoning && (
                  <div className="bg-gray-50 rounded-md p-3 mb-3">
                    <div className="text-xs font-medium text-gray-600 mb-1">Reasoning</div>
                    <div className="text-xs text-gray-700">{reasoning}</div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Confidence:</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(confidence * 100)}%</span>
                  </div>
                  
                  {step.userApprovalRequired && step.status === 'paused' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleApprove}>
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleReject}>
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleSkip}>
                        <SkipForward className="w-4 h-4 mr-1" />
                        Skip
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Step Configuration */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Configuration</h4>
              <div className="bg-gray-50 rounded-md p-3">
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(step.config, null, 2)}
                </pre>
              </div>
            </div>

            {/* Step Inputs */}
            {step.inputs && Object.keys(step.inputs).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Inputs</h4>
                <div className="bg-gray-50 rounded-md p-3">
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(step.inputs, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Step Outputs */}
            {step.outputs && Object.keys(step.outputs).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Outputs</h4>
                <div className="bg-gray-50 rounded-md p-3">
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(step.outputs, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Error Information */}
            {step.error && (
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2">Error</h4>
                <div className="bg-red-50 rounded-md p-3">
                  <p className="text-sm text-red-600">{step.error}</p>
                </div>
              </div>
            )}

            {/* Timing Information */}
            {step.startTime && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Timing</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Started: {new Date(step.startTime).toLocaleTimeString()}</div>
                  {step.endTime && (
                    <div>Completed: {new Date(step.endTime).toLocaleTimeString()}</div>
                  )}
                  {step.duration && (
                    <div>Duration: {Math.round(step.duration)}ms</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

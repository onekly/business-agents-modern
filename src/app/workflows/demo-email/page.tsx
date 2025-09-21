'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Mail,
  FileSpreadsheet,
  Bot,
  RefreshCw
} from 'lucide-react';
import { Workflow, WorkflowExecution } from '@/types/workflow';
import { workflowEngine } from '@/lib/workflow-engine-supabase';

export default function EmailAutomationDemo() {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepResults, setStepResults] = useState<Record<string, any>>({});

  useEffect(() => {
    // Create a demo workflow for Google Sheets + Email automation
    const demoWorkflow: Workflow = {
      id: 'demo-email-workflow',
      name: 'Google Sheets Email Automation Demo',
      description: 'Retrieve contact data from Google Sheets and send personalized emails',
      version: '1.0.0',
      status: 'active',
      steps: [
        {
          id: 'step-1',
          type: 'data_processing',
          name: 'Load Google Sheets Data',
          description: 'Retrieve contact data from configured Google Sheets',
          status: 'pending',
          inputs: {
            dataSourceId: 'google-sheets-demo',
            range: 'A1:Z1000'
          },
          outputs: {},
          dependencies: [],
          config: {
            dataSource: 'google-sheets',
            operation: 'read',
            sheetName: 'Contacts'
          }
        },
        {
          id: 'step-2',
          type: 'ai_action',
          name: 'Analyze Contact Data',
          description: 'Use AI to analyze contact data and identify email preferences',
          status: 'pending',
          inputs: {},
          outputs: {},
          dependencies: ['step-1'],
          config: {
            taskType: 'analyze-data',
            model: 'gemma3:1b',
            prompt: 'Analyze the contact data and identify:\n1. Contact preferences\n2. Best time to send emails\n3. Personalized content suggestions\n4. Email segmentation opportunities',
            temperature: 0.3,
            maxTokens: 800
          }
        },
        {
          id: 'step-3',
          type: 'ai_action',
          name: 'Generate Email Content',
          description: 'Generate personalized email content for each contact',
          status: 'pending',
          inputs: {},
          outputs: {},
          dependencies: ['step-2'],
          config: {
            taskType: 'generate-content',
            model: 'gemma3:1b',
            prompt: 'Generate personalized email content based on:\n- Contact name: {{name}}\n- Company: {{company}}\n- Previous interactions: {{interactions}}\n- Preferences: {{preferences}}\n\nCreate a professional, engaging email that feels personal and relevant.',
            temperature: 0.7,
            maxTokens: 500
          }
        },
        {
          id: 'step-4',
          type: 'api_call',
          name: 'Send Emails',
          description: 'Send personalized emails to all contacts',
          status: 'pending',
          inputs: {},
          outputs: {},
          dependencies: ['step-3'],
          config: {
            url: '/api/email/send-bulk',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'demo',
      tags: ['email', 'google-sheets', 'automation', 'demo'],
      category: 'Marketing Automation',
      isTemplate: false,
      executionHistory: []
    };

    setWorkflow(demoWorkflow);
    workflowEngine.addWorkflow(demoWorkflow);
  }, []);

  const executeWorkflow = async () => {
    if (!workflow) return;

    setIsExecuting(true);
    setIsPaused(false);
    setCurrentStep(0);
    setStepResults({});

    try {
      // Simulate step-by-step execution
      for (let i = 0; i < workflow.steps.length; i++) {
        setCurrentStep(i);
        
        const step = workflow.steps[i];
        console.log(`Executing step ${i + 1}: ${step.name}`);

        // Simulate step execution based on type
        let stepResult: any = {};

        switch (step.type) {
          case 'data_processing':
            // Simulate loading Google Sheets data
            stepResult = {
              data: [
                { name: 'John Doe', email: 'john@example.com', company: 'Acme Corp', preferences: 'product updates' },
                { name: 'Jane Smith', email: 'jane@example.com', company: 'Tech Inc', preferences: 'newsletters' },
                { name: 'Bob Johnson', email: 'bob@example.com', company: 'Startup Co', preferences: 'promotions' }
              ],
              recordCount: 3,
              source: 'google-sheets'
            };
            break;

          case 'ai_action':
            // Simulate AI processing
            if (step.config.taskType === 'analyze-data') {
              stepResult = {
                analysis: 'Contact data analyzed successfully. Found 3 contacts with different preferences. Recommended segmentation: Product Updates (1), Newsletters (1), Promotions (1).',
                segmentation: {
                  'product-updates': 1,
                  'newsletters': 1,
                  'promotions': 1
                },
                recommendations: 'Personalize content based on preferences and send at optimal times.'
              };
            } else if (step.config.taskType === 'generate-content') {
              stepResult = {
                generatedContent: [
                  {
                    name: 'John Doe',
                    subject: 'Product Updates for Acme Corp',
                    content: 'Hi John,\n\nI hope this email finds you well. I wanted to share some exciting product updates that might interest you and your team at Acme Corp...'
                  },
                  {
                    name: 'Jane Smith',
                    subject: 'Weekly Newsletter - Tech Inc',
                    content: 'Hello Jane,\n\nThank you for subscribing to our newsletter. Here are this week\'s highlights that might be relevant for Tech Inc...'
                  },
                  {
                    name: 'Bob Johnson',
                    subject: 'Special Promotion for Startup Co',
                    content: 'Hi Bob,\n\nI have an exclusive promotion that could benefit your startup. This limited-time offer is perfect for growing companies like Startup Co...'
                  }
                ]
              };
            }
            break;

          case 'api_call':
            // Simulate email sending
            stepResult = {
              success: true,
              emailsSent: 3,
              results: [
                { to: 'john@example.com', status: 'sent', messageId: 'msg_001' },
                { to: 'jane@example.com', status: 'sent', messageId: 'msg_002' },
                { to: 'bob@example.com', status: 'sent', messageId: 'msg_003' }
              ],
              summary: {
                total: 3,
                successful: 3,
                failed: 0,
                successRate: 100
              }
            };
            break;
        }

        setStepResults(prev => ({ ...prev, [step.id]: stepResult }));

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Create execution record
      const execution: WorkflowExecution = {
        id: `exec_${Date.now()}`,
        workflowId: workflow.id,
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        stepResults,
        userInteractions: [],
        totalDuration: 8000
      };

      setExecution(execution);
      setIsExecuting(false);

    } catch (error) {
      console.error('Workflow execution failed:', error);
      setIsExecuting(false);
    }
  };

  const pauseWorkflow = () => {
    setIsPaused(true);
    setIsExecuting(false);
  };

  const resetWorkflow = () => {
    setIsExecuting(false);
    setIsPaused(false);
    setCurrentStep(0);
    setStepResults({});
    setExecution(null);
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'data_processing':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'ai_action':
        return <Bot className="w-4 h-4" />;
      case 'api_call':
        return <Mail className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep && isExecuting) return 'running';
    if (stepIndex === currentStep && isPaused) return 'paused';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Google Sheets Email Automation Demo
        </h1>
        <p className="text-gray-600">
          This demo shows how to retrieve data from Google Sheets and send personalized emails using AI.
        </p>
      </div>

      {/* Workflow Status */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Workflow Status</CardTitle>
            <div className="flex gap-2">
              {!isExecuting && !isPaused && (
                <Button onClick={executeWorkflow} className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start Workflow
                </Button>
              )}
              {isExecuting && (
                <Button onClick={pauseWorkflow} variant="outline">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              {(isExecuting || isPaused || execution) && (
                <Button onClick={resetWorkflow} variant="outline">
                  <Square className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className={execution ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {execution ? 'Completed' : isExecuting ? 'Running' : isPaused ? 'Paused' : 'Ready'}
            </Badge>
            {execution && (
              <span className="text-sm text-gray-600">
                Duration: {execution.totalDuration}ms | 
                Started: {execution.startedAt.toLocaleTimeString()} | 
                Completed: {execution.completedAt?.toLocaleTimeString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Workflow Steps</h2>
        {workflow.steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <Card key={step.id} className={`transition-all ${
              status === 'running' ? 'border-blue-500 bg-blue-50' : 
              status === 'completed' ? 'border-green-500 bg-green-50' :
              status === 'paused' ? 'border-yellow-500 bg-yellow-50' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="font-medium">{index + 1}.</span>
                    {getStepIcon(step.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{step.name}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  <Badge className={
                    status === 'completed' ? 'bg-green-100 text-green-800' :
                    status === 'running' ? 'bg-blue-100 text-blue-800' :
                    status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {status}
                  </Badge>
                </div>
                
                {/* Step Results */}
                {stepResults[step.id] && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Step Results:</h4>
                    <pre className="text-xs text-gray-600 overflow-x-auto">
                      {JSON.stringify(stepResults[step.id], null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Execution Summary */}
      {execution && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Execution Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">3</div>
                <div className="text-sm text-gray-600">Contacts Processed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-600">Emails Sent</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

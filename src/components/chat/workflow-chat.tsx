'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { workflowAnalyzer } from '@/lib/workflow-analyzer';
import { workflowGenerator } from '@/lib/workflow-generator';
import { workflowEngine } from '@/lib/workflow-engine-supabase';
import { 
  Send, 
  Bot, 
  User, 
  CheckCircle, 
  Clock, 
  Play, 
  Settings,
  ArrowRight,
  Sparkles,
  FileText,
  Users,
  TrendingUp,
  Database,
  Zap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  workflowSteps?: WorkflowStep[];
  isApproval?: boolean;
  workflowId?: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'ai_action' | 'api_call' | 'data_processing' | 'user_input';
  icon: string;
  estimatedDuration: string;
  dependencies: string[];
}

interface WorkflowPlan {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  estimatedTotalTime: string;
  complexity: 'Low' | 'Medium' | 'High';
  category: string;
  tags: string[];
}

export default function WorkflowChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI workflow assistant. I can help you break down complex tasks into automated workflows. What would you like to accomplish?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentWorkflowPlan, setCurrentWorkflowPlan] = useState<WorkflowPlan | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'ai_action':
        return <Bot className="w-4 h-4" />;
      case 'api_call':
        return <Zap className="w-4 h-4" />;
      case 'data_processing':
        return <Database className="w-4 h-4" />;
      case 'user_input':
        return <User className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const analyzeUserRequest = async (userInput: string): Promise<WorkflowPlan> => {
    // Use the real AI-powered workflow analyzer
    return await workflowAnalyzer.analyzeUserRequest(userInput);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    console.log('💬 New user message:', input);
    console.log('🧹 Clearing previous workflow plan');

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Clear previous workflow plan
    setCurrentWorkflowPlan(null);

    try {
      // Analyze the user request and generate workflow plan
      console.log('🔍 Analyzing new request:', input);
      const workflowPlan = await analyzeUserRequest(input);
      console.log('📋 Generated new workflow plan:', workflowPlan.name);
      setCurrentWorkflowPlan(workflowPlan);

      // Generate AI response with workflow steps
      const aiResponse: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'assistant',
        content: `I've analyzed your request and created a workflow plan. Here's what I'll do:`,
        timestamp: new Date(),
        workflowSteps: workflowPlan.steps,
        isApproval: true
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error analyzing request:', error);
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'assistant',
        content: 'Sorry, I encountered an error while analyzing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveWorkflow = async () => {
    if (!currentWorkflowPlan) return;

    setIsApproving(true);

    try {
      // Add approval message
      const approvalMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'user',
        content: '✅ Approved! Please create and execute this workflow.',
        timestamp: new Date()
      };

      // Add system message about workflow creation
      const systemMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'system',
        content: `🚀 Creating workflow "${currentWorkflowPlan.name}"...`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, approvalMessage, systemMessage]);

      // Create workflow from plan
      const workflow = await workflowGenerator.createWorkflowFromPlan(currentWorkflowPlan);
      
      // Add workflow creation success message
      const creationMessage: ChatMessage = {
        id: `msg_${Date.now() + 2}`,
        type: 'system',
        content: `✅ Workflow created successfully! Starting execution...`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, creationMessage]);

      // Execute the workflow and monitor progress using the correct workflow ID
      console.log('🚀 Executing workflow with ID:', workflow.id);
      const executionId = await workflowGenerator.executeWorkflow(workflow.id);
      
      // Start monitoring the workflow execution
      monitorWorkflowExecution(workflow.id, executionId);

    } catch (error) {
      console.error('Error creating workflow:', error);
      
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 3}`,
        type: 'assistant',
        content: `❌ Sorry, I encountered an error while creating the workflow: 

**Error Details:**
${error instanceof Error ? error.message : 'Unknown error'}

**Debugging Steps:**
1. Check the browser console for detailed error logs
2. Verify all API endpoints are running
3. Try a simpler workflow request
4. Check the network tab for failed requests

Please try again or modify your request.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsApproving(false);
    }
  };

  const monitorWorkflowExecution = async (workflowId: string, executionId: string) => {
    console.log('🔄 Starting real-time workflow monitoring for:', workflowId, executionId);
    
    try {
      // Add initial monitoring message
      const monitoringMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'system',
        content: `🔄 Starting workflow execution... (ID: ${executionId})`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, monitoringMessage]);

      // Set up real-time event listeners for workflow execution
      const setupEventListeners = () => {
        console.log('🎧 Setting up workflow event listeners...');

        // Step started event
        const handleStepStarted = (data: { execution: any; step: any }) => {
          if (data.execution.id === executionId) {
            console.log('🔄 Step started:', data.step.name);
            const stepMessage: ChatMessage = {
              id: `msg_${Date.now()}`,
              type: 'system',
              content: `🔄 **Step Started**: ${data.step.name}\n\n${data.step.description}`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, stepMessage]);
          }
        };

        // Step completed event
        const handleStepCompleted = (data: { execution: any; step: any }) => {
          if (data.execution.id === executionId) {
            console.log('✅ Step completed:', data.step.name);
            const stepMessage: ChatMessage = {
              id: `msg_${Date.now()}`,
              type: 'system',
              content: `✅ **Step Completed**: ${data.step.name}\n\n${data.step.outputs ? `**Result**: ${JSON.stringify(data.step.outputs, null, 2)}` : 'Step completed successfully'}`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, stepMessage]);
          }
        };

        // Step failed event
        const handleStepFailed = (data: { execution: any; step: any; error: any }) => {
          if (data.execution.id === executionId) {
            console.log('❌ Step failed:', data.step.name, data.error);
            const stepMessage: ChatMessage = {
              id: `msg_${Date.now()}`,
              type: 'system',
              content: `❌ **Step Failed**: ${data.step.name}\n\n**Error**: ${data.error || 'Unknown error'}`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, stepMessage]);
          }
        };

        // Workflow completed event
        const handleWorkflowCompleted = (data: { execution: any }) => {
          if (data.execution.id === executionId) {
            console.log('🎉 Workflow completed:', data.execution.id);
            const completionMessage: ChatMessage = {
              id: `msg_${Date.now()}`,
              type: 'assistant',
              content: `🎉 **Workflow Completed Successfully!**

**Execution Summary:**
- **Workflow ID**: ${workflowId}
- **Execution ID**: ${executionId}
- **Status**: ${data.execution.status}
- **Duration**: ${data.execution.totalDuration ? `${Math.round(data.execution.totalDuration / 1000)}s` : 'N/A'}

The workflow has finished executing. You can view detailed results in the Workflows section.`,
              timestamp: new Date(),
              workflowId: workflowId
            };
            setMessages(prev => [...prev, completionMessage]);
            
            // Clean up event listeners
            workflowEngine.off('stepStarted', handleStepStarted);
            workflowEngine.off('stepCompleted', handleStepCompleted);
            workflowEngine.off('stepFailed', handleStepFailed);
            workflowEngine.off('workflowCompleted', handleWorkflowCompleted);
            workflowEngine.off('workflowPaused', handleWorkflowPaused);
          }
        };

        // Workflow paused event
        const handleWorkflowPaused = (data: { execution: any; error?: any }) => {
          if (data.execution.id === executionId) {
            console.log('⏸️ Workflow paused:', data.execution.id, data.error);
            const pauseMessage: ChatMessage = {
              id: `msg_${Date.now()}`,
              type: 'system',
              content: `⏸️ **Workflow Paused**\n\n${data.error ? `**Reason**: ${data.error}` : 'Workflow execution has been paused.'}`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, pauseMessage]);
          }
        };

        // User interaction required event
        const handleUserInteractionRequired = (data: { execution: any; step: any; interaction: any }) => {
          if (data.execution.id === executionId) {
            console.log('👤 User interaction required:', data.step.name);
            const interactionMessage: ChatMessage = {
              id: `msg_${Date.now()}`,
              type: 'system',
              content: `👤 **User Interaction Required**

**Step**: ${data.step.name}
**Interaction**: ${data.interaction.type}

${data.interaction.message || 'Please provide the required input to continue the workflow.'}`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, interactionMessage]);
          }
        };

        // Register event listeners
        workflowEngine.on('stepStarted', handleStepStarted);
        workflowEngine.on('stepCompleted', handleStepCompleted);
        workflowEngine.on('stepFailed', handleStepFailed);
        workflowEngine.on('workflowCompleted', handleWorkflowCompleted);
        workflowEngine.on('workflowPaused', handleWorkflowPaused);
        workflowEngine.on('userInteractionRequired', handleUserInteractionRequired);

        // Return cleanup function
        return () => {
          console.log('🧹 Cleaning up workflow event listeners...');
          workflowEngine.off('stepStarted', handleStepStarted);
          workflowEngine.off('stepCompleted', handleStepCompleted);
          workflowEngine.off('stepFailed', handleStepFailed);
          workflowEngine.off('workflowCompleted', handleWorkflowCompleted);
          workflowEngine.off('workflowPaused', handleWorkflowPaused);
          workflowEngine.off('userInteractionRequired', handleUserInteractionRequired);
        };
      };

      // Set up event listeners
      const cleanup = setupEventListeners();

      // Also set up a fallback timeout in case events don't fire
      const timeoutId = setTimeout(() => {
        console.log('⏰ Workflow monitoring timeout - cleaning up event listeners');
        cleanup();
        
        const timeoutMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          type: 'system',
          content: `⏰ Workflow monitoring timed out after 2 minutes. The workflow may still be running in the background.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, timeoutMessage]);
      }, 120000); // 2 minutes timeout

      // Store cleanup function for potential manual cleanup
      (window as any).workflowCleanup = cleanup;

    } catch (error) {
      console.error('Error setting up workflow monitoring:', error);
      
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'system',
        content: `❌ Failed to set up workflow monitoring: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleRejectWorkflow = () => {
    const rejectMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: '❌ I want to modify this workflow. Please suggest changes.',
      timestamp: new Date()
    };

    const aiResponse: ChatMessage = {
      id: `msg_${Date.now() + 1}`,
      type: 'assistant',
      content: 'No problem! What changes would you like me to make to the workflow? I can adjust the steps, add new ones, or modify the approach.',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, rejectMessage, aiResponse]);
    setCurrentWorkflowPlan(null);
  };

  // Cleanup effect to remove event listeners when component unmounts
  useEffect(() => {
    return () => {
      if ((window as any).workflowCleanup) {
        (window as any).workflowCleanup();
        delete (window as any).workflowCleanup;
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col">
      {/* Chat Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Workflow Assistant
          </CardTitle>
          <p className="text-sm text-gray-600">
            Describe what you want to accomplish, and I'll break it down into an automated workflow
          </p>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 mb-4">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.type === 'system'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.type === 'assistant' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {message.type === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {message.type === 'system' && <Settings className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      {message.workflowSteps && (
                        <div className="mt-3 space-y-2">
                          <h4 className="font-medium text-sm mb-2">Workflow Steps:</h4>
                          {message.workflowSteps.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-500">{index + 1}.</span>
                                {getStepIcon(step.type)}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{step.name}</div>
                                <div className="text-xs text-gray-600">{step.description}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {step.estimatedDuration}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                      {message.isApproval && currentWorkflowPlan && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">Workflow Summary</h4>
                            <Badge className={
                              currentWorkflowPlan.complexity === 'High' ? 'bg-red-100 text-red-800' :
                              currentWorkflowPlan.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {currentWorkflowPlan.complexity} Complexity
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{currentWorkflowPlan.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{currentWorkflowPlan.steps.length} steps</span>
                            <span>•</span>
                            <span>{currentWorkflowPlan.estimatedTotalTime} estimated time</span>
                            <span>•</span>
                            <span>{currentWorkflowPlan.category}</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={handleApproveWorkflow}
                              disabled={isApproving}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {isApproving ? 'Creating...' : 'Approve & Create'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleRejectWorkflow}
                            >
                              Modify
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {typeof window !== 'undefined' ? message.timestamp.toLocaleTimeString() : 'Loading...'}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">Analyzing your request...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe what you want to accomplish... (e.g., 'Find tech influencers and analyze their LinkedIn articles')"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

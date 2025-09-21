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
  Clock, 
  AlertCircle, 
  Bot,
  ShoppingCart,
  Mail,
  Calendar,
  Globe,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import BrowserSimulator, { InstacartContent, GoogleCalendarContent, GoogleDriveContent } from '@/components/workflow/browser-simulator';
import AIStepExecutor from '@/components/workflow/ai-step-executor';
import { WorkflowStep, WorkflowExecution, UserInteraction } from '@/types/workflow';
import { workflowEngine } from '@/lib/workflow-engine-supabase';

export default function WorkflowDemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserContent, setBrowserContent] = useState<'instacart' | 'calendar' | 'drive'>('instacart');

  // Demo workflow steps
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'step-1',
      type: 'ai_action',
      name: 'Analyze Recipe Requirements',
      description: 'AI analyzes the family goulash recipe to identify missing ingredients',
      status: 'pending',
      inputs: {},
      outputs: {},
      dependencies: [],
      config: { 
        taskType: 'analyze-requirements',
        model: 'gpt-4',
        temperature: 0.3
      },
      userApprovalRequired: false,
      retryCount: 0,
      maxRetries: 3,
    },
    {
      id: 'step-2',
      type: 'ai_action',
      name: 'Search for Missing Ingredients',
      description: 'AI searches for the missing ingredients on Instacart',
      status: 'pending',
      inputs: {},
      outputs: {},
      dependencies: ['step-1'],
      config: { 
        taskType: 'search-ingredients',
        model: 'gpt-4',
        temperature: 0.2
      },
      userApprovalRequired: true,
      retryCount: 0,
      maxRetries: 3,
    },
    {
      id: 'step-3',
      type: 'ai_action',
      name: 'Add Items to Cart',
      description: 'AI adds the identified ingredients to the shopping cart',
      status: 'pending',
      inputs: {},
      outputs: {},
      dependencies: ['step-2'],
      config: { 
        taskType: 'add-to-cart',
        model: 'gpt-4',
        temperature: 0.1
      },
      userApprovalRequired: true,
      retryCount: 0,
      maxRetries: 3,
    },
    {
      id: 'step-4',
      type: 'ai_action',
      name: 'Review and Confirm Order',
      description: 'AI reviews the cart and asks for final confirmation',
      status: 'pending',
      inputs: {},
      outputs: {},
      dependencies: ['step-3'],
      config: { 
        taskType: 'review-order',
        model: 'gpt-4',
        temperature: 0.5
      },
      userApprovalRequired: true,
      retryCount: 0,
      maxRetries: 3,
    }
  ]);

  const [aiActions, setAiActions] = useState<Array<{
    id: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    element?: string;
    action?: string;
  }>>([]);

  const executeWorkflow = async () => {
    setIsExecuting(true);
    setIsPaused(false);
    setCurrentStep(0);
    
    // Create demo workflow in the engine
    const demoWorkflow = {
      id: 'demo-workflow',
      name: 'Grocery Run Demo',
      description: 'AI-assisted shopping workflow',
      version: '1.0.0',
      status: 'active' as const,
      steps: steps,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user',
      tags: ['demo', 'shopping'],
      category: 'Demo',
      isTemplate: false,
      executionHistory: [],
    };
    
    // Add to workflow engine
    workflowEngine.addWorkflow(demoWorkflow);
    
    const newExecution: WorkflowExecution = {
      id: `exec_${Date.now()}`,
      workflowId: 'demo-workflow',
      status: 'running',
      startedAt: new Date(),
      stepResults: {},
      userInteractions: [],
    };
    setExecution(newExecution);

    // Execute steps one by one
    for (let i = 0; i < steps.length; i++) {
      if (isPaused) break;
      
      setCurrentStep(i);
      await executeStep(i);
      
      // Wait between steps
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (!isPaused) {
      setIsExecuting(false);
      setExecution(prev => prev ? { ...prev, status: 'completed', completedAt: new Date() } : null);
    }
  };

  const executeStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step) return;

    // Update step status to running
    setSteps(prev => prev.map((s, i) => 
      i === stepIndex ? { ...s, status: 'running', startTime: new Date() } : s
    ));

    // Show browser for certain steps
    if (stepIndex === 1) {
      setBrowserContent('instacart');
      setShowBrowser(true);
    }

    // Simulate AI actions
    const actions = getStepActions(stepIndex);
    setAiActions(actions);

    // Simulate step execution time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Update step status
    setSteps(prev => prev.map((s, i) => 
      i === stepIndex ? { 
        ...s, 
        status: 'completed', 
        endTime: new Date(),
        duration: Date.now() - (s.startTime?.getTime() || Date.now()),
        outputs: getStepOutputs(stepIndex)
      } : s
    ));

    // Update AI actions
    setAiActions(prev => prev.map(action => ({ ...action, status: 'completed' })));
  };

  const getStepActions = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return [
          { id: 'action-1', description: 'Reading recipe document...', status: 'running' as const },
          { id: 'action-2', description: 'Identifying missing ingredients...', status: 'pending' as const },
          { id: 'action-3', description: 'Generating shopping list...', status: 'pending' as const }
        ];
      case 1:
        return [
          { id: 'action-4', description: 'Navigating to Instacart...', status: 'running' as const },
          { id: 'action-5', description: 'Searching for ground beef...', status: 'pending' as const },
          { id: 'action-6', description: 'Searching for yellow onion...', status: 'pending' as const },
          { id: 'action-7', description: 'Searching for beef broth...', status: 'pending' as const },
          { id: 'action-8', description: 'Searching for elbow macaroni...', status: 'pending' as const },
          { id: 'action-9', description: 'Searching for cheddar cheese...', status: 'pending' as const }
        ];
      case 2:
        return [
          { id: 'action-10', description: 'Adding ground beef to cart...', status: 'running' as const },
          { id: 'action-11', description: 'Adding yellow onion to cart...', status: 'pending' as const },
          { id: 'action-12', description: 'Adding beef broth to cart...', status: 'pending' as const },
          { id: 'action-13', description: 'Adding elbow macaroni to cart...', status: 'pending' as const },
          { id: 'action-14', description: 'Adding cheddar cheese to cart...', status: 'pending' as const }
        ];
      case 3:
        return [
          { id: 'action-15', description: 'Reviewing cart contents...', status: 'running' as const },
          { id: 'action-16', description: 'Calculating total cost...', status: 'pending' as const },
          { id: 'action-17', description: 'Preparing order summary...', status: 'pending' as const }
        ];
      default:
        return [];
    }
  };

  const getStepOutputs = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return {
          missingIngredients: [
            '1 pound lean ground beef',
            '1 medium yellow onion', 
            '2 cups beef broth',
            '1.5-2 cups uncooked elbow macaroni',
            '1 cup shredded cheddar cheese'
          ],
          confidence: 0.95
        };
      case 1:
        return {
          searchResults: {
            'ground beef': 'Found 12 options',
            'yellow onion': 'Found 8 options',
            'beef broth': 'Found 15 options',
            'elbow macaroni': 'Found 6 options',
            'cheddar cheese': 'Found 20 options'
          },
          confidence: 0.92
        };
      case 2:
        return {
          cartItems: 5,
          totalCost: 24.97,
          confidence: 0.98
        };
      case 3:
        return {
          orderSummary: '5 items added to cart',
          totalCost: 24.97,
          readyForCheckout: true,
          confidence: 0.99
        };
      default:
        return {};
    }
  };

  const handleUserInteraction = (interaction: Omit<UserInteraction, 'id' | 'timestamp'>) => {
    const stepIndex = currentStep;
    if (stepIndex === -1) return;

    setSteps(prev => prev.map((s, i) => 
      i === stepIndex ? { ...s, userApproved: true, status: 'pending' } : s
    ));

    // Continue execution
    if (interaction.type === 'approval' && interaction.data.approved) {
      executeStep(stepIndex);
    }
  };

  const pauseExecution = () => {
    setIsPaused(true);
    setIsExecuting(false);
  };

  const resumeExecution = () => {
    setIsPaused(false);
    setIsExecuting(true);
    executeWorkflow();
  };

  const stopExecution = () => {
    setIsExecuting(false);
    setIsPaused(false);
    setCurrentStep(0);
    setExecution(null);
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));
  };

  const getCurrentStep = () => steps[currentStep];

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Panel - AI Steps */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Grocery Run Demo</h1>
              <p className="text-sm text-gray-600">AI-assisted shopping workflow</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {!isExecuting ? (
              <Button onClick={executeWorkflow} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Start Demo
              </Button>
            ) : (
              <>
                <Button onClick={isPaused ? resumeExecution : pauseExecution} variant="outline" className="flex-1">
                  {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button onClick={stopExecution} variant="outline" className="flex-1">
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {steps.map((step, index) => (
            <AIStepExecutor
              key={step.id}
              step={step}
              onUserInteraction={(interaction) => handleUserInteraction(interaction)}
              isExecuting={isExecuting && currentStep === index}
              showDetails={currentStep === index}
            />
          ))}
        </div>

        {/* Progress */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Progress</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>

      {/* Right Panel - Browser Simulation */}
      <div className="flex-1 p-6">
        {showBrowser ? (
          <BrowserSimulator
            url="https://www.instacart.com"
            title="Instacart - Grocery Delivery"
            content={<InstacartContent />}
            isLoading={isExecuting && currentStep === 1}
            aiActions={aiActions}
            onActionComplete={(actionId) => {
              setAiActions(prev => prev.map(action => 
                action.id === actionId ? { ...action, status: 'completed' } : action
              ));
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI Workflow Demo</h3>
              <p className="text-gray-600 mb-4">
                Click "Start Demo" to see the AI agent in action
              </p>
              <Button onClick={executeWorkflow}>
                <Play className="w-4 h-4 mr-2" />
                Start Demo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

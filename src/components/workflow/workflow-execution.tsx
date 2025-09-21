'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  User, 
  Bot,
  Database,
  Globe,
  GitBranch,
  RotateCcw,
  Layers,
  Eye,
  EyeOff,
  RefreshCw,
  SkipForward,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Workflow, WorkflowStep, WorkflowExecution, UserInteraction } from '@/types/workflow';
import { workflowEngine } from '@/lib/workflow-engine-supabase';

interface WorkflowExecutionProps {
  workflow: Workflow;
  execution: WorkflowExecution;
  onExecutionUpdate?: (execution: WorkflowExecution) => void;
}

const stepIcons = {
  ai_action: Bot,
  user_input: User,
  data_processing: Database,
  api_call: Globe,
  decision: GitBranch,
  loop: RotateCcw,
  parallel: Layers,
};

const stepColors = {
  ai_action: 'bg-blue-100 text-blue-800 border-blue-200',
  user_input: 'bg-green-100 text-green-800 border-green-200',
  data_processing: 'bg-purple-100 text-purple-800 border-purple-200',
  api_call: 'bg-orange-100 text-orange-800 border-orange-200',
  decision: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  loop: 'bg-pink-100 text-pink-800 border-pink-200',
  parallel: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export default function WorkflowExecutionView({ workflow, execution, onExecutionUpdate }: WorkflowExecutionProps) {
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution>(execution);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [userInput, setUserInput] = useState<Record<string, string>>({});
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setCurrentExecution(execution);
  }, [execution]);

  useEffect(() => {
    if (!currentExecution) return;

    // Listen to workflow engine events
    const handleStepStarted = (data: { execution: WorkflowExecution; step: WorkflowStep }) => {
      if (data.execution.id === currentExecution.id) {
        console.log('🔄 Step started:', data.step.name);
        setCurrentExecution(data.execution);
        onExecutionUpdate?.(data.execution);
      }
    };

    const handleStepCompleted = (data: { execution: WorkflowExecution; step: WorkflowStep }) => {
      if (data.execution.id === currentExecution.id) {
        console.log('✅ Step completed:', data.step.name);
        setCurrentExecution(data.execution);
        onExecutionUpdate?.(data.execution);
      }
    };

    const handleStepFailed = (data: { execution: WorkflowExecution; step: WorkflowStep }) => {
      if (data.execution.id === currentExecution.id) {
        console.log('❌ Step failed:', data.step.name, data.step.error);
        setCurrentExecution(data.execution);
        onExecutionUpdate?.(data.execution);
      }
    };

    const handleUserInteractionRequired = (data: { execution: WorkflowExecution; step: WorkflowStep }) => {
      if (data.execution.id === currentExecution.id) {
        console.log('⏸️ User interaction required:', data.step.name);
        setCurrentExecution(data.execution);
        setIsPaused(true);
        onExecutionUpdate?.(data.execution);
      }
    };

    const handleWorkflowCompleted = (data: { execution: WorkflowExecution }) => {
      if (data.execution.id === currentExecution.id) {
        console.log('🎉 Workflow completed:', data.execution.id);
        setCurrentExecution(data.execution);
        onExecutionUpdate?.(data.execution);
      }
    };

    const handleWorkflowPaused = (data: { execution: WorkflowExecution; error?: any }) => {
      if (data.execution.id === currentExecution.id) {
        console.log('⏸️ Workflow paused:', data.execution.id, data.error);
        setCurrentExecution(data.execution);
        onExecutionUpdate?.(data.execution);
      }
    };

    workflowEngine.on('stepStarted', handleStepStarted);
    workflowEngine.on('stepCompleted', handleStepCompleted);
    workflowEngine.on('stepFailed', handleStepFailed);
    workflowEngine.on('userInteractionRequired', handleUserInteractionRequired);
    workflowEngine.on('workflowCompleted', handleWorkflowCompleted);
    workflowEngine.on('workflowPaused', handleWorkflowPaused);

    return () => {
      workflowEngine.off('stepStarted', handleStepStarted);
      workflowEngine.off('stepCompleted', handleStepCompleted);
      workflowEngine.off('stepFailed', handleStepFailed);
      workflowEngine.off('userInteractionRequired', handleUserInteractionRequired);
      workflowEngine.off('workflowCompleted', handleWorkflowCompleted);
      workflowEngine.off('workflowPaused', handleWorkflowPaused);
    };
  }, [currentExecution?.id, onExecutionUpdate]);

  const getStepStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-600" />;
      case 'skipped':
        return <SkipForward className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'running':
        return 'border-blue-200 bg-blue-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      case 'paused':
        return 'border-yellow-200 bg-yellow-50';
      case 'skipped':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const handleUserInteraction = useCallback((stepId: string, interaction: Omit<UserInteraction, 'id' | 'timestamp'>) => {
    const userInteraction: UserInteraction = {
      id: `interaction_${Date.now()}`,
      stepId,
      timestamp: new Date(),
      ...interaction,
    };

    workflowEngine.handleUserInteraction(currentExecution.id, stepId, userInteraction);
    setIsPaused(false);
  }, [currentExecution.id]);

  const toggleStepDetails = (stepId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getExecutionProgress = () => {
    const totalSteps = workflow.steps.length;
    const completedSteps = workflow.steps.filter(step => 
      step.status === 'completed' || step.status === 'skipped'
    ).length;
    return (completedSteps / totalSteps) * 100;
  };

  const currentStep = workflow.steps.find(step => step.status === 'running' || step.status === 'paused');

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{workflow.name}</h1>
            <p className="text-sm text-gray-600">Execution in progress</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-lg font-semibold">{Math.round(getExecutionProgress())}%</div>
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getExecutionProgress()}%` }}
              />
            </div>
            <Badge variant={currentExecution.status === 'running' ? 'default' : 'secondary'}>
              {currentExecution.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Current Step Alert */}
      {currentStep && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {getStepStatusIcon(currentStep.status)}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">
                {currentStep.status === 'running' ? 'Currently executing:' : 'Waiting for your input:'}
              </h3>
              <p className="text-sm text-blue-700">{currentStep.name}</p>
            </div>
            {currentStep.status === 'paused' && currentStep.userApprovalRequired && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleUserInteraction(currentStep.id, { 
                    type: 'approval', 
                    data: { approved: true } 
                  })}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUserInteraction(currentStep.id, { 
                    type: 'skip', 
                    data: {} 
                  })}
                >
                  <SkipForward className="w-4 h-4 mr-1" />
                  Skip
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {workflow.steps.map((step, index) => {
            const Icon = stepIcons[step.type];
            const isExpanded = showDetails[step.id];
            const stepResult = currentExecution.stepResults[step.id];

            return (
              <Card
                key={step.id}
                className={`transition-all duration-200 ${getStepStatusColor(step.status)}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg ${stepColors[step.type]}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <CardTitle className="text-base">{step.name}</CardTitle>
                          {getStepStatusIcon(step.status)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        {step.duration && (
                          <p className="text-xs text-gray-500 mt-1">
                            Duration: {formatDuration(step.duration)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {step.type.replace('_', ' ')}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStepDetails(step.id)}
                      >
                        {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      {step.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserInteraction(step.id, { 
                            type: 'retry', 
                            data: {} 
                          })}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

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
                      {stepResult && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Outputs</h4>
                          <div className="bg-gray-50 rounded-md p-3">
                            <pre className="text-xs text-gray-600 overflow-x-auto">
                              {JSON.stringify(stepResult, null, 2)}
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

                      {/* User Input Form */}
                      {step.type === 'user_input' && step.status === 'paused' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Your Input Required</h4>
                          <div className="space-y-3">
                            <textarea
                              value={userInput[step.id] || ''}
                              onChange={(e) => setUserInput(prev => ({
                                ...prev,
                                [step.id]: e.target.value
                              }))}
                              placeholder="Enter your input here..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={3}
                            />
                            <Button
                              onClick={() => handleUserInteraction(step.id, {
                                type: 'input',
                                data: { userInput: userInput[step.id] }
                              })}
                              disabled={!userInput[step.id]}
                            >
                              Submit Input
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Execution Summary */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Started: {new Date(currentExecution.startedAt).toLocaleTimeString()}
            {currentExecution.completedAt && (
              <span className="ml-4">
                Completed: {new Date(currentExecution.completedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {currentExecution.userInteractions.length} user interactions
          </div>
        </div>
      </div>
    </div>
  );
}

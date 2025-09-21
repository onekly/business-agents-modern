'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Bot,
  Database,
  Globe,
  GitBranch,
  RotateCcw,
  Layers
} from 'lucide-react';
import { Workflow, WorkflowStep, WorkflowExecution, WorkflowBuilderNode, WorkflowBuilderEdge } from '@/types/workflow';
import { workflowEngine } from '@/lib/workflow-engine-supabase';

interface WorkflowBuilderProps {
  workflow?: Workflow;
  onSave?: (workflow: Workflow) => void;
  onExecute?: (workflow: Workflow) => void;
  onDelete?: (workflow: Workflow) => void;
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

export default function WorkflowBuilder({ workflow, onSave, onExecute, onDelete }: WorkflowBuilderProps) {
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow>(workflow || {
    id: '',
    name: 'New Workflow',
    description: '',
    version: '1.0.0',
    status: 'draft',
    steps: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user',
    tags: [],
    category: 'general',
    isTemplate: false,
    executionHistory: [],
  });

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [showStepEditor, setShowStepEditor] = useState(false);

  const addStep = useCallback((type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type,
      name: `New ${type.replace('_', ' ')} Step`,
      description: '',
      status: 'pending',
      inputs: {},
      outputs: {},
      dependencies: [],
      config: {},
      userApprovalRequired: false,
      retryCount: 0,
      maxRetries: 3,
    };

    setCurrentWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  }, []);

  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      ),
    }));
  }, []);

  const deleteStep = useCallback((stepId: string) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId),
    }));
    setSelectedStepId(null);
  }, []);

  const executeWorkflow = useCallback(async () => {
    if (currentWorkflow.steps.length === 0) return;

    setIsExecuting(true);
    try {
      const execution = await workflowEngine.executeWorkflow(currentWorkflow.id, {});
      setCurrentExecution(execution);
      onExecute?.(currentWorkflow);
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [currentWorkflow, onExecute]);

  const pauseExecution = useCallback(() => {
    if (currentExecution) {
      workflowEngine.pauseExecution(currentExecution.id);
    }
  }, [currentExecution]);

  const resumeExecution = useCallback(() => {
    if (currentExecution) {
      workflowEngine.resumeExecution(currentExecution.id);
    }
  }, [currentExecution]);

  const stopExecution = useCallback(() => {
    if (currentExecution) {
      workflowEngine.cancelExecution(currentExecution.id);
      setCurrentExecution(null);
    }
  }, [currentExecution]);

  const handleDeleteWorkflow = useCallback(() => {
    if (!confirm(`Are you sure you want to delete "${currentWorkflow.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const success = workflowEngine.deleteWorkflow(currentWorkflow.id);
      if (success) {
        onDelete?.(currentWorkflow);
        console.log(`✅ Deleted workflow: ${currentWorkflow.name}`);
      } else {
        console.error('Failed to delete workflow');
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      alert(`Cannot delete workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [currentWorkflow, onDelete]);

  const selectedStep = useMemo(() => 
    currentWorkflow.steps.find(step => step.id === selectedStepId),
    [currentWorkflow.steps, selectedStepId]
  );

  const getStepStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Workflow Builder</h2>
          <p className="text-sm text-gray-600 mt-1">Design your AI-assisted workflow</p>
        </div>

        {/* Workflow Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={currentWorkflow.name}
                onChange={(e) => setCurrentWorkflow(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={currentWorkflow.description}
                onChange={(e) => setCurrentWorkflow(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Step Types */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add Steps</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stepIcons).map(([type, Icon]) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => addStep(type as WorkflowStep['type'])}
                className="flex items-center gap-2 h-10"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs capitalize">{type.replace('_', ' ')}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Execution Controls */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Execution</h3>
          <div className="space-y-2">
            {!isExecuting ? (
              <Button
                onClick={executeWorkflow}
                disabled={currentWorkflow.steps.length === 0}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                Execute Workflow
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={pauseExecution}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button
                  onClick={stopExecution}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>
            )}
          </div>
          
          {/* Delete Workflow Button */}
          {currentWorkflow.id && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                onClick={handleDeleteWorkflow}
                variant="outline"
                size="sm"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Workflow
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 mt-auto">
          <div className="space-y-2">
            <Button
              onClick={() => onSave?.(currentWorkflow)}
              className="w-full"
            >
              Save Workflow
            </Button>
            <Button
              onClick={() => setShowStepEditor(true)}
              variant="outline"
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{currentWorkflow.name}</h1>
              <p className="text-sm text-gray-600">{currentWorkflow.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{currentWorkflow.steps.length} steps</Badge>
              <Badge variant={currentWorkflow.status === 'active' ? 'default' : 'secondary'}>
                {currentWorkflow.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Workflow Canvas */}
        <div className="flex-1 p-6 overflow-auto">
          {currentWorkflow.steps.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No steps yet</h3>
                <p className="text-gray-600 mb-4">Add steps from the sidebar to build your workflow</p>
                <Button onClick={() => addStep('ai_action')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Step
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentWorkflow.steps.map((step, index) => {
                const Icon = stepIcons[step.type];
                return (
                  <Card
                    key={step.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedStepId === step.id
                        ? 'ring-2 ring-blue-500 shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedStepId(step.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${stepColors[step.type]}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{step.name}</CardTitle>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStepStatusIcon(step.status)}
                          <Badge variant="outline" className="text-xs">
                            {step.type.replace('_', ' ')}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStepId(step.id);
                              setShowStepEditor(true);
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteStep(step.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {step.inputs && Object.keys(step.inputs).length > 0 && (
                      <CardContent className="pt-0">
                        <div className="text-xs text-gray-500">
                          <strong>Inputs:</strong> {Object.keys(step.inputs).join(', ')}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Step Editor Modal */}
      {showStepEditor && selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Step</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={selectedStep.name}
                  onChange={(e) => updateStep(selectedStep.id, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={selectedStep.description}
                  onChange={(e) => updateStep(selectedStep.id, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedStep.userApprovalRequired || false}
                    onChange={(e) => updateStep(selectedStep.id, { userApprovalRequired: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-gray-700">Require user approval</span>
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setShowStepEditor(false)}
                  className="flex-1"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setShowStepEditor(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

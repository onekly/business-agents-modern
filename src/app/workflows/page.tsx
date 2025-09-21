'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Play, 
  Settings, 
  History, 
  Bot,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Square,
  Trash2
} from 'lucide-react';
import WorkflowBuilder from '@/components/workflow/workflow-builder';
import WorkflowExecutionView from '@/components/workflow/workflow-execution';
import WorkflowTemplates from '@/components/workflow/workflow-templates';
import AIStatus from '@/components/ai-status';
import ModernSidebar from '@/components/modern-sidebar';
import { Workflow, WorkflowExecution, WorkflowTemplate } from '@/types/workflow';
import { workflowEngine } from '@/lib/workflow-engine-supabase';
import { workflowTemplates } from '@/lib/workflow-templates';

type ViewMode = 'list' | 'builder' | 'execution' | 'templates';

export default function WorkflowsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, []);

  const loadWorkflows = async (skipTemplateCheck = false) => {
    try {
      console.log('🔄 loadWorkflows called', skipTemplateCheck ? '(skipping template check)' : '');
      setIsLoading(true);
      
      // Load workflows from Supabase
      const workflows = await workflowEngine.getAllWorkflows();
      console.log('📋 Loaded workflows from engine:', workflows.length);
      
      if (!skipTemplateCheck) {
        // Add workflow templates if they don't exist
        const existingTemplateIds = workflows
          .filter(w => w.isTemplate)
          .map(w => w.name);
        
        console.log('🔍 Existing template names:', existingTemplateIds);
        console.log('🔍 All template names:', workflowTemplates.map(t => t.name));
        
        const templatesToAdd = workflowTemplates.filter(template => 
          !existingTemplateIds.includes(template.name)
        );
        
        console.log('🔍 Templates to add:', templatesToAdd.map(t => t.name));
        
        // Add missing templates to Supabase
        for (const template of templatesToAdd) {
          try {
            await workflowEngine.addWorkflow(template);
          } catch (error) {
            console.error('Failed to add template:', template.name, error);
          }
        }
        
        // Reload workflows to get the updated list
        const updatedWorkflows = await workflowEngine.getAllWorkflows();
        console.log('📋 Updated workflows after templates:', updatedWorkflows.length);
        console.log('📋 Workflow IDs:', updatedWorkflows.map(w => w.id));
        setWorkflows(updatedWorkflows);
        console.log('✅ setWorkflows called with', updatedWorkflows.length, 'workflows');
      } else {
        // Just set the workflows without template checking
        setWorkflows(workflows);
        console.log('✅ setWorkflows called with', workflows.length, 'workflows (no template check)');
      }
      
    } catch (error) {
      console.error('Failed to load workflows:', error);
      // Fallback to empty array
      setWorkflows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExecutions = async () => {
    const mockExecutions: WorkflowExecution[] = [
      {
        id: 'exec-1',
        workflowId: '1',
        status: 'completed',
        startedAt: new Date('2024-01-20T10:00:00'),
        completedAt: new Date('2024-01-20T10:15:00'),
        stepResults: {},
        userInteractions: [],
        totalDuration: 900000,
      },
      {
        id: 'exec-2',
        workflowId: '2',
        status: 'running',
        startedAt: new Date('2024-01-25T14:30:00'),
        stepResults: {},
        userInteractions: [],
      },
    ];
    setExecutions(mockExecutions);
  };

  const handleCreateWorkflow = () => {
    setViewMode('builder');
    setSelectedWorkflow(null);
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setViewMode('builder');
  };

  const handleExecuteWorkflow = async (workflow: Workflow) => {
    try {
      const execution = await workflowEngine.executeWorkflow(workflow.id, {});
      setCurrentExecution(execution);
      setViewMode('execution');
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  };

  const handleDeleteWorkflow = async (workflow: Workflow) => {
    console.log('🗑️ Delete workflow requested:', workflow.name, workflow.id);
    
    if (!confirm(`Are you sure you want to delete "${workflow.name}"? This action cannot be undone.`)) {
      console.log('❌ Delete cancelled by user');
      return;
    }

    try {
      console.log('🔄 Calling workflowEngine.deleteWorkflow...');
      const success = await workflowEngine.deleteWorkflow(workflow.id);
      console.log('📋 Delete result:', success);
      
      if (success) {
        console.log('🔄 Reloading workflows...');
        // Reload workflows to get updated data (skip template check to prevent re-adding deleted templates)
        await loadWorkflows(true);
        
        // If this was the selected workflow, clear it
        if (selectedWorkflow?.id === workflow.id) {
          setSelectedWorkflow(null);
        }
        
        console.log(`✅ Deleted workflow: ${workflow.name}`);
      } else {
        console.error('❌ Failed to delete workflow - success was false');
      }
    } catch (error) {
      console.error('❌ Failed to delete workflow:', error);
      alert(`Cannot delete workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSelectTemplate = async (template: WorkflowTemplate) => {
    try {
      // Convert template to workflow
      const workflow: Workflow = {
        id: crypto.randomUUID(),
        name: template.name,
        description: template.description,
        version: '1.0.0',
        status: 'draft',
        steps: template.steps.map((step, index) => ({
          ...step,
          id: `step_${index}`,
          status: 'pending' as const,
          inputs: {},
          outputs: {},
          retryCount: 0,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user',
        tags: template.tags,
        category: template.category,
        isTemplate: false,
        executionHistory: [],
      };
      
      // Add to workflow engine
      await workflowEngine.addWorkflow(workflow);
      
      // Reload workflows to get updated data
      await loadWorkflows();
      
      setSelectedWorkflow(workflow);
      setViewMode('builder');
    } catch (error) {
      console.error('Failed to create workflow from template:', error);
    }
  };

  const handleSaveWorkflow = async (workflow: Workflow) => {
    try {
      if (workflow.id && workflows.find(w => w.id === workflow.id)) {
        // Update existing workflow
        await workflowEngine.updateWorkflow(workflow.id, workflow);
      } else {
        // Create new workflow
        const newWorkflow = { ...workflow, id: crypto.randomUUID() };
        await workflowEngine.addWorkflow(newWorkflow);
      }
      
      // Reload workflows to get updated data
      await loadWorkflows();
      setViewMode('list');
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  };

  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (viewMode === 'builder') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernSidebar />
        <div className="lg:pl-72">
          <WorkflowBuilder
            workflow={selectedWorkflow || undefined}
            onSave={handleSaveWorkflow}
            onExecute={handleExecuteWorkflow}
            onDelete={handleDeleteWorkflow}
          />
        </div>
      </div>
    );
  }

  if (viewMode === 'execution' && currentExecution && selectedWorkflow) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernSidebar />
        <div className="lg:pl-72">
          <WorkflowExecutionView
            workflow={selectedWorkflow}
            execution={currentExecution}
            onExecutionUpdate={setCurrentExecution}
          />
        </div>
      </div>
    );
  }

  if (viewMode === 'templates') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernSidebar />
        <div className="lg:pl-72">
          <WorkflowTemplates
            onSelectTemplate={handleSelectTemplate}
            onCreateCustom={handleCreateWorkflow}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernSidebar />
      
      <div className="lg:pl-72">
        <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Workflows</h1>
            <p className="text-gray-600 mt-1">Create and manage AI-assisted task workflows</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setViewMode('templates')}
            >
              <Bot className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button onClick={handleCreateWorkflow}>
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Clock className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading workflows...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
        {/* AI Status */}
        <div className="mb-6">
          <AIStatus />
        </div>

        {/* Active Executions */}
        {executions.filter(exec => exec.status === 'running').length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Executions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {executions
                .filter(exec => exec.status === 'running')
                .map(execution => {
                  const workflow = workflows.find(w => w.id === execution.workflowId);
                  if (!workflow) return null;
                  
                  return (
                    <Card key={execution.id} className="border-blue-200 bg-blue-50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{workflow.name}</CardTitle>
                          {getStatusIcon(execution.status)}
                        </div>
                        <p className="text-sm text-gray-600">{workflow.description}</p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Started: {new Date(execution.startedAt).toLocaleTimeString()}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedWorkflow(workflow);
                              setCurrentExecution(execution);
                              setViewMode('execution');
                            }}
                          >
                            View Progress
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}

            {/* All Workflows */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">All Workflows</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {console.log('🎨 Rendering workflows:', workflows.length, workflows.map(w => ({ id: w.id, name: w.name })))}
                {workflows.map(workflow => (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                        <Badge className={getStatusColor(workflow.status)}>
                          {workflow.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {workflow.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {workflow.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{workflow.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{workflow.steps.length} steps</span>
                        <span>Updated: {workflow.updatedAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleExecuteWorkflow(workflow)}
                          disabled={workflow.status === 'draft'}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Execute
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditWorkflow(workflow)}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteWorkflow(workflow)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Executions */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Executions</h2>
              <div className="space-y-3">
                {executions
                  .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
                  .slice(0, 5)
                  .map(execution => {
                    const workflow = workflows.find(w => w.id === execution.workflowId);
                    if (!workflow) return null;
                    
                    return (
                      <Card key={execution.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(execution.status)}
                              <div>
                                <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                                <p className="text-sm text-gray-600">
                                  Started: {new Date(execution.startedAt).toLocaleString()}
                                  {execution.completedAt && (
                                    <span className="ml-2">
                                      • Duration: {execution.totalDuration ? 
                                        Math.round(execution.totalDuration / 1000) : 0}s
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(execution.status)}>
                              {execution.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
    </div>
  );
}

import { supabase } from './supabase';
import { Workflow, WorkflowExecution } from '@/types/workflow';

export class SupabaseWorkflowService {
  // Workflow CRUD operations
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    console.log('🔄 Supabase createWorkflow called for:', workflow.name);
    console.log('📋 Workflow data:', {
      name: workflow.name,
      description: workflow.description,
      version: workflow.version,
      status: workflow.status,
      stepsCount: workflow.steps.length,
      createdBy: workflow.createdBy,
      tags: workflow.tags,
      category: workflow.category,
      isTemplate: workflow.isTemplate
    });
    
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        name: workflow.name,
        description: workflow.description,
        version: workflow.version,
        status: workflow.status,
        steps: workflow.steps,
        created_by: workflow.createdBy,
        tags: workflow.tags,
        category: workflow.category,
        is_template: workflow.isTemplate,
        execution_history: workflow.executionHistory || []
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase createWorkflow error:', error);
      throw new Error(`Failed to create workflow: ${error.message}`);
    }

    console.log('✅ Supabase createWorkflow successful, ID:', data.id);

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      version: data.version,
      status: data.status,
      steps: data.steps,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      tags: data.tags,
      category: data.category,
      isTemplate: data.is_template,
      executionHistory: data.execution_history || []
    };
  }

  async getWorkflow(id: string): Promise<Workflow | null> {
    console.log('🔍 Supabase getWorkflow called for ID:', id);
    
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Supabase getWorkflow error:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      if (error.code === 'PGRST116') {
        console.log('📋 Workflow not found (PGRST116)');
        return null; // Not found
      }
      throw new Error(`Failed to get workflow: ${error.message}`);
    }

    console.log('✅ Supabase getWorkflow successful, found workflow:', data?.name);

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      version: data.version,
      status: data.status,
      steps: data.steps,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      tags: data.tags,
      category: data.category,
      isTemplate: data.is_template,
      executionHistory: data.execution_history || []
    };
  }

  async getAllWorkflows(): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get workflows: ${error.message}`);
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      version: item.version,
      status: item.status,
      steps: item.steps,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      createdBy: item.created_by,
      tags: item.tags,
      category: item.category,
      isTemplate: item.is_template,
      executionHistory: item.execution_history || []
    }));
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow | null> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.version !== undefined) updateData.version = updates.version;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.steps !== undefined) updateData.steps = updates.steps;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.isTemplate !== undefined) updateData.is_template = updates.isTemplate;
    if (updates.executionHistory !== undefined) updateData.execution_history = updates.executionHistory;

    const { data, error } = await supabase
      .from('workflows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to update workflow: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      version: data.version,
      status: data.status,
      steps: data.steps,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      tags: data.tags,
      category: data.category,
      isTemplate: data.is_template,
      executionHistory: data.execution_history || []
    };
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    console.log('🗑️ Supabase deleteWorkflow called with ID:', id);
    
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Supabase delete error:', error);
      throw new Error(`Failed to delete workflow: ${error.message}`);
    }

    console.log('✅ Supabase delete successful');
    return true;
  }

  // Workflow Execution operations
  async createExecution(execution: Omit<WorkflowExecution, 'id' | 'startedAt' | 'completedAt'>): Promise<WorkflowExecution> {
    console.log('🔄 Supabase createExecution called for workflowId:', execution.workflowId);
    console.log('📋 Execution details:', {
      workflowId: execution.workflowId,
      status: execution.status,
      stepResultsCount: Object.keys(execution.stepResults).length,
      userInteractionsCount: execution.userInteractions.length,
      error: execution.error
    });
    
    const { data, error } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id: execution.workflowId,
        status: execution.status,
        step_results: execution.stepResults,
        user_interactions: execution.userInteractions,
        error_message: execution.error
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase createExecution error:', error);
      throw new Error(`Failed to create execution: ${error.message}`);
    }

    console.log('✅ Supabase createExecution successful, ID:', data.id);

    return {
      id: data.id,
      workflowId: data.workflow_id,
      status: data.status,
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      totalDuration: data.total_duration,
      stepResults: data.step_results,
      userInteractions: data.user_interactions || [],
      error: data.error_message
    };
  }

  async updateExecution(id: string, updates: Partial<WorkflowExecution>): Promise<WorkflowExecution | null> {
    const updateData: any = {};
    
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt.toISOString();
    if (updates.totalDuration !== undefined) updateData.total_duration = updates.totalDuration;
    if (updates.stepResults !== undefined) updateData.step_results = updates.stepResults;
    if (updates.userInteractions !== undefined) updateData.user_interactions = updates.userInteractions;
    if (updates.error !== undefined) updateData.error_message = updates.error;

    const { data, error } = await supabase
      .from('workflow_executions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to update execution: ${error.message}`);
    }

    return {
      id: data.id,
      workflowId: data.workflow_id,
      status: data.status,
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      totalDuration: data.total_duration,
      stepResults: data.step_results,
      userInteractions: data.user_interactions || [],
      error: data.error_message
    };
  }

  async getExecution(id: string): Promise<WorkflowExecution | null> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get execution: ${error.message}`);
    }

    return {
      id: data.id,
      workflowId: data.workflow_id,
      status: data.status,
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      totalDuration: data.total_duration,
      stepResults: data.step_results,
      userInteractions: data.user_interactions || [],
      error: data.error_message
    };
  }

  async getExecutionsByWorkflow(workflowId: string): Promise<WorkflowExecution[]> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('started_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get executions: ${error.message}`);
    }

    return data.map(item => ({
      id: item.id,
      workflowId: item.workflow_id,
      status: item.status,
      startedAt: new Date(item.started_at),
      completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
      totalDuration: item.total_duration,
      stepResults: item.step_results,
      userInteractions: item.user_interactions || [],
      errorMessage: item.error_message
    }));
  }

  async getAllExecutions(): Promise<WorkflowExecution[]> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get executions: ${error.message}`);
    }

    return data.map(item => ({
      id: item.id,
      workflowId: item.workflow_id,
      status: item.status,
      startedAt: new Date(item.started_at),
      completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
      totalDuration: item.total_duration,
      stepResults: item.step_results,
      userInteractions: item.user_interactions || [],
      errorMessage: item.error_message
    }));
  }
}

export const supabaseWorkflowService = new SupabaseWorkflowService();

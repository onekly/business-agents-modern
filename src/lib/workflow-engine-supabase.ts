import { Workflow, WorkflowStep, WorkflowExecution, UserInteraction } from '@/types/workflow';
import { aiService } from './ai-service';
import { emailService } from './email-service';
import { supabaseWorkflowService } from './supabase-workflows';

export class SupabaseWorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  public executions: Map<string, WorkflowExecution> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.loadWorkflowsFromSupabase();
  }

  private async loadWorkflowsFromSupabase() {
    try {
      const workflows = await supabaseWorkflowService.getAllWorkflows();
      workflows.forEach(workflow => {
        this.workflows.set(workflow.id, workflow);
      });
      console.log(`📦 Loaded ${workflows.length} workflows from Supabase`);
    } catch (error) {
      console.error('Failed to load workflows from Supabase:', error);
    }
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Workflow management
  async createWorkflow(workflowData: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    const newWorkflow: Workflow = {
      ...workflowData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await supabaseWorkflowService.createWorkflow(newWorkflow);
      this.workflows.set(newWorkflow.id, newWorkflow);
      console.log(`✅ Created workflow: ${newWorkflow.name} (${newWorkflow.id})`);
      return newWorkflow;
    } catch (error) {
      console.error('Failed to create workflow in Supabase:', error);
      // Still add to local cache as fallback
      this.workflows.set(newWorkflow.id, newWorkflow);
      return newWorkflow;
    }
  }

  async addWorkflow(workflow: Workflow): Promise<Workflow> {
    console.log('🔄 Adding workflow to Supabase:', workflow.id);
    console.log('📋 Workflow details:', {
      id: workflow.id,
      name: workflow.name,
      stepsCount: workflow.steps.length,
      status: workflow.status
    });
    
    try {
      const createdWorkflow = await supabaseWorkflowService.createWorkflow(workflow);
      this.workflows.set(workflow.id, createdWorkflow);
      console.log(`✅ Added workflow to Supabase: ${workflow.name} (${workflow.id})`);
      return createdWorkflow;
    } catch (error) {
      console.error('❌ Failed to add workflow to Supabase:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      // Don't fallback to local storage - throw the error
      throw error;
    }
  }

  async getWorkflow(id: string): Promise<Workflow | undefined> {
    try {
      const workflow = await supabaseWorkflowService.getWorkflow(id);
      if (workflow) {
        this.workflows.set(workflow.id, workflow);
        return workflow;
      }
    } catch (error) {
      console.error('Failed to get workflow from Supabase:', error);
    }
    
    // Fallback to local storage
    return this.workflows.get(id);
  }

  getWorkflowFromCache(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  async getAllWorkflows(): Promise<Workflow[]> {
    try {
      const workflows = await supabaseWorkflowService.getAllWorkflows();
      // Update local cache
      workflows.forEach(workflow => {
        this.workflows.set(workflow.id, workflow);
      });
      return workflows;
    } catch (error) {
      console.error('Failed to get workflows from Supabase:', error);
      // Fallback to local storage
      return Array.from(this.workflows.values());
    }
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow | null> {
    try {
      const updatedWorkflow = await supabaseWorkflowService.updateWorkflow(id, updates);
      if (updatedWorkflow) {
        this.workflows.set(id, updatedWorkflow);
        return updatedWorkflow;
      }
    } catch (error) {
      console.error('Failed to update workflow in Supabase:', error);
    }

    // Fallback to local storage
    const workflow = this.workflows.get(id);
    if (!workflow) return null;

    const updatedWorkflow = {
      ...workflow,
      ...updates,
      updatedAt: new Date(),
    };

    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    console.log('🗑️ WorkflowEngine deleteWorkflow called with ID:', id);
    
    try {
      // Check if workflow is currently executing
      const activeExecution = Array.from(this.executions.values())
        .find(execution => 
          execution.workflowId === id && 
          (execution.status === 'running' || execution.status === 'paused')
        );

      if (activeExecution) {
        console.log('❌ Cannot delete - workflow is executing');
        throw new Error('Cannot delete workflow that is currently executing');
      }

      console.log('🔄 Calling supabaseWorkflowService.deleteWorkflow...');
      const success = await supabaseWorkflowService.deleteWorkflow(id);
      console.log('📋 Supabase service result:', success);
      
      if (success) {
        // Remove from local cache
        this.workflows.delete(id);
        
        // Remove all executions for this workflow
        const executionsToDelete = Array.from(this.executions.values())
          .filter(execution => execution.workflowId === id)
          .map(execution => execution.id);

        executionsToDelete.forEach(executionId => {
          this.executions.delete(executionId);
        });

        console.log(`✅ Deleted workflow: ${id}`);
        return true;
      } else {
        console.log('❌ Supabase service returned false');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to delete workflow from Supabase:', error);
      throw error; // Re-throw to let the caller handle it
    }
  }

  // Execution management
  async executeWorkflow(workflowId: string, initialInputs: Record<string, any> = {}): Promise<WorkflowExecution> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // Double-check that the workflow exists in the database
    console.log('🔍 Double-checking workflow exists before creating execution...');
    const workflowExists = await supabaseWorkflowService.getWorkflow(workflowId);
    if (!workflowExists) {
      console.error('❌ Workflow does not exist in database:', workflowId);
      throw new Error(`Workflow ${workflowId} not found in database`);
    }
    console.log('✅ Workflow confirmed to exist in database:', workflowExists.name);

    const execution: WorkflowExecution = {
      id: this.generateId(),
      workflowId,
      status: 'running',
      startedAt: new Date(),
      stepResults: {},
      userInteractions: [],
    };

    console.log('🔄 Creating execution with workflowId:', workflowId);
    console.log('📋 Execution details:', {
      id: execution.id,
      workflowId: execution.workflowId,
      status: execution.status
    });

    // Save execution to Supabase
    try {
      const savedExecution = await supabaseWorkflowService.createExecution(execution);
      this.executions.set(execution.id, savedExecution);
      execution.id = savedExecution.id;
      console.log('✅ Execution saved to Supabase successfully');
    } catch (error) {
      console.error('❌ Failed to save execution to Supabase:', error);
      throw error; // Don't continue with local execution if Supabase fails
    }

    this.emit('workflowStarted', { execution, workflow });

    try {
      await this.executeSteps(workflow, execution, initialInputs);
      
      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.totalDuration = execution.completedAt.getTime() - execution.startedAt.getTime();

      // Update execution in Supabase
      try {
        await supabaseWorkflowService.updateExecution(execution.id, execution);
      } catch (error) {
        console.error('Failed to update execution in Supabase:', error);
      }

      this.emit('workflowCompleted', { execution, workflow });
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date();
      execution.totalDuration = execution.completedAt.getTime() - execution.startedAt.getTime();

      // Update execution in Supabase
      try {
        await supabaseWorkflowService.updateExecution(execution.id, execution);
      } catch (updateError) {
        console.error('Failed to update failed execution in Supabase:', updateError);
      }

      this.emit('workflowFailed', { execution, workflow, error });
      throw error;
    }

    return execution;
  }

  private async executeSteps(workflow: Workflow, execution: WorkflowExecution, stepResults: Record<string, any>): Promise<void> {
    const executedSteps = new Set<string>();
    const stepMap = new Map(workflow.steps.map(step => [step.id, step]));

    while (executedSteps.size < workflow.steps.length) {
      const readySteps = workflow.steps.filter(step => 
        !executedSteps.has(step.id) &&
        step.dependencies.every(depId => executedSteps.has(depId))
      );

      if (readySteps.length === 0) {
        throw new Error('Circular dependency detected in workflow steps');
      }

      await Promise.all(readySteps.map(step => this.executeStep(step, execution, stepResults)));
      readySteps.forEach(step => executedSteps.add(step.id));
    }
  }

  private async executeStep(step: WorkflowStep, execution: WorkflowExecution, stepResults: Record<string, any>): Promise<void> {
    const stepExecution: WorkflowStep = {
      ...step,
      status: 'running' as const,
      startTime: new Date(),
    };

    this.updateStepInExecution(execution.id, step.id, stepExecution);
    this.emit('stepStarted', { execution, step: stepExecution });

    try {
      // Check if user approval is required
      if (step.userApprovalRequired && !step.userApproved) {
        stepExecution.status = 'paused' as const;
        this.updateStepInExecution(execution.id, step.id, stepExecution);
        this.emit('userInteractionRequired', { execution, step: stepExecution });
        return;
      }

      // Execute the step based on its type
      const result = await this.executeStepByType(step, stepResults);
      
      stepExecution.status = 'completed' as const;
      stepExecution.endTime = new Date();
      stepExecution.duration = stepExecution.endTime.getTime() - stepExecution.startTime!.getTime();
      stepExecution.outputs = result;

      this.updateStepInExecution(execution.id, step.id, stepExecution);
      this.emit('stepCompleted', { execution, step: stepExecution });

    } catch (error) {
      stepExecution.status = 'failed' as const;
      stepExecution.endTime = new Date();
      stepExecution.duration = stepExecution.endTime.getTime() - stepExecution.startTime!.getTime();
      stepExecution.error = error instanceof Error ? error.message : 'Unknown error';

      this.updateStepInExecution(execution.id, step.id, stepExecution);
      this.emit('stepFailed', { execution, step: stepExecution });

      // Retry logic
      if (step.retryCount! < step.maxRetries!) {
        stepExecution.retryCount = (stepExecution.retryCount || 0) + 1;
        stepExecution.status = 'pending' as const;
        this.updateStepInExecution(execution.id, step.id, stepExecution);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * stepExecution.retryCount!));
        return this.executeStep(stepExecution, execution, stepResults);
      }

      throw error;
    }
  }

  private async executeStepByType(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    switch (step.type) {
      case 'ai_action':
        return await this.executeAIAction(step, stepResults);
      case 'api_call':
        return await this.executeAPICall(step, stepResults);
      case 'data_processing':
        return await this.executeDataProcessing(step, stepResults);
      case 'user_input':
        return await this.executeUserInput(step, stepResults);
      case 'decision':
        return await this.executeDecision(step, stepResults);
      case 'loop':
        return await this.executeLoop(step, stepResults);
      case 'parallel':
        return await this.executeParallel(step, stepResults);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  private async executeAIAction(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    const { taskType, model, prompt, temperature, maxTokens } = step.config;
    
    // Sanitize data to prevent circular references
    const sanitizedInputs = this.sanitizeData(step.inputs);
    const sanitizedStepResults = this.sanitizeData(stepResults);

    const context = {
      stepInputs: sanitizedInputs,
      stepResults: sanitizedStepResults,
      workflowContext: {
        stepName: step.name,
        stepType: step.type,
        stepId: step.id
      }
    };

    switch (taskType) {
      case 'analyze-data':
        return await aiService.analyzeData({ prompt, ...context });
      case 'generate-content':
        return await aiService.generateContent(prompt, context, model, temperature, maxTokens);
      case 'classify-data':
        return await aiService.classifyData(prompt, context, model, temperature, maxTokens);
      case 'extract-information':
        return await aiService.extractInformation(prompt, context, model, temperature, maxTokens);
      case 'summarize-content':
        return await aiService.summarizeContent(prompt, context, model, temperature, maxTokens);
      default:
        return await aiService.executeAIRequest({
          prompt,
          context,
          model,
          temperature,
          maxTokens
        });
    }
  }

  private async executeAPICall(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    const { url, method, headers, body, queryParams } = step.config;

    try {
      console.log('🔗 Executing API call:', {
        stepName: step.name,
        url,
        method: method || 'GET',
        body,
        headers
      });

      // Build URL with query parameters
      let fullUrl = url;
      if (queryParams) {
        const searchParams = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        if (searchParams.toString()) {
          fullUrl += `?${searchParams.toString()}`;
        }
      }

      // Ensure we have a full URL
      if (!fullUrl.startsWith('http')) {
        fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${fullUrl}`;
      }

      console.log('🌐 Making request to:', fullUrl);

      const requestBody = body ? JSON.stringify(body) : undefined;
      console.log('📤 Request body:', requestBody);

      const response = await fetch(fullUrl, {
        method: method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: requestBody,
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API call failed with status ${response.status}: ${response.statusText}. Response: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API Success:', data);

      return {
        success: true,
        status: response.status,
        data,
        url: fullUrl,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ API Call Error:', error);
      throw new Error(`API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeDataProcessing(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    const { processingType, criteria, maxResults } = step.config;

    switch (processingType) {
      case 'filter':
        return this.filterData(stepResults, criteria);
      case 'sort':
        return this.sortData(stepResults, criteria);
      case 'transform':
        return this.transformData(stepResults, criteria);
      case 'aggregate':
        return this.aggregateData(stepResults, criteria);
      case 'ranking':
        return this.rankData(stepResults, criteria, maxResults);
      case 'compilation':
        return this.compileData(stepResults, criteria);
      default:
        return { processedData: stepResults };
    }
  }

  private async executeUserInput(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    // This would typically pause execution and wait for user input
    // For now, we'll return the step inputs as outputs
    return {
      userInput: step.inputs,
      timestamp: new Date().toISOString(),
    };
  }

  private async executeDecision(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    const { condition, truePath, falsePath } = step.config;
    
    // Simple condition evaluation
    const result = this.evaluateCondition(condition, stepResults);
    
    return {
      decision: result,
      path: result ? truePath : falsePath,
      timestamp: new Date().toISOString(),
    };
  }

  private async executeLoop(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    const { maxIterations, condition, items } = step.config;
    const results = [];
    
    for (let i = 0; i < Math.min(maxIterations || 10, items?.length || 0); i++) {
      const item = items[i];
      const iterationResult = await this.executeStepByType(step, { ...stepResults, currentItem: item, iteration: i });
      results.push(iterationResult);
      
      if (condition && !this.evaluateCondition(condition, { ...stepResults, ...iterationResult })) {
        break;
      }
    }
    
    return {
      loopResults: results,
      iterations: results.length,
      timestamp: new Date().toISOString(),
    };
  }

  private async executeParallel(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    const { parallelSteps } = step.config;
    
    const results = await Promise.all(
      parallelSteps.map(async (parallelStep: WorkflowStep) => {
        return await this.executeStepByType(parallelStep, stepResults);
      })
    );
    
    return {
      parallelResults: results,
      timestamp: new Date().toISOString(),
    };
  }

  // Helper methods
  private updateStepInExecution(executionId: string, stepId: string, step: WorkflowStep): void {
    const execution = this.executions.get(executionId);
    if (execution) {
      execution.stepResults[stepId] = step;
      this.executions.set(executionId, execution);
    }
  }

  private sanitizeData(data: any, depth: number = 0, seen: Set<any> = new Set()): any {
    // Prevent infinite recursion
    if (depth > 10) {
      return '[Max depth reached]';
    }

    // Handle circular references
    if (seen.has(data)) {
      return '[Circular reference]';
    }

    // Handle primitive types
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      return data;
    }

    // Handle functions
    if (typeof data === 'function') {
      return '[Function]';
    }

    // Handle arrays
    if (Array.isArray(data)) {
      const newSeen = new Set(seen);
      newSeen.add(data);
      return data.slice(0, 20).map(item => this.sanitizeData(item, depth + 1, newSeen));
    }

    // Handle objects
    if (typeof data === 'object') {
      const newSeen = new Set(seen);
      newSeen.add(data);

      const sanitized: Record<string, any> = {};
      const entries = Object.entries(data).slice(0, 20);

      for (const [key, value] of entries) {
        // Skip certain problematic keys
        if (key.startsWith('_') || key === 'constructor' || key === 'prototype') {
          continue;
        }

        try {
          sanitized[key] = this.sanitizeData(value, depth + 1, newSeen);
        } catch (error) {
          sanitized[key] = `[Error sanitizing: ${error instanceof Error ? error.message : 'Unknown error'}]`;
        }
      }

      return sanitized;
    }

    // Handle other types
    return String(data);
  }

  private filterData(data: Record<string, any>, criteria: any): Record<string, any> {
    // Simple filtering implementation
    return { filteredData: data };
  }

  private sortData(data: Record<string, any>, criteria: any): Record<string, any> {
    // Simple sorting implementation
    return { sortedData: data };
  }

  private transformData(data: Record<string, any>, criteria: any): Record<string, any> {
    // Simple transformation implementation
    return { transformedData: data };
  }

  private aggregateData(data: Record<string, any>, criteria: any): Record<string, any> {
    // Simple aggregation implementation
    return { aggregatedData: data };
  }

  private rankData(data: Record<string, any>, criteria: any, maxResults?: number): Record<string, any> {
    // Simple ranking implementation
    return { rankedData: data };
  }

  private compileData(data: Record<string, any>, criteria: any): Record<string, any> {
    // Simple compilation implementation
    return { compiledData: data };
  }

  private evaluateCondition(condition: any, context: Record<string, any>): boolean {
    // Simple condition evaluation
    return true;
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  // User interaction handling
  handleUserInteraction(executionId: string, stepId: string, interaction: UserInteraction): void {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    execution.userInteractions.push(interaction);
    this.executions.set(executionId, execution);

    // Update in Supabase
    supabaseWorkflowService.updateExecution(executionId, execution).catch(error => {
      console.error('Failed to update execution in Supabase:', error);
    });

    this.emit('userInteraction', { execution, stepId, interaction });
  }

  // Execution control
  pauseExecution(executionId: string): void {
    const execution = this.executions.get(executionId);
    if (execution) {
      execution.status = 'paused';
      this.executions.set(executionId, execution);
      this.emit('workflowPaused', { execution });
    }
  }

  resumeExecution(executionId: string): void {
    const execution = this.executions.get(executionId);
    if (execution) {
      execution.status = 'running';
      this.executions.set(executionId, execution);
      this.emit('workflowResumed', { execution });
    }
  }

  cancelExecution(executionId: string): void {
    const execution = this.executions.get(executionId);
    if (execution) {
      execution.status = 'cancelled';
      execution.completedAt = new Date();
      execution.totalDuration = execution.completedAt.getTime() - execution.startedAt.getTime();
      this.executions.set(executionId, execution);
      this.emit('workflowCancelled', { execution });
    }
  }
}

export const workflowEngine = new SupabaseWorkflowEngine();

import { Workflow, WorkflowStep, WorkflowExecution, UserInteraction } from '@/types/workflow';
import { aiService } from './ai-service';
import { emailService } from './email-service';
import { supabaseWorkflowService } from './supabase-workflows';

export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  public executions: Map<string, WorkflowExecution> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    this.eventListeners.set('stepStarted', []);
    this.eventListeners.set('stepCompleted', []);
    this.eventListeners.set('stepFailed', []);
    this.eventListeners.set('workflowCompleted', []);
    this.eventListeners.set('workflowPaused', []);
    this.eventListeners.set('userInteractionRequired', []);
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Workflow management
  createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Workflow {
    const newWorkflow: Workflow = {
      ...workflow,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workflows.set(newWorkflow.id, newWorkflow);
    return newWorkflow;
  }

  async addWorkflow(workflow: Workflow): Promise<void> {
    try {
      await supabaseWorkflowService.createWorkflow(workflow);
      this.workflows.set(workflow.id, workflow);
    } catch (error) {
      console.error('Failed to add workflow to Supabase:', error);
      // Fallback to local storage
      this.workflows.set(workflow.id, workflow);
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

  updateWorkflow(id: string, updates: Partial<Workflow>): Workflow | null {
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

  deleteWorkflow(id: string): boolean {
    const workflow = this.workflows.get(id);
    if (!workflow) return false;

    // Check if workflow is currently executing
    const activeExecution = Array.from(this.executions.values())
      .find(execution => 
        execution.workflowId === id && 
        (execution.status === 'running' || execution.status === 'paused')
      );

    if (activeExecution) {
      throw new Error('Cannot delete workflow that is currently executing');
    }

    // Remove all executions for this workflow
    const executionsToDelete = Array.from(this.executions.values())
      .filter(execution => execution.workflowId === id)
      .map(execution => execution.id);

    executionsToDelete.forEach(executionId => {
      this.executions.delete(executionId);
    });

    // Remove the workflow
    this.workflows.delete(id);
    
    console.log(`🗑️ Deleted workflow: ${workflow.name} (${id})`);
    return true;
  }

  // Execution management
  async executeWorkflow(workflowId: string, initialInputs: Record<string, any> = {}): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const execution: WorkflowExecution = {
      id: this.generateId(),
      workflowId,
      status: 'running' as const,
      startedAt: new Date(),
      stepResults: { ...initialInputs },
      userInteractions: [],
    };

    this.executions.set(execution.id, execution);

    try {
      await this.executeSteps(workflow, execution);
      execution.status = 'completed' as const;
      execution.completedAt = new Date();
      execution.totalDuration = execution.completedAt.getTime() - execution.startedAt.getTime();
      this.emit('workflowCompleted', execution);
    } catch (error) {
      execution.status = 'failed' as const;
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      this.emit('workflowPaused', { execution, error });
    }

    return execution;
  }

  private async executeSteps(workflow: Workflow, execution: WorkflowExecution): Promise<void> {
    const steps = workflow.steps;
    const completedSteps = new Set<string>();
    const stepResults = execution.stepResults;

    while (completedSteps.size < steps.length) {
      const readySteps = steps.filter(step => 
        !completedSteps.has(step.id) &&
        step.dependencies.every(depId => completedSteps.has(depId))
      );

      if (readySteps.length === 0) {
        throw new Error('No ready steps found - possible circular dependency');
      }

      // Execute steps in parallel if they don't depend on each other
      const parallelSteps = readySteps.filter(step => 
        !step.dependencies.some(depId => 
          readySteps.some(readyStep => readyStep.id === depId)
        )
      );

      for (const step of parallelSteps) {
        await this.executeStep(step, execution, stepResults);
        completedSteps.add(step.id);
      }
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

      // Store results for dependent steps
      stepResults[step.id] = result;

    } catch (error) {
      stepExecution.status = 'failed' as const;
      stepExecution.error = error instanceof Error ? error.message : 'Unknown error';
      stepExecution.endTime = new Date();
      stepExecution.duration = stepExecution.endTime.getTime() - stepExecution.startTime!.getTime();

      this.updateStepInExecution(execution.id, step.id, stepExecution);
      this.emit('stepFailed', { execution, step: stepExecution });

      // Handle retries
      if (step.retryCount === undefined) step.retryCount = 0;
      if (step.retryCount < (step.maxRetries || 3)) {
        step.retryCount++;
        step.status = 'pending';
        this.updateStepInExecution(execution.id, step.id, step);
        // Retry after a delay
        setTimeout(() => this.executeStep(step, execution, stepResults), 1000 * step.retryCount);
      } else {
        throw error;
      }
    }
  }

  private async executeStepByType(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    switch (step.type) {
      case 'ai_action':
        return await this.executeAIAction(step, stepResults);
      case 'user_input':
        return await this.executeUserInput(step, stepResults);
      case 'data_processing':
        return await this.executeDataProcessing(step, stepResults);
      case 'api_call':
        return await this.executeAPICall(step, stepResults);
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
    try {
      // Check if Ollama is available
      const isHealthy = await aiService.healthCheck();
      if (!isHealthy) {
        throw new Error('AI service (Ollama) is not available. Please ensure Ollama is running.');
      }

      // Determine the AI task type and execute accordingly
      const taskType = step.config.taskType || 'general';
      const inputs = this.sanitizeData({ ...step.inputs, ...stepResults });

      let aiResponse;
      switch (taskType) {
        case 'analyze-requirements':
          aiResponse = await aiService.analyzeProductRequirements(inputs);
          break;
        case 'generate-response':
          aiResponse = await aiService.generateEmailResponse(inputs);
          break;
        case 'analyze-data':
          aiResponse = await aiService.analyzeData(inputs);
          break;
        case 'search-analyze':
          aiResponse = await aiService.searchAndAnalyze(inputs);
          break;
        case 'generate-recommendation':
          aiResponse = await aiService.generateRecommendation(inputs);
          break;
        case 'process-web-content':
          aiResponse = await aiService.processWebContent(inputs);
          break;
        case 'generate-content':
          // Use the general AI request for content generation
          aiResponse = await aiService.executeAIRequest({
            model: step.config.model || 'gemma3:1b',
            prompt: step.config.prompt || `Generate content for: ${step.name}`,
            temperature: step.config.temperature || 0.7,
            maxTokens: step.config.maxTokens || 1000,
            context: inputs,
          });
          break;
        default:
          // General AI processing
          aiResponse = await aiService.executeAIRequest({
            model: step.config.model || 'gemma3:1b',
            prompt: step.config.prompt || `Process the following task: ${step.name}`,
            temperature: step.config.temperature || 0.7,
            maxTokens: step.config.maxTokens || 1000,
            context: inputs,
          });
      }

      return {
        result: aiResponse.result,
        confidence: aiResponse.confidence,
        reasoning: aiResponse.reasoning,
        usage: aiResponse.usage,
        taskType,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('AI Action failed:', error);
      throw new Error(`AI action failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeUserInput(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    // This would wait for user input
    return {
      userInput: step.inputs.prompt || 'No user input provided',
    };
  }

  private async executeDataProcessing(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    // Process data based on step configuration
    const inputData = step.inputs.data || stepResults;
    const processingType = step.config.processingType || 'default';
    
    switch (processingType) {
      case 'ranking':
        // Rank influencers based on criteria
        const profiles = inputData.profiles || [];
        const criteria = step.config.criteria || ['followers'];
        const maxResults = step.config.maxResults || 10;
        
        const rankedProfiles = profiles
          .map((profile: any) => {
            let score = 0;
            if (criteria.includes('followers')) {
              score += Math.log10(profile.followers || 1) * 20;
            }
            if (criteria.includes('engagement')) {
              score += (profile.engagement || 0) * 0.1;
            }
            if (criteria.includes('tech_relevance')) {
              score += (profile.techScore || 0) * 0.5;
            }
            if (criteria.includes('verified_status') && profile.verified) {
              score += 20;
            }
            return { ...profile, score };
          })
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, maxResults);
        
        return {
          processedData: rankedProfiles,
          processingType: 'ranking',
          totalProcessed: rankedProfiles.length,
          criteria: criteria
        };
        
      case 'compilation':
        // Compile research report
        const allData = Object.values(stepResults);
        const report = {
          summary: {
            totalInfluencers: allData.find(d => d.totalFound)?.totalFound || 0,
            totalArticles: allData.find(d => d.articlesFetched)?.articlesFetched || 0,
            avgTechScore: allData.find(d => d.avgTechScore)?.avgTechScore || 0,
            avgEngagementScore: allData.find(d => d.avgEngagementScore)?.avgEngagementScore || 0
          },
          sections: step.config.includeMetrics ? ['Metrics', 'Analysis', 'Recommendations'] : ['Analysis'],
          timestamp: new Date().toISOString()
        };
        
        return {
          processedData: report,
          processingType: 'compilation',
          reportGenerated: true
        };
        
      default:
        return {
          processedData: inputData,
          processingType: processingType,
        };
    }
  }

  private async executeAPICall(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    // Make API call based on step configuration
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

  private async executeDecision(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    // Evaluate decision logic
    const condition = step.config.condition;
    const result = this.evaluateCondition(condition, stepResults);
    
    return {
      decision: result,
      condition,
      nextStep: result ? step.config.trueStep : step.config.falseStep,
    };
  }

  private async executeLoop(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    // Execute loop logic
    const iterations = step.config.maxIterations || 10;
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const iterationResult = await this.executeStepByType({
        ...step,
        type: step.config.loopStepType || 'data_processing',
      }, stepResults);
      results.push(iterationResult);
    }
    
    return {
      iterations: results.length,
      results,
    };
  }

  private async executeParallel(step: WorkflowStep, stepResults: Record<string, any>): Promise<Record<string, any>> {
    // Execute parallel steps
    const parallelSteps = step.config.steps || [];
    const promises = parallelSteps.map(async (parallelStep: WorkflowStep) => {
      return await this.executeStepByType(parallelStep, stepResults);
    });
    
    const results = await Promise.all(promises);
    return {
      parallelResults: results,
    };
  }

  private evaluateCondition(condition: string, stepResults: Record<string, any>): boolean {
    // Simple condition evaluation - in production, use a proper expression evaluator
    try {
      // Replace variables in condition with actual values
      let evaluatedCondition = condition;
      Object.keys(stepResults).forEach(key => {
        const value = stepResults[key];
        evaluatedCondition = evaluatedCondition.replace(
          new RegExp(`\\$\\{${key}\\}`, 'g'),
          typeof value === 'string' ? `"${value}"` : JSON.stringify(value)
        );
      });
      
      return eval(evaluatedCondition);
    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }

  // User interaction handling
  handleUserInteraction(executionId: string, stepId: string, interaction: UserInteraction): void {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    execution.userInteractions.push(interaction);
    
    // Update step based on interaction type
    const step = this.getStepFromExecution(execution, stepId);
    if (step) {
      switch (interaction.type) {
        case 'approval':
          step.userApproved = true;
          step.status = 'pending';
          break;
        case 'skip':
          step.status = 'skipped';
          break;
        case 'retry':
          step.status = 'pending';
          step.retryCount = 0;
          break;
        case 'modification':
          step.inputs = { ...step.inputs, ...interaction.data };
          step.status = 'pending';
          break;
      }
      
      this.updateStepInExecution(executionId, stepId, step);
    }
  }

  private getStepFromExecution(execution: WorkflowExecution, stepId: string): WorkflowStep | null {
    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) return null;
    
    return workflow.steps.find(step => step.id === stepId) || null;
  }

  private updateStepInExecution(executionId: string, stepId: string, updatedStep: WorkflowStep): void {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) return;

    const stepIndex = workflow.steps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      workflow.steps[stepIndex] = updatedStep;
      this.workflows.set(workflow.id, workflow);
    }
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id);
  }

  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }

  pauseExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'running') return false;

    execution.status = 'paused';
    this.emit('workflowPaused', { execution });
    return true;
  }

  resumeExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'paused') return false;

    execution.status = 'running';
    // Resume execution logic would go here
    return true;
  }

  cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution) return false;

    execution.status = 'cancelled';
    execution.completedAt = new Date();
    return true;
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
}

// Singleton instance
export const workflowEngine = new WorkflowEngine();

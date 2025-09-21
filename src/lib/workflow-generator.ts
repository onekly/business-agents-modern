import { Workflow } from '@/types/workflow';
import { workflowEngine } from './workflow-engine-supabase';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'ai_action' | 'api_call' | 'data_processing' | 'user_input';
  icon: string;
  estimatedDuration: string;
  dependencies: string[];
  config?: Record<string, any>;
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

class WorkflowGenerator {
  private workflowEngine = workflowEngine;

  async createWorkflowFromPlan(plan: WorkflowPlan): Promise<Workflow> {
    try {
      console.log('🔧 Creating workflow from plan:', plan.name);

      // Convert plan steps to workflow steps
      const workflowSteps = plan.steps.map((planStep: WorkflowStep, index: number) => ({
        id: planStep.id,
        type: planStep.type,
        name: planStep.name,
        description: planStep.description,
        status: 'pending' as const,
        inputs: {},
        outputs: {},
        dependencies: planStep.dependencies,
        config: this.generateStepConfig(planStep, plan),
        userApprovalRequired: false,
        retryCount: 0,
        maxRetries: 3
      }));

      // Create the workflow
      const workflow: Workflow = {
        id: crypto.randomUUID(),
        name: plan.name,
        description: plan.description,
        version: '1.0.0',
        status: 'active',
        steps: workflowSteps,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'chat-assistant',
        tags: plan.tags,
        category: plan.category,
        isTemplate: false,
        executionHistory: []
      };

      // Add to workflow engine
      console.log('🔄 Adding workflow to database:', workflow.id);
      console.log('📋 Workflow details:', {
        id: workflow.id,
        name: workflow.name,
        stepsCount: workflow.steps.length,
        status: workflow.status
      });
      
      try {
        console.log('🔄 Calling workflowEngine.addWorkflow...');
        const addedWorkflow = await this.workflowEngine.addWorkflow(workflow);
        console.log('✅ Workflow added to database successfully:', addedWorkflow.id);
        console.log('📋 Added workflow details:', {
          id: addedWorkflow.id,
          name: addedWorkflow.name,
          stepsCount: addedWorkflow.steps.length,
          status: addedWorkflow.status
        });
        
        // Use the workflow returned by Supabase (with the correct UUID)
        console.log('✅ Workflow created successfully:', addedWorkflow.id);
        return addedWorkflow;
      } catch (error) {
        console.error('❌ Failed to add workflow to database:', error);
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }

    } catch (error) {
      console.error('Error creating workflow from plan:', error);
      throw new Error(`Failed to create workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateStepConfig(planStep: WorkflowStep, plan: WorkflowPlan): Record<string, any> {
    const baseConfig: Record<string, any> = {
      ...planStep.config
    };

    switch (planStep.type) {
      case 'ai_action':
        return {
          ...baseConfig,
          taskType: this.getAITaskType(planStep, plan),
          model: 'gemma3:1b',
          temperature: 0.7,
          maxTokens: 1000,
          prompt: this.generateAIPrompt(planStep, plan)
        };

      case 'api_call':
        return {
          ...baseConfig,
          url: this.generateAPIUrl(planStep, plan),
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: this.generateAPIBody(planStep, plan)
        };

      case 'data_processing':
        return {
          ...baseConfig,
          processingType: this.getProcessingType(planStep, plan),
          ...this.getProcessingConfig(planStep, plan)
        };

      case 'user_input':
        return {
          ...baseConfig,
          inputType: 'text',
          prompt: planStep.description
        };

      default:
        return baseConfig;
    }
  }

  private getAITaskType(planStep: WorkflowStep, plan: WorkflowPlan): string {
    const name = planStep.name.toLowerCase();
    const description = planStep.description.toLowerCase();

    if (name.includes('analyze') || description.includes('analyze')) {
      return 'analyze-data';
    } else if (name.includes('generate') || description.includes('generate')) {
      return 'generate-content';
    } else if (name.includes('search') || description.includes('search')) {
      return 'search-analyze';
    } else if (name.includes('recommend') || description.includes('recommend')) {
      return 'generate-recommendation';
    } else {
      return 'analyze-data';
    }
  }

  private generateAIPrompt(planStep: WorkflowStep, plan: WorkflowPlan): string {
    const basePrompt = planStep.description;
    
    // Add context-specific prompts based on the workflow category
    switch (plan.category) {
      case 'Social Media Research':
        return `${basePrompt}\n\nFocus on social media metrics, engagement patterns, and content analysis.`;
      
      case 'Marketing Automation':
        return `${basePrompt}\n\nConsider marketing best practices, personalization, and campaign effectiveness.`;
      
      case 'Data Analysis':
        return `${basePrompt}\n\nProvide statistical insights, trends, and actionable recommendations.`;
      
      default:
        return basePrompt;
    }
  }

  private generateAPIUrl(planStep: WorkflowStep, plan: WorkflowPlan): string {
    const name = planStep.name.toLowerCase();
    
    // LinkedIn-related APIs
    if (name.includes('influencer') || name.includes('search') && name.includes('linkedin')) {
      return '/api/linkedin/influencers';
    }
    if (name.includes('article') || name.includes('content') && name.includes('linkedin')) {
      return '/api/linkedin/articles';
    }
    
    // Email-related APIs
    if (name.includes('email') && name.includes('send')) {
      return '/api/email/send-bulk';
    }
    if (name.includes('campaign') && name.includes('email')) {
      return '/api/email/send-campaign';
    }
    
    // Data processing APIs
    if (name.includes('google') && name.includes('sheet')) {
      return '/api/data/google-sheets';
    }
    
    // Default to a generic workflow API
    return '/api/workflow/execute';
  }

  private generateAPIBody(planStep: WorkflowStep, plan: WorkflowPlan): Record<string, any> {
    const name = planStep.name.toLowerCase();
    const url = this.generateAPIUrl(planStep, plan);
    
    // LinkedIn influencers API
    if (url === '/api/linkedin/influencers') {
      return {
        keywords: ['tech', 'technology', 'AI', 'software', 'startup', 'innovation', 'entrepreneur'],
        limit: 10,
        filters: {
          industry: 'Technology',
          minFollowers: 1000,
          verified: true
        }
      };
    }
    
    // LinkedIn articles API
    if (url === '/api/linkedin/articles') {
      return {
        profileUrl: 'https://linkedin.com/in/tech-influencer', // Default profile URL
        limit: 5,
        sortBy: 'engagement',
        timeRange: '6months'
      };
    }
    
    // Email APIs
    if (url === '/api/email/send-bulk' || url === '/api/email/send-campaign') {
      return {
        template: 'personalized',
        batchSize: 50,
        delay: 1000 // 1 second between emails
      };
    }
    
    // Google Sheets API
    if (url === '/api/data/google-sheets') {
      return {
        operation: 'read',
        range: 'A1:Z1000',
        dataSourceId: 'google-sheets-1'
      };
    }
    
    // Default generic format
    return {
      stepName: planStep.name,
      data: {
        ...planStep.config,
        workflowName: plan.name,
        stepType: planStep.type
      }
    };
  }

  private getProcessingType(planStep: WorkflowStep, plan: WorkflowPlan): string {
    const name = planStep.name.toLowerCase();
    
    if (name.includes('rank') || name.includes('filter')) {
      return 'ranking';
    } else if (name.includes('compile') || name.includes('report')) {
      return 'compilation';
    } else if (name.includes('export') || name.includes('save')) {
      return 'export';
    } else {
      return 'default';
    }
  }

  private getProcessingConfig(planStep: WorkflowStep, plan: WorkflowPlan): Record<string, any> {
    const name = planStep.name.toLowerCase();
    
    if (name.includes('rank') || name.includes('filter')) {
      return {
        criteria: ['followers', 'engagement', 'tech_relevance', 'verified_status'],
        maxResults: 10
      };
    } else if (name.includes('compile') || name.includes('report')) {
      return {
        outputFormat: 'comprehensive_report',
        includeMetrics: true,
        includeRecommendations: true
      };
    } else if (name.includes('export') || name.includes('save')) {
      return {
        dataSource: 'google-sheets',
        operation: 'write',
        sheetName: plan.name.replace(/[^a-zA-Z0-9]/g, '_'),
        appendData: false
      };
    } else {
      return {};
    }
  }

  async executeWorkflow(workflowId: string): Promise<string> {
    try {
      console.log('🚀 Executing workflow:', workflowId);
      
      // First, verify the workflow exists
      console.log('🔍 Checking if workflow exists in database...');
      const workflow = await this.workflowEngine.getWorkflow(workflowId);
      if (!workflow) {
        console.error('❌ Workflow not found in database:', workflowId);
        throw new Error(`Workflow ${workflowId} not found in database`);
      }
      console.log('✅ Workflow found in database:', workflow.name);
      console.log('📋 Workflow details for execution:', {
        id: workflow.id,
        name: workflow.name,
        status: workflow.status,
        stepsCount: workflow.steps.length
      });
      
      console.log('🔄 Starting workflow execution...');
      const execution = await this.workflowEngine.executeWorkflow(workflowId, {});
      
      console.log('✅ Workflow execution started:', execution.id);
      console.log('📋 Execution details:', {
        id: execution.id,
        workflowId: execution.workflowId,
        status: execution.status
      });
      return execution.id;

    } catch (error) {
      console.error('❌ Error executing workflow:', error);
      throw new Error(`Failed to execute workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getWorkflowStatus(workflowId: string): Promise<any> {
    try {
      console.log('🔍 Getting workflow status for:', workflowId);
      
      // Try to get workflow from local cache first to avoid database queries
      const workflow = this.workflowEngine.getWorkflowFromCache(workflowId);
      if (!workflow) {
        console.log('📋 Workflow not in cache, fetching from database...');
        const dbWorkflow = await this.workflowEngine.getWorkflow(workflowId);
        if (!dbWorkflow) {
          throw new Error('Workflow not found');
        }
        return this.buildWorkflowStatus(dbWorkflow);
      }

      console.log('📋 Using cached workflow for status');
      return this.buildWorkflowStatus(workflow);
    } catch (error) {
      console.error('Error getting workflow status:', error);
      throw new Error(`Failed to get workflow status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildWorkflowStatus(workflow: any): any {
    // Get the latest execution for this workflow
    const executions = Array.from(this.workflowEngine.executions.values())
      .filter(exec => exec.workflowId === workflow.id)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    const latestExecution = executions[0];

    return {
      id: workflow.id,
      name: workflow.name,
      status: latestExecution ? latestExecution.status : workflow.status,
      steps: workflow.steps.map((step: any) => ({
        id: step.id,
        name: step.name,
        status: step.status,
        progress: this.calculateStepProgress(step)
      })),
      execution: latestExecution ? {
        id: latestExecution.id,
        status: latestExecution.status,
        startedAt: latestExecution.startedAt,
        completedAt: latestExecution.completedAt,
        totalDuration: latestExecution.totalDuration
      } : null
    };
  }

  private calculateStepProgress(step: any): number {
    switch (step.status) {
      case 'completed':
        return 100;
      case 'running':
        return 50;
      case 'failed':
        return 0;
      case 'paused':
        return 25;
      default:
        return 0;
    }
  }
}

export const workflowGenerator = new WorkflowGenerator();
export default workflowGenerator;

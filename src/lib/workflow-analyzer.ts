import { aiService } from './ai-service';

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

class WorkflowAnalyzer {
  private aiService = aiService;

  async analyzeUserRequest(userInput: string): Promise<WorkflowPlan> {
    try {
      console.log('🔍 WorkflowAnalyzer - Analyzing user request:', userInput);

      // Use AI to analyze the request and generate workflow steps
      const analysisPrompt = `Analyze this user request and break it down into a detailed workflow plan:

User Request: "${userInput}"

Please provide a comprehensive workflow analysis including:

1. Workflow Name: A clear, descriptive name
2. Description: Brief description of what the workflow accomplishes
3. Category: One of: "Social Media Research", "Marketing Automation", "Data Analysis", "Content Generation", "Email Automation", "Web Scraping", "General"
4. Complexity: "Low", "Medium", or "High" based on:
   - Number of steps
   - Technical requirements
   - External API dependencies
   - AI processing complexity

5. Workflow Steps: Break down the request into 3-8 logical steps. Each step should have:
   - Name: Clear, action-oriented name
   - Description: What this step accomplishes
   - Type: One of: "ai_action", "api_call", "data_processing", "user_input"
   - Estimated Duration: Realistic time estimate (e.g., "2s", "30s", "2m")
   - Dependencies: Which previous steps this depends on (use step IDs like "step-1", "step-2")
   - Configuration: Any specific settings or parameters needed

6. Estimated Total Time: Sum of all step durations
7. Tags: Relevant keywords for categorization

Format your response as a structured JSON object that I can parse directly.`;

      const aiResponse = await this.aiService.executeAIRequest({
        model: 'gemma3:1b',
        prompt: analysisPrompt,
        temperature: 0.3,
        maxTokens: 1500,
        context: { userInput }
      });

      // Parse AI response and create workflow plan
      const workflowPlan = this.parseAIResponse(aiResponse.result, userInput);
      
      console.log('✅ Generated workflow plan:', workflowPlan);
      return workflowPlan;

    } catch (error) {
      console.error('Error analyzing user request:', error);
      
      // Fallback to simple pattern matching if AI fails
      return this.fallbackAnalysis(userInput);
    }
  }

  private parseAIResponse(aiResponse: string, userInput: string): WorkflowPlan {
    try {
      // Try to extract JSON from the AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateAndFormatPlan(parsed, userInput);
      }
    } catch (error) {
      console.warn('Failed to parse AI response as JSON, using fallback');
    }

    // If JSON parsing fails, use pattern matching
    return this.fallbackAnalysis(userInput);
  }

  private validateAndFormatPlan(parsed: any, userInput: string): WorkflowPlan {
    const plan: WorkflowPlan = {
      id: `plan_${Date.now()}`,
      name: parsed.name || this.generateName(userInput),
      description: parsed.description || `A workflow to ${userInput.toLowerCase()}`,
      steps: this.formatSteps(parsed.steps || []),
      estimatedTotalTime: parsed.estimatedTotalTime || '10s',
      complexity: this.validateComplexity(parsed.complexity),
      category: parsed.category || 'General',
      tags: parsed.tags || this.extractTags(userInput)
    };

    return plan;
  }

  private formatSteps(steps: any[]): WorkflowStep[] {
    return steps.map((step, index) => ({
      id: step.id || `step-${index + 1}`,
      name: step.name || `Step ${index + 1}`,
      description: step.description || 'Process data',
      type: this.validateStepType(step.type),
      icon: this.getIconForType(step.type),
      estimatedDuration: step.estimatedDuration || '5s',
      dependencies: step.dependencies || [],
      config: step.config || {}
    }));
  }

  private validateStepType(type: string): 'ai_action' | 'api_call' | 'data_processing' | 'user_input' {
    const validTypes = ['ai_action', 'api_call', 'data_processing', 'user_input'];
    return validTypes.includes(type) ? type : 'data_processing';
  }

  private validateComplexity(complexity: string): 'Low' | 'Medium' | 'High' {
    const validComplexities = ['Low', 'Medium', 'High'];
    return validComplexities.includes(complexity) ? complexity : 'Medium';
  }

  private getIconForType(type: string): string {
    const iconMap: Record<string, string> = {
      'ai_action': 'Bot',
      'api_call': 'Zap',
      'data_processing': 'Database',
      'user_input': 'User'
    };
    return iconMap[type] || 'Settings';
  }

  private generateName(userInput: string): string {
    // Generate a simple name from the user input
    const words = userInput.split(' ').slice(0, 4);
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Workflow';
  }

  private extractTags(userInput: string): string[] {
    const commonTags = {
      'influencer': ['social-media', 'research', 'linkedin'],
      'email': ['email', 'automation', 'marketing'],
      'google sheets': ['data', 'spreadsheet', 'automation'],
      'analysis': ['data-analysis', 'insights'],
      'tech': ['technology', 'ai', 'software'],
      'linkedin': ['social-media', 'professional'],
      'content': ['content-generation', 'marketing'],
      'research': ['research', 'data-collection'],
      'automation': ['automation', 'workflow']
    };

    const lowerInput = userInput.toLowerCase();
    const tags: string[] = [];

    Object.entries(commonTags).forEach(([keyword, tagList]) => {
      if (lowerInput.includes(keyword)) {
        tags.push(...tagList);
      }
    });

    return [...new Set(tags)]; // Remove duplicates
  }

  private fallbackAnalysis(userInput: string): WorkflowPlan {
    const lowerInput = userInput.toLowerCase();
    
    // Pattern matching for common requests
    if (lowerInput.includes('influencer') || lowerInput.includes('linkedin') || lowerInput.includes('tech')) {
      return {
        id: `plan_${Date.now()}`,
        name: 'Tech Influencer Research & Analysis',
        description: 'Find top tech influencers and analyze their best LinkedIn articles',
        category: 'Social Media Research',
        complexity: 'High',
        estimatedTotalTime: '20s',
        tags: ['social-media', 'research', 'linkedin', 'tech'],
        steps: [
          {
            id: 'step-1',
            name: 'Define Search Strategy',
            description: 'AI generates optimal search keywords and criteria for tech influencers',
            type: 'ai_action',
            icon: 'Bot',
            estimatedDuration: '2s',
            dependencies: []
          },
          {
            id: 'step-2',
            name: 'Search Tech Influencers',
            description: 'Find top tech influencers on LinkedIn using defined criteria',
            type: 'api_call',
            icon: 'Users',
            estimatedDuration: '3s',
            dependencies: ['step-1']
          },
          {
            id: 'step-3',
            name: 'Filter and Rank Influencers',
            description: 'Rank influencers by relevance and influence metrics',
            type: 'data_processing',
            icon: 'TrendingUp',
            estimatedDuration: '1.5s',
            dependencies: ['step-2']
          },
          {
            id: 'step-4',
            name: 'Fetch Top Articles',
            description: 'Get 5 best articles from each selected influencer',
            type: 'api_call',
            icon: 'FileText',
            estimatedDuration: '4s',
            dependencies: ['step-3']
          },
          {
            id: 'step-5',
            name: 'Analyze Article Content',
            description: 'AI analyzes article content for tech relevance and quality',
            type: 'ai_action',
            icon: 'Bot',
            estimatedDuration: '3s',
            dependencies: ['step-4']
          },
          {
            id: 'step-6',
            name: 'Generate Influencer Insights',
            description: 'Create comprehensive insights and recommendations about each influencer',
            type: 'ai_action',
            icon: 'Bot',
            estimatedDuration: '2.5s',
            dependencies: ['step-5']
          },
          {
            id: 'step-7',
            name: 'Compile Research Report',
            description: 'Compile all findings into a comprehensive research report',
            type: 'data_processing',
            icon: 'FileText',
            estimatedDuration: '2s',
            dependencies: ['step-6']
          },
          {
            id: 'step-8',
            name: 'Export Results',
            description: 'Export research results to Google Sheets for further analysis',
            type: 'data_processing',
            icon: 'Database',
            estimatedDuration: '1.5s',
            dependencies: ['step-7']
          }
        ]
      };
    }

    if (lowerInput.includes('email') || lowerInput.includes('google sheets') || lowerInput.includes('contact')) {
      return {
        id: `plan_${Date.now()}`,
        name: 'Google Sheets Email Automation',
        description: 'Retrieve data from Google Sheets and send personalized emails to contacts',
        category: 'Marketing Automation',
        complexity: 'Medium',
        estimatedTotalTime: '15s',
        tags: ['email', 'automation', 'google-sheets', 'marketing'],
        steps: [
          {
            id: 'step-1',
            name: 'Load Google Sheets Data',
            description: 'Retrieve contact data from configured Google Sheets',
            type: 'data_processing',
            icon: 'Database',
            estimatedDuration: '2s',
            dependencies: []
          },
          {
            id: 'step-2',
            name: 'Analyze Contact Data',
            description: 'Use AI to analyze contact data and identify email preferences',
            type: 'ai_action',
            icon: 'Bot',
            estimatedDuration: '3s',
            dependencies: ['step-1']
          },
          {
            id: 'step-3',
            name: 'Generate Email Content',
            description: 'Generate personalized email content for each contact',
            type: 'ai_action',
            icon: 'Bot',
            estimatedDuration: '4s',
            dependencies: ['step-2']
          },
          {
            id: 'step-4',
            name: 'Send Emails',
            description: 'Send personalized emails to all contacts',
            type: 'api_call',
            icon: 'Zap',
            estimatedDuration: '5s',
            dependencies: ['step-3']
          },
          {
            id: 'step-5',
            name: 'Update Tracking Data',
            description: 'Update Google Sheets with email send status and results',
            type: 'data_processing',
            icon: 'Database',
            estimatedDuration: '1s',
            dependencies: ['step-4']
          }
        ]
      };
    }

    // Generic workflow for unknown requests
    return {
      id: `plan_${Date.now()}`,
      name: 'Custom Workflow',
      description: `A custom workflow to ${userInput.toLowerCase()}`,
      category: 'General',
      complexity: 'Medium',
      estimatedTotalTime: '10s',
      tags: ['custom', 'workflow'],
      steps: [
        {
          id: 'step-1',
          name: 'Analyze Request',
          description: 'AI analyzes your request and determines the best approach',
          type: 'ai_action',
          icon: 'Bot',
          estimatedDuration: '3s',
          dependencies: []
        },
        {
          id: 'step-2',
          name: 'Execute Task',
          description: 'Execute the main task based on the analysis',
          type: 'api_call',
          icon: 'Zap',
          estimatedDuration: '5s',
          dependencies: ['step-1']
        },
        {
          id: 'step-3',
          name: 'Generate Results',
          description: 'Generate and format the results',
          type: 'data_processing',
          icon: 'FileText',
          estimatedDuration: '2s',
          dependencies: ['step-2']
        }
      ]
    };
  }
}

export const workflowAnalyzer = new WorkflowAnalyzer();
export default workflowAnalyzer;

interface AIRequest {
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  context?: Record<string, any>;
}

interface AIResponse {
  result: string;
  confidence: number;
  reasoning: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

import { config } from './config';

class AIService {
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.baseUrl = config.ollama.baseUrl;
    this.defaultModel = config.ollama.defaultModel;
  }

  async executeAIRequest(request: AIRequest): Promise<AIResponse> {
    try {
      const prompt = this.buildPrompt(request.prompt, request.context);
      console.log('🤖 AI Service - Sending request to Ollama:');
      console.log('📝 Prompt:', prompt.substring(0, 200) + '...');
      console.log('🎯 Model:', request.model || this.defaultModel);
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model || this.defaultModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: request.temperature || 0.7,
            num_predict: request.maxTokens || 1000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('🤖 AI Service - Received response from Ollama:');
      console.log('📄 Response:', data.response?.substring(0, 200) + '...');
      
      return {
        result: data.response || 'No response generated',
        confidence: this.calculateConfidence(data.response),
        reasoning: this.extractReasoning(data.response),
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error(`AI request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildPrompt(prompt: string, context?: Record<string, any>): string {
    if (!context || Object.keys(context).length === 0) {
      return prompt;
    }

    const contextString = Object.entries(context)
      .map(([key, value]) => `${key}: ${this.safeStringify(value)}`)
      .join('\n');

    return `Context:\n${contextString}\n\nTask: ${prompt}`;
  }

  private safeStringify(obj: any, depth: number = 0): string {
    // Prevent infinite recursion
    if (depth > 10) {
      return '[Max depth reached]';
    }

    try {
      // Handle primitive types
      if (obj === null || obj === undefined) {
        return String(obj);
      }

      if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
        return String(obj);
      }

      // Handle arrays
      if (Array.isArray(obj)) {
        const items = obj.slice(0, 10).map(item => this.safeStringify(item, depth + 1));
        const suffix = obj.length > 10 ? `... (${obj.length - 10} more items)` : '';
        return `[${items.join(', ')}${suffix}]`;
      }

      // Handle objects
      if (typeof obj === 'object') {
        const entries = Object.entries(obj).slice(0, 10);
        const pairs = entries.map(([key, value]) => {
          // Skip functions and circular references
          if (typeof value === 'function') {
            return `${key}: [Function]`;
          }
          if (typeof value === 'object' && value !== null) {
            return `${key}: ${this.safeStringify(value, depth + 1)}`;
          }
          return `${key}: ${this.safeStringify(value, depth + 1)}`;
        });
        
        const suffix = Object.keys(obj).length > 10 ? `... (${Object.keys(obj).length - 10} more properties)` : '';
        return `{${pairs.join(', ')}${suffix}}`;
      }

      // Handle functions and other types
      return `[${typeof obj}]`;
    } catch (error) {
      return `[Error serializing: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }

  private calculateConfidence(response: string): number {
    // Simple confidence calculation based on response length and structure
    if (!response || response.length < 10) return 0.3;
    if (response.length < 50) return 0.6;
    if (response.length < 200) return 0.8;
    return 0.9;
  }

  private extractReasoning(response: string): string {
    // Try to extract reasoning from the response
    const reasoningPatterns = [
      /reasoning[:\s]+(.+?)(?:\n|$)/i,
      /because[:\s]+(.+?)(?:\n|$)/i,
      /since[:\s]+(.+?)(?:\n|$)/i,
      /based on[:\s]+(.+?)(?:\n|$)/i,
    ];

    for (const pattern of reasoningPatterns) {
      const match = response.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // If no explicit reasoning found, return first sentence
    const sentences = response.split(/[.!?]+/);
    return sentences[0]?.trim() || 'AI processed the request based on the provided context.';
  }

  async analyzeProductRequirements(inputs: Record<string, any>): Promise<AIResponse> {
    const prompt = `Analyze the following product requirements and identify key features for comparison:

Product Query: ${inputs.productQuery || 'Not specified'}
Max Price: ${inputs.maxPrice || 'Not specified'}
Category: ${inputs.category || 'Not specified'}

Please provide:
1. Key features to compare
2. Important specifications to look for
3. Price range recommendations
4. Any specific requirements or preferences

Format your response as a structured analysis.`;

    return this.executeAIRequest({
      model: 'gemma2:2b',
      prompt,
      temperature: 0.3,
      maxTokens: 500,
      context: inputs,
    });
  }

  async generateEmailResponse(inputs: Record<string, any>): Promise<AIResponse> {
    const prompt = `Generate a professional email response for the following:

Email Subject: ${inputs.subject || 'No subject'}
Email Content: ${inputs.content || 'No content'}
Customer Name: ${inputs.customerName || 'Valued Customer'}

Please generate an appropriate response that:
1. Addresses the customer's inquiry
2. Maintains a professional tone
3. Provides helpful information
4. Includes a call to action if appropriate

Format as a complete email response.`;

    return this.executeAIRequest({
      model: 'gemma2:2b',
      prompt,
      temperature: 0.5,
      maxTokens: 300,
      context: inputs,
    });
  }

  async analyzeData(inputs: Record<string, any>): Promise<AIResponse> {
    const prompt = `Analyze the following dataset and provide insights:

Dataset Type: ${inputs.datasetType || 'Unknown'}
Data Sample: ${JSON.stringify(inputs.dataSample || {}, null, 2)}
Analysis Type: ${inputs.analysisType || 'General'}

Please provide:
1. Key findings and patterns
2. Statistical insights
3. Recommendations
4. Potential issues or anomalies

Format your analysis in a clear, structured manner.`;

    return this.executeAIRequest({
      model: 'gemma2:2b',
      prompt,
      temperature: 0.2,
      maxTokens: 800,
      context: inputs,
    });
  }

  async generateContent(prompt: string, context?: Record<string, any>, model?: string, temperature?: number, maxTokens?: number): Promise<AIResponse> {
    return await this.executeAIRequest({
      model: model || 'gemma3:1b',
      prompt,
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 1000,
      context: context || {}
    });
  }

  async classifyData(prompt: string, context?: Record<string, any>, model?: string, temperature?: number, maxTokens?: number): Promise<AIResponse> {
    return await this.executeAIRequest({
      model: model || 'gemma3:1b',
      prompt,
      temperature: temperature || 0.3,
      maxTokens: maxTokens || 500,
      context: context || {}
    });
  }

  async extractInformation(prompt: string, context?: Record<string, any>, model?: string, temperature?: number, maxTokens?: number): Promise<AIResponse> {
    return await this.executeAIRequest({
      model: model || 'gemma3:1b',
      prompt,
      temperature: temperature || 0.2,
      maxTokens: maxTokens || 800,
      context: context || {}
    });
  }

  async summarizeContent(prompt: string, context?: Record<string, any>, model?: string, temperature?: number, maxTokens?: number): Promise<AIResponse> {
    return await this.executeAIRequest({
      model: model || 'gemma3:1b',
      prompt,
      temperature: temperature || 0.3,
      maxTokens: maxTokens || 600,
      context: context || {}
    });
  }

  async searchAndAnalyze(inputs: Record<string, any>): Promise<AIResponse> {
    const prompt = `Search and analyze information about:

Search Query: ${inputs.searchQuery || 'Not specified'}
Search Results: ${JSON.stringify(inputs.searchResults || {}, null, 2)}
Analysis Focus: ${inputs.analysisFocus || 'General analysis'}

Please provide:
1. Summary of findings
2. Key insights
3. Comparison if multiple results
4. Recommendations

Format your analysis in a structured way.`;

    return this.executeAIRequest({
      model: 'gemma2:2b',
      prompt,
      temperature: 0.4,
      maxTokens: 600,
      context: inputs,
    });
  }

  async generateRecommendation(inputs: Record<string, any>): Promise<AIResponse> {
    const prompt = `Generate a recommendation based on the following analysis:

Analysis Data: ${JSON.stringify(inputs.analysisData || {}, null, 2)}
User Preferences: ${JSON.stringify(inputs.userPreferences || {}, null, 2)}
Context: ${inputs.context || 'General recommendation needed'}

Please provide:
1. Clear recommendation
2. Reasoning behind the recommendation
3. Alternative options if applicable
4. Next steps or actions

Format as a professional recommendation.`;

    return this.executeAIRequest({
      model: 'gemma2:2b',
      prompt,
      temperature: 0.6,
      maxTokens: 400,
      context: inputs,
    });
  }

  async processWebContent(inputs: Record<string, any>): Promise<AIResponse> {
    const prompt = `Process and analyze the following web content:

URL: ${inputs.url || 'Not specified'}
Content: ${inputs.content || 'No content provided'}
Task: ${inputs.task || 'General processing'}

Please:
1. Extract key information
2. Identify important patterns
3. Summarize findings
4. Provide actionable insights

Format your analysis clearly.`;

    return this.executeAIRequest({
      model: 'gemma2:2b',
      prompt,
      temperature: 0.3,
      maxTokens: 700,
      context: inputs,
    });
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Ollama health check failed:', error);
      return false;
    }
  }

  // Get available models
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Failed to get available models:', error);
      return [];
    }
  }
}

// Singleton instance
export const aiService = new AIService();
export default aiService;

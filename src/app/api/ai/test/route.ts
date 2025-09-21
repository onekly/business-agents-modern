import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';

export async function GET() {
  try {
    // Test Ollama connection
    const isHealthy = await aiService.healthCheck();
    
    if (!isHealthy) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ollama is not running or not accessible',
          suggestion: 'Please ensure Ollama is running on http://localhost:11434'
        },
        { status: 503 }
      );
    }

    // Get available models
    const models = await aiService.getAvailableModels();
    
    return NextResponse.json({
      success: true,
      message: 'Ollama connection successful',
      models,
      defaultModel: 'gemma2:2b',
    });
  } catch (error) {
    console.error('AI Test Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Please check your Ollama installation and ensure it\'s running'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'gemma2:2b' } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const response = await aiService.executeAIRequest({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    });

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('AI Test Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

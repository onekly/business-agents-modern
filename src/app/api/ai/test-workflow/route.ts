import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model = 'gemma3:1b' } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Test AI service
    const response = await aiService.executeAIRequest({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 500,
      context: { test: true }
    });

    return NextResponse.json({
      success: true,
      response: response.result,
      confidence: response.confidence,
      reasoning: response.reasoning,
      usage: response.usage
    });

  } catch (error) {
    console.error('AI test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check if Ollama is running and the model is available'
      },
      { status: 500 }
    );
  }
}

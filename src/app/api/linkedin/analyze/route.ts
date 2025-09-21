import { NextRequest, NextResponse } from 'next/server';
import { linkedinScraper } from '@/lib/linkedin-scraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, articles } = body;

    if (!profile || !articles) {
      return NextResponse.json(
        { success: false, error: 'Profile and articles data are required' },
        { status: 400 }
      );
    }

    // Analyze influencer content
    const analysis = await linkedinScraper.analyzeInfluencerContent(profile, articles);

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('LinkedIn content analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

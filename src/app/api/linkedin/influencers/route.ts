import { NextRequest, NextResponse } from 'next/server';
import { linkedinScraper } from '@/lib/linkedin-scraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords = ['tech', 'technology', 'AI', 'software', 'startup'] } = body;

    // Search for tech influencers
    const result = await linkedinScraper.searchTechInfluencers(keywords);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('LinkedIn influencers search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get('keywords')?.split(',') || ['tech', 'technology', 'AI'];

    // Search for tech influencers
    const result = await linkedinScraper.searchTechInfluencers(keywords);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('LinkedIn influencers search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

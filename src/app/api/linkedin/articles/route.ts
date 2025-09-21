import { NextRequest, NextResponse } from 'next/server';
import { linkedinScraper } from '@/lib/linkedin-scraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileUrl, limit = 5 } = body;

    if (!profileUrl) {
      return NextResponse.json(
        { success: false, error: 'Profile URL is required' },
        { status: 400 }
      );
    }

    // Get top articles from the profile
    const result = await linkedinScraper.getTopArticles(profileUrl, limit);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('LinkedIn articles fetch error:', error);
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
    const profileUrl = searchParams.get('profileUrl');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!profileUrl) {
      return NextResponse.json(
        { success: false, error: 'Profile URL is required' },
        { status: 400 }
      );
    }

    // Get top articles from the profile
    const result = await linkedinScraper.getTopArticles(profileUrl, limit);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('LinkedIn articles fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

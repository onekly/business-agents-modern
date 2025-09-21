import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stepName, data } = body;

    console.log(`🧪 Test workflow step executed: ${stepName}`);

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock results based on step name
    let result;
    switch (stepName) {
      case 'Define Search Strategy':
        result = {
          keywords: ['tech', 'technology', 'AI', 'software', 'startup'],
          strategy: 'Focus on verified profiles with high engagement',
          criteria: ['followers > 100k', 'tech content > 70%', 'verified status']
        };
        break;
      case 'Search Tech Influencers':
        result = {
          totalFound: 8,
          influencers: [
            { name: 'Elon Musk', followers: 150000000, verified: true },
            { name: 'Satya Nadella', followers: 8500000, verified: true },
            { name: 'Jensen Huang', followers: 1200000, verified: true }
          ]
        };
        break;
      case 'Filter and Rank Influencers':
        result = {
          rankedInfluencers: [
            { name: 'Elon Musk', score: 95, rank: 1 },
            { name: 'Satya Nadella', score: 88, rank: 2 },
            { name: 'Jensen Huang', score: 92, rank: 3 }
          ],
          totalProcessed: 3
        };
        break;
      case 'Fetch Top Articles':
        result = {
          articlesFetched: 15,
          totalEngagement: 125000,
          topArticles: [
            { title: 'The Future of AI', likes: 12500, comments: 340 },
            { title: 'Building Scalable Software', likes: 8900, comments: 210 }
          ]
        };
        break;
      case 'Analyze Article Content':
        result = {
          analysisComplete: true,
          avgTechScore: 92,
          avgEngagementScore: 90,
          highInfluenceCount: 3
        };
        break;
      case 'Generate Influencer Insights':
        result = {
          insightsGenerated: true,
          keyFindings: [
            'Elon Musk leads in engagement and controversial tech takes',
            'Satya Nadella excels in enterprise tech and leadership content'
          ]
        };
        break;
      case 'Compile Research Report':
        result = {
          reportCompiled: true,
          totalInfluencers: 3,
          totalArticles: 15,
          reportSections: ['Executive Summary', 'Influencer Rankings', 'Content Analysis']
        };
        break;
      case 'Export Results':
        result = {
          exported: true,
          exportFormat: 'Google Sheets',
          sheetName: 'Influencer_Research',
          dataPoints: 45
        };
        break;
      default:
        result = {
          stepExecuted: true,
          stepName: stepName,
          timestamp: new Date().toISOString(),
          data: data
        };
    }

    return NextResponse.json({
      success: true,
      data: result,
      stepName: stepName,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test workflow API error:', error);
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
  return NextResponse.json({
    success: true,
    message: 'Test workflow API is running',
    timestamp: new Date().toISOString()
  });
}

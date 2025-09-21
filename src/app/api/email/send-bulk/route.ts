import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emails } = body;

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { success: false, error: 'Emails array is required' },
        { status: 400 }
      );
    }

    // Validate email format
    for (const email of emails) {
      if (!email.to || !email.subject || !email.content) {
        return NextResponse.json(
          { success: false, error: 'Each email must have to, subject, and content' },
          { status: 400 }
        );
      }
    }

    // Send bulk emails
    const results = await emailService.sendBulkEmails(emails);

    // Calculate success rate
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    const successRate = (successCount / totalCount) * 100;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount,
        successRate: Math.round(successRate * 100) / 100
      }
    });

  } catch (error) {
    console.error('Bulk email send error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}

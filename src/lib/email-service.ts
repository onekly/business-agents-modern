interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: string[];
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.EMAIL_SERVICE_URL || 'http://localhost:3001';
  }

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    try {
      // For now, we'll simulate email sending
      // In a real implementation, you'd integrate with SendGrid, AWS SES, etc.
      console.log('📧 Simulating email send:', {
        to: request.to,
        subject: request.subject,
        content: request.content.substring(0, 100) + '...'
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate success response
      return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendBulkEmails(emails: EmailRequest[]): Promise<EmailResponse[]> {
    const results: EmailResponse[] = [];
    
    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push(result);
      
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  async generateEmailContent(template: string, data: Record<string, any>): Promise<string> {
    // Simple template replacement
    let content = template;
    
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
    });
    
    return content;
  }

  async validateEmail(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      // In a real implementation, you'd check the email service status
      return true;
    } catch (error) {
      console.error('Email service health check failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export default emailService;

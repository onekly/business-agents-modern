import { Workflow } from '@/types/workflow';

export const workflowTemplates: Workflow[] = [
  {
    id: 'tech-influencer-research',
    name: 'Tech Influencer Research & Analysis',
    description: 'Find top tech influencers and analyze their best LinkedIn articles',
    version: '1.0.0',
    status: 'active',
    steps: [
      {
        id: 'step-1',
        type: 'ai_action',
        name: 'Define Search Strategy',
        description: 'Use AI to define optimal search keywords and criteria for tech influencers',
        status: 'pending',
        inputs: {
          industry: 'Technology',
          focus: 'AI, Software, Startups, Innovation'
        },
        outputs: {},
        dependencies: [],
        config: {
          taskType: 'analyze-data',
          model: 'gemma3:1b',
          prompt: 'Based on the tech industry focus, generate a comprehensive list of search keywords and criteria for finding the most relevant tech influencers. Consider factors like: follower count, engagement rate, content quality, industry expertise, and influence level. Provide specific keywords and search strategies.',
          temperature: 0.3,
          maxTokens: 500
        }
      },
      {
        id: 'step-2',
        type: 'api_call',
        name: 'Search Tech Influencers',
        description: 'Search LinkedIn for top tech influencers using the defined criteria',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-1'],
        config: {
          url: '/api/linkedin/influencers',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            keywords: ['tech', 'technology', 'AI', 'software', 'startup', 'innovation', 'entrepreneur']
          }
        }
      },
      {
        id: 'step-3',
        type: 'data_processing',
        name: 'Filter and Rank Influencers',
        description: 'Process and rank influencers based on relevance and influence metrics',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-2'],
        config: {
          processingType: 'ranking',
          criteria: ['followers', 'engagement', 'tech_relevance', 'verified_status'],
          maxResults: 10
        }
      },
      {
        id: 'step-4',
        type: 'api_call',
        name: 'Fetch Top Articles',
        description: 'Get the 5 best articles from each selected influencer',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-3'],
        config: {
          url: '/api/linkedin/articles',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            limit: 5
          }
        }
      },
      {
        id: 'step-5',
        type: 'ai_action',
        name: 'Analyze Article Content',
        description: 'Use AI to analyze article content for tech relevance and quality',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-4'],
        config: {
          taskType: 'analyze-data',
          model: 'gemma3:1b',
          prompt: 'Analyze the LinkedIn articles for:\n1. Tech relevance and expertise level\n2. Content quality and depth\n3. Engagement patterns and audience response\n4. Key topics and trends covered\n5. Influence and thought leadership indicators\n\nProvide detailed analysis and scoring for each article.',
          temperature: 0.2,
          maxTokens: 1000
        }
      },
      {
        id: 'step-6',
        type: 'ai_action',
        name: 'Generate Influencer Insights',
        description: 'Create comprehensive insights and recommendations about each influencer',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-5'],
        config: {
          taskType: 'generate-content',
          model: 'gemma3:1b',
          prompt: 'Based on the influencer analysis, generate comprehensive insights including:\n1. Overall influence score and ranking\n2. Key strengths and expertise areas\n3. Content strategy analysis\n4. Audience engagement patterns\n5. Collaboration potential and recommendations\n6. Top performing content themes\n\nFormat as a detailed report for each influencer.',
          temperature: 0.4,
          maxTokens: 1200
        }
      },
      {
        id: 'step-7',
        type: 'data_processing',
        name: 'Compile Research Report',
        description: 'Compile all findings into a comprehensive research report',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-6'],
        config: {
          processingType: 'compilation',
          outputFormat: 'comprehensive_report',
          includeMetrics: true,
          includeRecommendations: true
        }
      },
      {
        id: 'step-8',
        type: 'data_processing',
        name: 'Export Results',
        description: 'Export research results to Google Sheets for further analysis',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-7'],
        config: {
          dataSource: 'google-sheets',
          operation: 'write',
          sheetName: 'Influencer_Research',
          appendData: false
        }
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    tags: ['linkedin', 'influencers', 'tech', 'research', 'content-analysis'],
    category: 'Social Media Research',
    isTemplate: true,
    executionHistory: []
  },
  {
    id: 'google-sheets-email-automation',
    name: 'Google Sheets Email Automation',
    description: 'Retrieve data from Google Sheets and send personalized emails to contacts',
    version: '1.0.0',
    status: 'active',
    steps: [
      {
        id: 'step-1',
        type: 'data_processing',
        name: 'Load Google Sheets Data',
        description: 'Retrieve contact data from configured Google Sheets',
        status: 'pending',
        inputs: {
          dataSourceId: 'google-sheets-1',
          range: 'A1:Z1000'
        },
        outputs: {},
        dependencies: [],
        config: {
          dataSource: 'google-sheets',
          operation: 'read',
          sheetName: 'Contacts'
        }
      },
      {
        id: 'step-2',
        type: 'ai_action',
        name: 'Analyze Contact Data',
        description: 'Use AI to analyze contact data and identify email preferences',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-1'],
        config: {
          taskType: 'analyze-data',
          model: 'gemma3:1b',
          prompt: 'Analyze the contact data and identify:\n1. Contact preferences\n2. Best time to send emails\n3. Personalized content suggestions\n4. Email segmentation opportunities',
          temperature: 0.3,
          maxTokens: 800
        }
      },
      {
        id: 'step-3',
        type: 'ai_action',
        name: 'Generate Email Content',
        description: 'Generate personalized email content for each contact',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-2'],
        config: {
          taskType: 'generate-content',
          model: 'gemma3:1b',
          prompt: 'Generate personalized email content based on:\n- Contact name: {{name}}\n- Company: {{company}}\n- Previous interactions: {{interactions}}\n- Preferences: {{preferences}}\n\nCreate a professional, engaging email that feels personal and relevant.',
          temperature: 0.7,
          maxTokens: 500
        }
      },
      {
        id: 'step-4',
        type: 'api_call',
        name: 'Send Emails',
        description: 'Send personalized emails to all contacts',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-3'],
        config: {
          url: '/api/email/send-bulk',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      },
      {
        id: 'step-5',
        type: 'data_processing',
        name: 'Update Tracking Data',
        description: 'Update Google Sheets with email send status and results',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-4'],
        config: {
          dataSource: 'google-sheets',
          operation: 'update',
          sheetName: 'Email_Log',
          updateColumn: 'Status'
        }
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    tags: ['email', 'google-sheets', 'automation', 'marketing'],
    category: 'Marketing Automation',
    isTemplate: true,
    executionHistory: []
  },
  {
    id: 'customer-feedback-analysis',
    name: 'Customer Feedback Analysis',
    description: 'Analyze customer feedback from Google Sheets and generate insights',
    version: '1.0.0',
    status: 'active',
    steps: [
      {
        id: 'step-1',
        type: 'data_processing',
        name: 'Load Feedback Data',
        description: 'Retrieve customer feedback from Google Sheets',
        status: 'pending',
        inputs: {
          dataSourceId: 'google-sheets-feedback',
          range: 'A1:Z1000'
        },
        outputs: {},
        dependencies: [],
        config: {
          dataSource: 'google-sheets',
          operation: 'read',
          sheetName: 'Feedback'
        }
      },
      {
        id: 'step-2',
        type: 'ai_action',
        name: 'Analyze Sentiment',
        description: 'Use AI to analyze sentiment and categorize feedback',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-1'],
        config: {
          taskType: 'analyze-data',
          model: 'gemma3:1b',
          prompt: 'Analyze the customer feedback data and provide:\n1. Sentiment analysis (positive, negative, neutral)\n2. Common themes and topics\n3. Priority issues that need attention\n4. Positive feedback highlights\n5. Actionable recommendations',
          temperature: 0.2,
          maxTokens: 1000
        }
      },
      {
        id: 'step-3',
        type: 'ai_action',
        name: 'Generate Report',
        description: 'Generate a comprehensive feedback analysis report',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-2'],
        config: {
          taskType: 'generate-content',
          model: 'gemma3:1b',
          prompt: 'Create a professional feedback analysis report including:\n- Executive summary\n- Key findings and insights\n- Sentiment breakdown\n- Top issues and recommendations\n- Positive feedback highlights\n- Next steps and action items',
          temperature: 0.4,
          maxTokens: 1200
        }
      },
      {
        id: 'step-4',
        type: 'data_processing',
        name: 'Save Analysis Results',
        description: 'Save the analysis results back to Google Sheets',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-3'],
        config: {
          dataSource: 'google-sheets',
          operation: 'write',
          sheetName: 'Analysis_Results',
          appendData: true
        }
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    tags: ['analysis', 'google-sheets', 'feedback', 'insights'],
    category: 'Data Analysis',
    isTemplate: true,
    executionHistory: []
  },
  {
    id: 'lead-nurturing-campaign',
    name: 'Lead Nurturing Campaign',
    description: 'Automated lead nurturing using Google Sheets data and AI-generated content',
    version: '1.0.0',
    status: 'active',
    steps: [
      {
        id: 'step-1',
        type: 'data_processing',
        name: 'Load Lead Data',
        description: 'Retrieve lead information from Google Sheets',
        status: 'pending',
        inputs: {
          dataSourceId: 'google-sheets-leads',
          range: 'A1:Z1000'
        },
        outputs: {},
        dependencies: [],
        config: {
          dataSource: 'google-sheets',
          operation: 'read',
          sheetName: 'Leads'
        }
      },
      {
        id: 'step-2',
        type: 'ai_action',
        name: 'Segment Leads',
        description: 'Use AI to segment leads based on behavior and characteristics',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-1'],
        config: {
          taskType: 'analyze-data',
          model: 'gemma3:1b',
          prompt: 'Analyze the lead data and segment leads into categories:\n1. Hot leads (high priority, ready to buy)\n2. Warm leads (interested, need nurturing)\n3. Cold leads (low engagement, need re-engagement)\n4. Inactive leads (no recent activity)\n\nFor each segment, provide:\n- Segment criteria\n- Recommended approach\n- Content suggestions\n- Follow-up timeline',
          temperature: 0.3,
          maxTokens: 800
        }
      },
      {
        id: 'step-3',
        type: 'ai_action',
        name: 'Generate Personalized Content',
        description: 'Generate personalized email content for each lead segment',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-2'],
        config: {
          taskType: 'generate-content',
          model: 'gemma3:1b',
          prompt: 'Generate personalized email content for each lead segment:\n\nFor Hot Leads:\n- Urgent, action-oriented content\n- Clear value proposition\n- Strong call-to-action\n\nFor Warm Leads:\n- Educational content\n- Case studies and testimonials\n- Soft nurturing approach\n\nFor Cold Leads:\n- Re-engagement content\n- Special offers or incentives\n- Value-focused messaging\n\nFor Inactive Leads:\n- Win-back campaigns\n- Exclusive offers\n- Personal touch',
          temperature: 0.6,
          maxTokens: 600
        }
      },
      {
        id: 'step-4',
        type: 'api_call',
        name: 'Send Campaign Emails',
        description: 'Send segmented email campaigns to leads',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-3'],
        config: {
          url: '/api/email/send-campaign',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      },
      {
        id: 'step-5',
        type: 'data_processing',
        name: 'Update Lead Status',
        description: 'Update lead status and campaign results in Google Sheets',
        status: 'pending',
        inputs: {},
        outputs: {},
        dependencies: ['step-4'],
        config: {
          dataSource: 'google-sheets',
          operation: 'update',
          sheetName: 'Leads',
          updateColumn: 'Campaign_Status'
        }
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    tags: ['email', 'google-sheets', 'leads', 'nurturing', 'marketing'],
    category: 'Lead Management',
    isTemplate: true,
    executionHistory: []
  }
];

export default workflowTemplates;

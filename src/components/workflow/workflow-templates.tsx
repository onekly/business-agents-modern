'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  FileText, 
  Mail, 
  Database, 
  Globe, 
  Bot,
  Clock,
  Users,
  TrendingUp,
  Search,
  MessageSquare,
  BarChart3,
  Zap
} from 'lucide-react';
import { WorkflowTemplate } from '@/types/workflow';

interface WorkflowTemplatesProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
  onCreateCustom: () => void;
}

const templates: WorkflowTemplate[] = [
  {
    id: 'ecommerce-research',
    name: 'E-commerce Product Research',
    description: 'Research products, compare prices, and gather reviews across multiple platforms',
    category: 'Research',
    difficulty: 'intermediate',
    estimatedDuration: 15,
    icon: 'ShoppingCart',
    tags: ['ecommerce', 'research', 'pricing'],
    steps: [
      {
        type: 'ai_action',
        name: 'Analyze Product Requirements',
        description: 'AI analyzes the product description and requirements',
        dependencies: [],
        config: { model: 'gpt-4', temperature: 0.3 },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'api_call',
        name: 'Search Amazon Products',
        description: 'Search for products on Amazon using the product requirements',
        dependencies: ['analyze-requirements'],
        config: { 
          url: 'https://api.amazon.com/products/search',
          method: 'GET',
          headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
        },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'api_call',
        name: 'Search eBay Products',
        description: 'Search for products on eBay for price comparison',
        dependencies: ['analyze-requirements'],
        config: { 
          url: 'https://api.ebay.com/buy/browse/v1/item_summary/search',
          method: 'GET'
        },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'data_processing',
        name: 'Compare Prices and Reviews',
        description: 'Process and compare data from all sources',
        dependencies: ['search-amazon', 'search-ebay'],
        config: { processingType: 'price-comparison' },
        userApprovalRequired: true,
        maxRetries: 3,
      },
      {
        type: 'ai_action',
        name: 'Generate Recommendation',
        description: 'AI generates final recommendation with reasoning',
        dependencies: ['compare-prices'],
        config: { model: 'gpt-4', temperature: 0.7 },
        userApprovalRequired: true,
        maxRetries: 3,
      }
    ]
  },
  {
    id: 'email-automation',
    name: 'Smart Email Automation',
    description: 'Automatically process emails, categorize, and respond based on content',
    category: 'Communication',
    difficulty: 'advanced',
    estimatedDuration: 10,
    icon: 'Mail',
    tags: ['email', 'automation', 'ai'],
    steps: [
      {
        type: 'api_call',
        name: 'Fetch New Emails',
        description: 'Retrieve new emails from Gmail API',
        dependencies: [],
        config: { 
          url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages',
          method: 'GET'
        },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'ai_action',
        name: 'Analyze Email Content',
        description: 'AI analyzes email content for sentiment and intent',
        dependencies: ['fetch-emails'],
        config: { model: 'gpt-4', temperature: 0.2 },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'decision',
        name: 'Categorize Email',
        description: 'Categorize email based on AI analysis',
        dependencies: ['analyze-content'],
        config: { 
          condition: '${sentiment} === "urgent"',
          trueStep: 'urgent-response',
          falseStep: 'standard-response'
        },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'ai_action',
        name: 'Generate Response',
        description: 'Generate appropriate response based on category',
        dependencies: ['categorize-email'],
        config: { model: 'gpt-4', temperature: 0.5 },
        userApprovalRequired: true,
        maxRetries: 3,
      },
      {
        type: 'api_call',
        name: 'Send Response',
        description: 'Send the generated response via email',
        dependencies: ['generate-response'],
        config: { 
          url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          method: 'POST'
        },
        userApprovalRequired: true,
        maxRetries: 3,
      }
    ]
  },
  {
    id: 'data-analysis',
    name: 'Automated Data Analysis',
    description: 'Analyze datasets, generate insights, and create visualizations',
    category: 'Analytics',
    difficulty: 'advanced',
    estimatedDuration: 20,
    icon: 'BarChart3',
    tags: ['data', 'analysis', 'visualization'],
    steps: [
      {
        type: 'user_input',
        name: 'Upload Dataset',
        description: 'User uploads dataset for analysis',
        dependencies: [],
        config: { inputType: 'file', acceptedFormats: ['csv', 'xlsx', 'json'] },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'data_processing',
        name: 'Data Cleaning',
        description: 'Clean and preprocess the uploaded data',
        dependencies: ['upload-dataset'],
        config: { processingType: 'data-cleaning' },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'ai_action',
        name: 'Statistical Analysis',
        description: 'AI performs statistical analysis on the data',
        dependencies: ['data-cleaning'],
        config: { model: 'gpt-4', temperature: 0.1 },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'ai_action',
        name: 'Generate Insights',
        description: 'AI generates business insights from the analysis',
        dependencies: ['statistical-analysis'],
        config: { model: 'gpt-4', temperature: 0.7 },
        userApprovalRequired: true,
        maxRetries: 3,
      },
      {
        type: 'data_processing',
        name: 'Create Visualizations',
        description: 'Generate charts and graphs based on the data',
        dependencies: ['generate-insights'],
        config: { processingType: 'visualization' },
        userApprovalRequired: true,
        maxRetries: 3,
      }
    ]
  },
  {
    id: 'social-media-monitoring',
    name: 'Social Media Monitoring',
    description: 'Monitor social media mentions, analyze sentiment, and generate reports',
    category: 'Social Media',
    difficulty: 'intermediate',
    estimatedDuration: 12,
    icon: 'MessageSquare',
    tags: ['social-media', 'monitoring', 'sentiment'],
    steps: [
      {
        type: 'user_input',
        name: 'Define Search Terms',
        description: 'User defines keywords and hashtags to monitor',
        dependencies: [],
        config: { inputType: 'text', placeholder: 'Enter keywords, hashtags, or mentions' },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'api_call',
        name: 'Search Twitter',
        description: 'Search for mentions on Twitter/X',
        dependencies: ['define-search-terms'],
        config: { 
          url: 'https://api.twitter.com/2/tweets/search/recent',
          method: 'GET'
        },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'api_call',
        name: 'Search Reddit',
        description: 'Search for mentions on Reddit',
        dependencies: ['define-search-terms'],
        config: { 
          url: 'https://www.reddit.com/search.json',
          method: 'GET'
        },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'ai_action',
        name: 'Analyze Sentiment',
        description: 'AI analyzes sentiment of all collected mentions',
        dependencies: ['search-twitter', 'search-reddit'],
        config: { model: 'gpt-4', temperature: 0.3 },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'data_processing',
        name: 'Generate Report',
        description: 'Generate comprehensive monitoring report',
        dependencies: ['analyze-sentiment'],
        config: { processingType: 'report-generation' },
        userApprovalRequired: true,
        maxRetries: 3,
      }
    ]
  },
  {
    id: 'web-scraping',
    name: 'Intelligent Web Scraping',
    description: 'Scrape websites intelligently, extract structured data, and process content',
    category: 'Data Collection',
    difficulty: 'intermediate',
    estimatedDuration: 18,
    icon: 'Globe',
    tags: ['scraping', 'data-collection', 'automation'],
    steps: [
      {
        type: 'user_input',
        name: 'Define Target URLs',
        description: 'User provides URLs to scrape',
        dependencies: [],
        config: { inputType: 'text', placeholder: 'Enter URLs separated by commas' },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'ai_action',
        name: 'Analyze Page Structure',
        description: 'AI analyzes the structure of target pages',
        dependencies: ['define-target-urls'],
        config: { model: 'gpt-4', temperature: 0.2 },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'api_call',
        name: 'Scrape Content',
        description: 'Scrape content from the target URLs',
        dependencies: ['analyze-page-structure'],
        config: { 
          url: 'https://api.scrapingbee.com/v1/',
          method: 'POST'
        },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'ai_action',
        name: 'Extract Structured Data',
        description: 'AI extracts structured data from scraped content',
        dependencies: ['scrape-content'],
        config: { model: 'gpt-4', temperature: 0.1 },
        userApprovalRequired: true,
        maxRetries: 3,
      },
      {
        type: 'data_processing',
        name: 'Clean and Format Data',
        description: 'Clean and format the extracted data',
        dependencies: ['extract-structured-data'],
        config: { processingType: 'data-cleaning' },
        userApprovalRequired: true,
        maxRetries: 3,
      }
    ]
  },
  {
    id: 'customer-support',
    name: 'AI Customer Support',
    description: 'Automated customer support with ticket routing and response generation',
    category: 'Support',
    difficulty: 'advanced',
    estimatedDuration: 25,
    icon: 'Users',
    tags: ['customer-support', 'automation', 'ai'],
    steps: [
      {
        type: 'api_call',
        name: 'Fetch Support Tickets',
        description: 'Retrieve new support tickets from the system',
        dependencies: [],
        config: { 
          url: 'https://api.support-system.com/tickets',
          method: 'GET'
        },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'ai_action',
        name: 'Analyze Ticket Content',
        description: 'AI analyzes ticket content and categorizes issues',
        dependencies: ['fetch-support-tickets'],
        config: { model: 'gpt-4', temperature: 0.2 },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'decision',
        name: 'Route Ticket',
        description: 'Route ticket to appropriate department or AI response',
        dependencies: ['analyze-ticket-content'],
        config: { 
          condition: '${complexity} === "simple"',
          trueStep: 'generate-ai-response',
          falseStep: 'escalate-to-human'
        },
        userApprovalRequired: false,
        maxRetries: 3,
      },
      {
        type: 'ai_action',
        name: 'Generate AI Response',
        description: 'Generate automated response for simple tickets',
        dependencies: ['route-ticket'],
        config: { model: 'gpt-4', temperature: 0.5 },
        userApprovalRequired: true,
        maxRetries: 3,
      },
      {
        type: 'api_call',
        name: 'Send Response',
        description: 'Send response back to customer',
        dependencies: ['generate-ai-response'],
        config: { 
          url: 'https://api.support-system.com/tickets/{id}/respond',
          method: 'POST'
        },
        userApprovalRequired: true,
        maxRetries: 3,
      }
    ]
  }
];

const iconMap = {
  ShoppingCart,
  Mail,
  Database,
  Globe,
  Bot,
  Clock,
  Users,
  TrendingUp,
  Search,
  MessageSquare,
  BarChart3,
  Zap,
};

export default function WorkflowTemplates({ onSelectTemplate, onCreateCustom }: WorkflowTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow Templates</h1>
            <p className="text-gray-600 mt-1">Choose a pre-built workflow or create your own</p>
          </div>
          <Button onClick={onCreateCustom} size="lg">
            <Zap className="w-5 h-5 mr-2" />
            Create Custom Workflow
          </Button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => {
            const Icon = iconMap[template.icon as keyof typeof iconMap] || Bot;
            
            return (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => onSelectTemplate(template)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {template.estimatedDuration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Bot className="w-4 h-4" />
                        {template.steps.length} steps
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="pt-2">
                      <Button className="w-full group-hover:bg-blue-600 transition-colors">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

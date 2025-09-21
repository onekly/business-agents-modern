'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Users,
  FileText,
  TrendingUp,
  Bot,
  RefreshCw,
  ExternalLink,
  Star,
  MessageCircle,
  Share2,
  Eye
} from 'lucide-react';

interface Influencer {
  name: string;
  title: string;
  company: string;
  followers: number;
  profileUrl: string;
  location: string;
  industry: string;
  bio: string;
  verified: boolean;
}

interface Article {
  id: string;
  title: string;
  content: string;
  publishedDate: string;
  url: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  tags: string[];
  author: {
    name: string;
    profileUrl: string;
  };
}

interface InfluencerAnalysis {
  techScore: number;
  engagementScore: number;
  contentQuality: number;
  influenceLevel: 'High' | 'Medium' | 'Low';
  keyTopics: string[];
  recommendations: string[];
}

export default function InfluencerResearchDemo() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepResults, setStepResults] = useState<Record<string, any>>({});
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, InfluencerAnalysis>>({});

  const workflowSteps = [
    {
      id: 'step-1',
      name: 'Define Search Strategy',
      description: 'AI generates optimal search keywords for tech influencers',
      icon: Bot,
      type: 'ai'
    },
    {
      id: 'step-2',
      name: 'Search Tech Influencers',
      description: 'Find top tech influencers on LinkedIn',
      icon: Users,
      type: 'api'
    },
    {
      id: 'step-3',
      name: 'Filter and Rank',
      description: 'Rank influencers by relevance and influence',
      icon: TrendingUp,
      type: 'data'
    },
    {
      id: 'step-4',
      name: 'Fetch Top Articles',
      description: 'Get 5 best articles from each influencer',
      icon: FileText,
      type: 'api'
    },
    {
      id: 'step-5',
      name: 'Analyze Content',
      description: 'AI analyzes article content and quality',
      icon: Bot,
      type: 'ai'
    },
    {
      id: 'step-6',
      name: 'Generate Insights',
      description: 'Create comprehensive influencer insights',
      icon: Bot,
      type: 'ai'
    },
    {
      id: 'step-7',
      name: 'Compile Report',
      description: 'Compile all findings into research report',
      icon: FileText,
      type: 'data'
    },
    {
      id: 'step-8',
      name: 'Export Results',
      description: 'Export results to Google Sheets',
      icon: ExternalLink,
      type: 'data'
    }
  ];

  const executeWorkflow = async () => {
    setIsExecuting(true);
    setIsPaused(false);
    setCurrentStep(0);
    setStepResults({});
    setInfluencers([]);
    setArticles([]);
    setAnalyses({});

    try {
      // Step 1: Define Search Strategy
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStepResults(prev => ({
        ...prev,
        'step-1': {
          keywords: ['tech', 'technology', 'AI', 'software', 'startup', 'innovation', 'entrepreneur'],
          strategy: 'Focus on verified profiles with high engagement and tech expertise',
          criteria: ['followers > 100k', 'tech content > 70%', 'verified status', 'high engagement rate']
        }
      }));

      // Step 2: Search Tech Influencers
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockInfluencers: Influencer[] = [
        {
          name: 'Elon Musk',
          title: 'CEO at Tesla, SpaceX',
          company: 'Tesla',
          followers: 150000000,
          profileUrl: 'https://linkedin.com/in/elonmusk',
          location: 'Austin, Texas',
          industry: 'Technology',
          bio: 'CEO of Tesla and SpaceX, focused on sustainable energy and space exploration',
          verified: true
        },
        {
          name: 'Satya Nadella',
          title: 'CEO at Microsoft',
          company: 'Microsoft',
          followers: 8500000,
          profileUrl: 'https://linkedin.com/in/satyanadella',
          location: 'Redmond, Washington',
          industry: 'Technology',
          bio: 'CEO of Microsoft, focused on empowering every person and organization on the planet',
          verified: true
        },
        {
          name: 'Jensen Huang',
          title: 'CEO at NVIDIA',
          company: 'NVIDIA',
          followers: 1200000,
          profileUrl: 'https://linkedin.com/in/jensen-huang',
          location: 'Santa Clara, California',
          industry: 'Technology',
          bio: 'CEO of NVIDIA, pioneer in AI and graphics computing',
          verified: true
        },
        {
          name: 'Reid Hoffman',
          title: 'Co-founder at LinkedIn, Partner at Greylock',
          company: 'Greylock Partners',
          followers: 3200000,
          profileUrl: 'https://linkedin.com/in/reidhoffman',
          location: 'San Francisco Bay Area',
          industry: 'Technology',
          bio: 'Co-founder of LinkedIn, partner at Greylock, author of "The Startup of You"',
          verified: true
        },
        {
          name: 'Marc Andreessen',
          title: 'Co-founder and General Partner at Andreessen Horowitz',
          company: 'Andreessen Horowitz',
          followers: 1800000,
          profileUrl: 'https://linkedin.com/in/pmarca',
          location: 'Menlo Park, California',
          industry: 'Technology',
          bio: 'Co-founder of Andreessen Horowitz, co-founder of Netscape',
          verified: true
        }
      ];
      setInfluencers(mockInfluencers);
      setStepResults(prev => ({
        ...prev,
        'step-2': {
          totalFound: mockInfluencers.length,
          topInfluencers: mockInfluencers.slice(0, 3).map(i => i.name)
        }
      }));

      // Step 3: Filter and Rank
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStepResults(prev => ({
        ...prev,
        'step-3': {
          rankingCriteria: ['followers', 'engagement', 'tech_relevance', 'verified_status'],
          topRanked: mockInfluencers.slice(0, 3).map(i => ({ name: i.name, score: Math.random() * 100 }))
        }
      }));

      // Step 4: Fetch Top Articles
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 4000));
      const mockArticles: Article[] = [
        {
          id: 'article_1',
          title: 'The Future of AI: How Machine Learning Will Transform Every Industry',
          content: 'Artificial Intelligence is no longer a futuristic concept. It\'s here, and it\'s transforming every industry from healthcare to finance...',
          publishedDate: '2024-01-15',
          url: 'https://linkedin.com/posts/ai-future-2024',
          likes: 12500,
          comments: 340,
          shares: 890,
          views: 45000,
          tags: ['AI', 'Machine Learning', 'Technology', 'Future'],
          author: { name: 'Elon Musk', profileUrl: 'https://linkedin.com/in/elonmusk' }
        },
        {
          id: 'article_2',
          title: 'Building Scalable Software: Lessons from 20 Years in Tech',
          content: 'After two decades in the technology industry, I\'ve learned that building scalable software isn\'t just about writing good code...',
          publishedDate: '2024-01-10',
          url: 'https://linkedin.com/posts/scalable-software-lessons',
          likes: 8900,
          comments: 210,
          shares: 450,
          views: 32000,
          tags: ['Software Development', 'Scalability', 'Leadership', 'Technology'],
          author: { name: 'Satya Nadella', profileUrl: 'https://linkedin.com/in/satyanadella' }
        },
        {
          id: 'article_3',
          title: 'The Startup Playbook: How to Build a Tech Company from Zero',
          content: 'Starting a tech company is both exciting and challenging. Having founded and scaled multiple startups...',
          publishedDate: '2024-01-05',
          url: 'https://linkedin.com/posts/startup-playbook-2024',
          likes: 15600,
          comments: 520,
          shares: 1200,
          views: 67000,
          tags: ['Startup', 'Entrepreneurship', 'Technology', 'Business'],
          author: { name: 'Reid Hoffman', profileUrl: 'https://linkedin.com/in/reidhoffman' }
        }
      ];
      setArticles(mockArticles);
      setStepResults(prev => ({
        ...prev,
        'step-4': {
          articlesFetched: mockArticles.length,
          totalEngagement: mockArticles.reduce((sum, a) => sum + a.likes + a.comments + a.shares, 0)
        }
      }));

      // Step 5: Analyze Content
      setCurrentStep(5);
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockAnalyses: Record<string, InfluencerAnalysis> = {
        'elonmusk': {
          techScore: 95,
          engagementScore: 98,
          contentQuality: 92,
          influenceLevel: 'High',
          keyTopics: ['AI', 'Space', 'Technology', 'Innovation', 'Future'],
          recommendations: ['Continue focusing on cutting-edge tech topics', 'Maintain high engagement through controversial takes']
        },
        'satyanadella': {
          techScore: 88,
          engagementScore: 85,
          contentQuality: 90,
          influenceLevel: 'High',
          keyTopics: ['Cloud Computing', 'AI', 'Productivity', 'Leadership', 'Innovation'],
          recommendations: ['Share more technical deep-dives', 'Increase personal storytelling']
        },
        'reidhoffman': {
          techScore: 92,
          engagementScore: 88,
          contentQuality: 94,
          influenceLevel: 'High',
          keyTopics: ['Startups', 'Entrepreneurship', 'Networking', 'Technology', 'Investment'],
          recommendations: ['Continue thought leadership in entrepreneurship', 'Share more case studies']
        }
      };
      setAnalyses(mockAnalyses);
      setStepResults(prev => ({
        ...prev,
        'step-5': {
          analysisComplete: true,
          avgTechScore: 92,
          avgEngagementScore: 90,
          highInfluenceCount: 3
        }
      }));

      // Step 6: Generate Insights
      setCurrentStep(6);
      await new Promise(resolve => setTimeout(resolve, 2500));
      setStepResults(prev => ({
        ...prev,
        'step-6': {
          insightsGenerated: true,
          keyFindings: [
            'Elon Musk leads in engagement and controversial tech takes',
            'Satya Nadella excels in enterprise tech and leadership content',
            'Reid Hoffman dominates startup and entrepreneurship content'
          ]
        }
      }));

      // Step 7: Compile Report
      setCurrentStep(7);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStepResults(prev => ({
        ...prev,
        'step-7': {
          reportCompiled: true,
          totalInfluencers: mockInfluencers.length,
          totalArticles: mockArticles.length,
          reportSections: ['Executive Summary', 'Influencer Rankings', 'Content Analysis', 'Recommendations']
        }
      }));

      // Step 8: Export Results
      setCurrentStep(8);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStepResults(prev => ({
        ...prev,
        'step-8': {
          exported: true,
          exportFormat: 'Google Sheets',
          sheetName: 'Influencer_Research',
          dataPoints: mockInfluencers.length * 5 + mockArticles.length
        }
      }));

      setIsExecuting(false);

    } catch (error) {
      console.error('Workflow execution failed:', error);
      setIsExecuting(false);
    }
  };

  const pauseWorkflow = () => {
    setIsPaused(true);
    setIsExecuting(false);
  };

  const resetWorkflow = () => {
    setIsExecuting(false);
    setIsPaused(false);
    setCurrentStep(0);
    setStepResults({});
    setInfluencers([]);
    setArticles([]);
    setAnalyses({});
  };

  const getStepIcon = (step: any) => {
    const Icon = step.icon;
    return <Icon className="w-4 h-4" />;
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep && isExecuting) return 'running';
    if (stepIndex === currentStep && isPaused) return 'paused';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tech Influencer Research & Analysis
        </h1>
        <p className="text-gray-600">
          Find top tech influencers and analyze their best LinkedIn articles using AI
        </p>
      </div>

      {/* Workflow Status */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Workflow Status</CardTitle>
            <div className="flex gap-2">
              {!isExecuting && !isPaused && (
                <Button onClick={executeWorkflow} className="bg-blue-600 hover:bg-blue-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start Research
                </Button>
              )}
              {isExecuting && (
                <Button onClick={pauseWorkflow} variant="outline">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              {(isExecuting || isPaused || currentStep > 0) && (
                <Button onClick={resetWorkflow} variant="outline">
                  <Square className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className={currentStep === 8 ? 'bg-green-100 text-green-800' : isExecuting ? 'bg-blue-100 text-blue-800' : isPaused ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
              {currentStep === 8 ? 'Completed' : isExecuting ? 'Running' : isPaused ? 'Paused' : 'Ready'}
            </Badge>
            <span className="text-sm text-gray-600">
              Step {currentStep} of {workflowSteps.length} • 
              {currentStep > 0 && ` ${Math.round((currentStep / workflowSteps.length) * 100)}% Complete`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {workflowSteps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <Card key={step.id} className={`transition-all ${
              status === 'running' ? 'border-blue-500 bg-blue-50' : 
              status === 'completed' ? 'border-green-500 bg-green-50' :
              status === 'paused' ? 'border-yellow-500 bg-yellow-50' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(status)}
                  <span className="font-medium text-sm">{index + 1}.</span>
                  {getStepIcon(step)}
                </div>
                <h3 className="font-medium text-gray-900 text-sm mb-1">{step.name}</h3>
                <p className="text-xs text-gray-600">{step.description}</p>
                <div className="mt-2">
                  <Badge className={
                    status === 'completed' ? 'bg-green-100 text-green-800' :
                    status === 'running' ? 'bg-blue-100 text-blue-800' :
                    status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Results Display */}
      {currentStep > 0 && (
        <div className="space-y-6">
          {/* Influencers */}
          {influencers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Top Tech Influencers Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {influencers.map((influencer, index) => (
                    <div key={influencer.name} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{influencer.name}</h3>
                          <p className="text-sm text-gray-600">{influencer.title}</p>
                        </div>
                        {influencer.verified && (
                          <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {formatNumber(influencer.followers)} followers
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{influencer.bio}</p>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={influencer.profileUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Profile
                          </a>
                        </Button>
                        {analyses[influencer.name.toLowerCase().replace(' ', '')] && (
                          <Badge className="bg-green-100 text-green-800">
                            {analyses[influencer.name.toLowerCase().replace(' ', '')].influenceLevel} Influence
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Articles */}
          {articles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Top Articles Analyzed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div key={article.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{article.title}</h3>
                        <Badge className="bg-gray-100 text-gray-800">
                          {new Date(article.publishedDate).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{article.content.substring(0, 150)}...</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {formatNumber(article.likes)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {formatNumber(article.comments)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="w-4 h-4" />
                          {formatNumber(article.shares)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {formatNumber(article.views || 0)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Read Article
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {Object.keys(analyses).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Influencer Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analyses).map(([key, analysis]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()} Analysis
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Tech Score:</span>
                          <span className="font-medium">{analysis.techScore}/100</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Engagement:</span>
                          <span className="font-medium">{analysis.engagementScore}/100</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Content Quality:</span>
                          <span className="font-medium">{analysis.contentQuality}/100</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Influence Level:</span>
                          <Badge className={
                            analysis.influenceLevel === 'High' ? 'bg-green-100 text-green-800' :
                            analysis.influenceLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {analysis.influenceLevel}
                          </Badge>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Key Topics:</h4>
                        <div className="flex flex-wrap gap-1">
                          {analysis.keyTopics.map((topic) => (
                            <Badge key={topic} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendations:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {analysis.recommendations.map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Stats */}
          {currentStep >= 7 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Research Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{influencers.length}</div>
                    <div className="text-sm text-gray-600">Influencers Found</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{articles.length}</div>
                    <div className="text-sm text-gray-600">Articles Analyzed</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.values(analyses).filter(a => a.influenceLevel === 'High').length}
                    </div>
                    <div className="text-sm text-gray-600">High Influence</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(articles.reduce((sum, a) => sum + a.likes + a.comments + a.shares, 0) / articles.length)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Engagement</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

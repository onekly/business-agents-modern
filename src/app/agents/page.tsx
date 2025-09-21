"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Trash2,
  Edit,
  MoreVertical,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Brain,
  Zap
} from "lucide-react"
import Link from "next/link"
import ModernSidebar from "@/components/modern-sidebar"

// Mock data - in real app this would come from API
const agents = [
  {
    id: 1,
    name: "Data Collection Agent",
    type: "Data Processing",
    status: "active",
    tasks: 45,
    success_rate: 94,
    last_run: "2 minutes ago",
    description: "Automatically collects and processes data from various sources including APIs, websites, and databases.",
    capabilities: ["Web Scraping", "API Integration", "Data Validation"],
    uptime: "99.2%"
  },
  {
    id: 2,
    name: "Market Research Agent",
    type: "Analysis",
    status: "idle",
    tasks: 23,
    success_rate: 87,
    last_run: "1 hour ago",
    description: "Conducts comprehensive market research and competitive analysis using multiple data sources.",
    capabilities: ["Trend Analysis", "Competitor Research", "Market Insights"],
    uptime: "97.8%"
  },
  {
    id: 3,
    name: "Report Generation Agent",
    type: "Content",
    status: "active",
    tasks: 12,
    success_rate: 96,
    last_run: "5 minutes ago",
    description: "Generates comprehensive business reports and insights with customizable templates.",
    capabilities: ["Report Templates", "Data Visualization", "Executive Summaries"],
    uptime: "98.5%"
  },
  {
    id: 4,
    name: "Social Media Monitor",
    type: "Monitoring",
    status: "idle",
    tasks: 67,
    success_rate: 89,
    last_run: "30 minutes ago",
    description: "Monitors social media platforms for brand mentions, sentiment analysis, and trend detection.",
    capabilities: ["Sentiment Analysis", "Brand Monitoring", "Trend Detection"],
    uptime: "96.3%"
  },
  {
    id: 5,
    name: "Email Marketing Agent",
    type: "Marketing",
    status: "active",
    tasks: 34,
    success_rate: 92,
    last_run: "10 minutes ago",
    description: "Automates email marketing campaigns and personalizes content based on user behavior.",
    capabilities: ["Campaign Automation", "Personalization", "A/B Testing"],
    uptime: "98.1%"
  },
  {
    id: 6,
    name: "Customer Support Agent",
    type: "Support",
    status: "idle",
    tasks: 89,
    success_rate: 95,
    last_run: "2 hours ago",
    description: "Handles customer inquiries and provides automated responses using natural language processing.",
    capabilities: ["NLP Processing", "Ticket Routing", "Response Generation"],
    uptime: "99.0%"
  }
]

export default function Agents() {
  const totalAgents = agents.length
  const activeAgents = agents.filter(agent => agent.status === 'active').length
  const totalTasks = agents.reduce((sum, agent) => sum + agent.tasks, 0)
  const avgSuccessRate = Math.round(agents.reduce((sum, agent) => sum + agent.success_rate, 0) / totalAgents)

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernSidebar />
      
      <div className="lg:pl-72">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
              <p className="text-gray-600 mt-1">Manage and monitor your AI agents across all business functions.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/chat">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
                  <Bot className="mr-2 h-4 w-4" />
                  Chat with Agents
                </Button>
              </Link>
              <Button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700">
                <Plus className="mr-2 h-4 w-4" />
                Create New Agent
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Agents</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bot className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{totalAgents}</div>
                <p className="text-xs text-gray-500 mt-1">Across all functions</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Agents</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{activeAgents}</div>
                <p className="text-xs text-gray-500 mt-1">Currently running</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{totalTasks}</div>
                <p className="text-xs text-gray-500 mt-1">Completed this month</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{avgSuccessRate}%</div>
                <p className="text-xs text-gray-500 mt-1">Average across all agents</p>
              </CardContent>
            </Card>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Bot className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">{agent.name}</CardTitle>
                        <CardDescription className="text-gray-500">{agent.type}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={agent.status === 'active' ? 'success' : 'secondary'}
                        className="text-xs"
                      >
                        {agent.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed">{agent.description}</p>
                  
                  {/* Capabilities */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Capabilities</h4>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map((capability, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tasks</p>
                      <p className="font-semibold text-gray-900">{agent.tasks}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Success Rate</p>
                      <p className="font-semibold text-gray-900">{agent.success_rate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Uptime</p>
                      <p className="font-semibold text-gray-900">{agent.uptime}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Run</p>
                      <p className="font-semibold text-gray-900">{agent.last_run}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                    >
                      {agent.status === 'active' ? (
                        <>
                          <Pause className="mr-1 h-3 w-3" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-1 h-3 w-3" />
                          Start
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <Settings className="mr-1 h-3 w-3" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State for when no agents */}
          {agents.length === 0 && (
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <Bot className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents yet</h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  Create your first AI agent to automate business processes and gain valuable insights.
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Agent
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

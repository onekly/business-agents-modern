"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  Database, 
  Zap, 
  BarChart3, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Activity,
  TrendingUp,
  Users,
  MessageSquare,
  Brain,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
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
    description: "Automatically collects and processes data from various sources"
  },
  {
    id: 2,
    name: "Market Research Agent",
    type: "Analysis",
    status: "idle",
    tasks: 23,
    success_rate: 87,
    last_run: "1 hour ago",
    description: "Conducts market research and competitive analysis"
  },
  {
    id: 3,
    name: "Report Generation Agent",
    type: "Content",
    status: "active",
    tasks: 12,
    success_rate: 96,
    last_run: "5 minutes ago",
    description: "Generates comprehensive business reports and insights"
  },
  {
    id: 4,
    name: "Social Media Monitor",
    type: "Monitoring",
    status: "idle",
    tasks: 67,
    success_rate: 89,
    last_run: "30 minutes ago",
    description: "Monitors social media for brand mentions and trends"
  }
]

const recentActivity = [
  {
    id: 1,
    type: "success",
    message: "Data Collection Agent completed 5 tasks successfully",
    time: "2 minutes ago",
    icon: CheckCircle
  },
  {
    id: 2,
    type: "info",
    message: "New market research report generated",
    time: "15 minutes ago",
    icon: BarChart3
  },
  {
    id: 3,
    type: "warning",
    message: "Social Media Monitor encountered rate limit",
    time: "1 hour ago",
    icon: AlertCircle
  },
  {
    id: 4,
    type: "success",
    message: "Report Generation Agent created executive summary",
    time: "2 hours ago",
    icon: FileText
  }
]

export default function Dashboard() {
  const totalAgents = agents.length
  const activeAgents = agents.filter(agent => agent.status === 'active').length
  const totalTasks = agents.reduce((sum, agent) => sum + agent.tasks, 0)
  const overallSuccessRate = totalAgents > 0
    ? Math.round(agents.reduce((sum, agent) => sum + agent.success_rate, 0) / totalAgents)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernSidebar />
      
      <div className="lg:pl-72">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your AI agents.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/chat">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat with Agents
                </Button>
              </Link>
              <Link href="/agents">
                <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Agents
                </Button>
              </Link>
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
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +2 from last week
                </p>
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
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1 text-blue-500" />
                  Running now
                </p>
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
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +180 this month
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{overallSuccessRate}%</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +5% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* AI Agents Status */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <Brain className="mr-2 h-5 w-5 text-purple-600" />
                    AI Agents Status
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Monitor and manage your AI agents in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Bot className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{agent.name}</p>
                            <p className="text-sm text-gray-500">{agent.type} • {agent.description}</p>
                            <p className="text-xs text-gray-400 mt-1">Last run: {agent.last_run}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{agent.tasks} tasks</p>
                            <p className="text-xs text-gray-500">{agent.success_rate}% success</p>
                          </div>
                          <Badge 
                            variant={agent.status === 'active' ? 'success' : 'secondary'}
                            className="text-xs"
                          >
                            {agent.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            {agent.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Latest system events and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const Icon = activity.icon
                      return (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`p-1 rounded-full ${
                            activity.type === 'success' ? 'bg-green-100' :
                            activity.type === 'warning' ? 'bg-yellow-100' :
                            'bg-blue-100'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              activity.type === 'success' ? 'text-green-600' :
                              activity.type === 'warning' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-gray-600">
                Common tasks and shortcuts to get things done faster
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/agents">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-200">
                    <Plus className="h-6 w-6 text-purple-600" />
                    <span className="text-sm font-medium">Create New Agent</span>
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-200">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium">Start Chat</span>
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-200">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium">Generate Report</span>
                  </Button>
                </Link>
                <Link href="/data-sources">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-200">
                    <Database className="h-6 w-6 text-orange-600" />
                    <span className="text-sm font-medium">Add Data Source</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

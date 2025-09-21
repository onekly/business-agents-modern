"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Users,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Brain,
  Database
} from "lucide-react"
import ModernSidebar from "@/components/modern-sidebar"

// Mock data for analytics
const analyticsData = {
  totalAgents: 6,
  activeAgents: 4,
  totalTasks: 270,
  successRate: 92,
  avgResponseTime: "2.3s",
  dataProcessed: "1.2TB",
  reportsGenerated: 45,
  errors: 8
}

const performanceMetrics = [
  { name: "Data Collection Agent", tasks: 45, success: 94, avgTime: "1.2s", status: "excellent" },
  { name: "Market Research Agent", tasks: 23, success: 87, avgTime: "3.1s", status: "good" },
  { name: "Report Generation Agent", tasks: 12, success: 96, avgTime: "4.5s", status: "excellent" },
  { name: "Social Media Monitor", tasks: 67, success: 89, avgTime: "0.8s", status: "good" },
  { name: "Email Marketing Agent", tasks: 34, success: 92, avgTime: "2.1s", status: "excellent" },
  { name: "Customer Support Agent", tasks: 89, success: 95, avgTime: "1.5s", status: "excellent" }
]

const recentActivity = [
  { time: "2 min ago", event: "Data Collection Agent completed 5 tasks", type: "success" },
  { time: "15 min ago", event: "New market research report generated", type: "info" },
  { time: "1 hour ago", event: "Social Media Monitor rate limit reached", type: "warning" },
  { time: "2 hours ago", event: "Report Generation Agent created executive summary", type: "success" },
  { time: "3 hours ago", event: "Email Marketing Agent sent campaign", type: "success" }
]

export default function Analytics() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ModernSidebar />
      
      <div className="lg:pl-72">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-1">Monitor performance and insights across all your AI agents.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                <Clock className="mr-2 h-4 w-4" />
                Last 30 days
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                <BarChart3 className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Agents</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{analyticsData.totalAgents}</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{analyticsData.successRate}%</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +5% from last month
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
                <div className="text-2xl font-bold text-gray-900">{analyticsData.totalTasks}</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +180 this month
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{analyticsData.avgResponseTime}</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
                  -0.3s from last week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Agent Performance</CardTitle>
                <CardDescription className="text-gray-600">
                  Detailed performance metrics for each agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.map((agent, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{agent.name}</h4>
                          <Badge 
                            variant={agent.status === 'excellent' ? 'success' : 'secondary'}
                            className="text-xs"
                          >
                            {agent.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Tasks</p>
                            <p className="font-semibold text-gray-900">{agent.tasks}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Success</p>
                            <p className="font-semibold text-gray-900">{agent.success}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Avg Time</p>
                            <p className="font-semibold text-gray-900">{agent.avgTime}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">System Health</CardTitle>
                <CardDescription className="text-gray-600">
                  Real-time system status and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* System Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">System Online</p>
                      <p className="text-xs text-gray-500">All services running</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Data Processed</p>
                      <p className="text-xs text-gray-500">{analyticsData.dataProcessed}</p>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                    <div className="space-y-3">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`p-1 rounded-full ${
                            activity.type === 'success' ? 'bg-green-100' :
                            activity.type === 'warning' ? 'bg-yellow-100' :
                            'bg-blue-100'
                          }`}>
                            {activity.type === 'success' ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : activity.type === 'warning' ? (
                              <AlertCircle className="h-3 w-3 text-yellow-600" />
                            ) : (
                              <Activity className="h-3 w-3 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{activity.event}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Insights */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Data Insights</CardTitle>
              <CardDescription className="text-gray-600">
                Key insights and recommendations based on your agent performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Performance Trend</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your agents are performing 15% better than last month. Consider scaling up the most successful agents.
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Optimization</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Data Collection Agent could benefit from parallel processing to reduce response time by 30%.
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">Attention Needed</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Social Media Monitor is hitting rate limits frequently. Consider upgrading the API plan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Brain,
  Zap,
  MessageSquare,
  Plus,
  Settings,
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"
import ModernSidebar from "@/components/modern-sidebar"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  agentName?: string
  agentType?: string
}

const availableAgents = [
  { id: 'data-collection', name: 'Data Collection Agent', type: 'Data Processing', description: 'Collects and processes data from various sources' },
  { id: 'market-research', name: 'Market Research Agent', type: 'Analysis', description: 'Conducts market research and competitive analysis' },
  { id: 'report-generation', name: 'Report Generation Agent', type: 'Content', description: 'Generates comprehensive business reports' },
  { id: 'social-monitor', name: 'Social Media Monitor', type: 'Monitoring', description: 'Monitors social media for brand mentions' },
]

const sampleMessages: Message[] = [
  {
    id: '1',
    type: 'agent',
    content: 'Hello! I\'m your AI assistant. I can help you with data collection, market research, report generation, and more. What would you like to work on today?',
    timestamp: new Date(),
    agentName: 'AI Assistant',
    agentType: 'General'
  }
]

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages)
  const [input, setInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: `I understand you want to "${input}". Let me help you with that. I can analyze your request and suggest the best approach using our available agents. Would you like me to start with data collection or would you prefer to begin with market research?`,
        timestamp: new Date(),
        agentName: selectedAgent ? availableAgents.find(a => a.id === selectedAgent)?.name : 'AI Assistant',
        agentType: selectedAgent ? availableAgents.find(a => a.id === selectedAgent)?.type : 'General'
      }
      setMessages(prev => [...prev, agentResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages(sampleMessages)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernSidebar />
      
      <div className="lg:pl-72">
        <div className="h-screen flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">AI Chat</h1>
                  <p className="text-sm text-gray-500">Chat with your AI agents</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={clearChat}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Chat
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Agent Selection */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center space-x-2 overflow-x-auto">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Select Agent:</span>
              {availableAgents.map((agent) => (
                <Button
                  key={agent.id}
                  variant={selectedAgent === agent.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                  className="whitespace-nowrap"
                >
                  <Bot className="h-3 w-3 mr-1" />
                  {agent.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "flex space-x-3 max-w-3xl",
                  message.type === 'user' ? "flex-row-reverse space-x-reverse" : "flex-row"
                )}>
                  {/* Avatar */}
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    message.type === 'user' 
                      ? "bg-gradient-to-br from-blue-500 to-purple-600" 
                      : "bg-gradient-to-br from-purple-600 to-blue-600"
                  )}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={cn(
                    "flex flex-col space-y-1",
                    message.type === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl max-w-2xl",
                      message.type === 'user'
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                    )}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    
                    {/* Message Info */}
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {message.agentName && (
                        <span className="font-medium">{message.agentName}</span>
                      )}
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex space-x-3 max-w-3xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your business data, market research, or generate reports..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                Analyze Data
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Generate Report
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Market Research
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

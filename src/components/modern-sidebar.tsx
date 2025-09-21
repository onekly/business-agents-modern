"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  Home, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Zap,
  Database,
  FileText,
  Users,
  ChevronDown,
  Star,
  Send,
  User,
  Building2,
  Share2,
  Activity,
  MessageSquare,
  Brain,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: Home,
    badge: null
  },
  { 
    name: "AI Agents", 
    href: "/agents", 
    icon: Bot,
    badge: "4"
  },
  { 
    name: "Chat", 
    href: "/chat", 
    icon: MessageSquare,
    badge: null
  },
  { 
    name: "Analytics", 
    href: "/analytics", 
    icon: BarChart3,
    badge: null
  },
  { 
    name: "Data Sources", 
    href: "/data-sources", 
    icon: Database,
    badge: "12"
  },
  { 
    name: "Reports", 
    href: "/reports", 
    icon: FileText,
    badge: null
  },
  { 
    name: "Team", 
    href: "/team", 
    icon: Users,
    badge: null
  },
  { 
    name: "Settings", 
    href: "/settings", 
    icon: Settings,
    badge: null
  },
]

const aiFeatures = [
  { 
    name: "B2B Enrichment", 
    href: "/b2b", 
    icon: Star,
    description: "Enrich business data"
  },
  { 
    name: "Market Research", 
    href: "/market-research", 
    icon: Building2,
    description: "Research market trends"
  },
  { 
    name: "Content Generation", 
    href: "/content", 
    icon: Send,
    description: "Generate content"
  },
  { 
    name: "Social Media", 
    href: "/social", 
    icon: Share2,
    description: "Social media insights"
  },
]

export default function ModernSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-full flex-col bg-white border-r border-gray-200 shadow-xl">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Business Agents</h1>
                <p className="text-xs text-gray-500 font-medium">AI Platform</p>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                      active 
                        ? "bg-purple-50 text-purple-700 border border-purple-200" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={cn(
                        "h-5 w-5 transition-colors",
                        active ? "text-purple-600" : "text-gray-400 group-hover:text-gray-600"
                      )} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* AI Features Section */}
            <div className="pt-6">
              <div className="flex items-center space-x-2 px-3 mb-3">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  AI Features
                </h3>
              </div>
              <div className="space-y-1">
                {aiFeatures.map((feature) => {
                  const Icon = feature.icon
                  const active = isActive(feature.href)
                  
                  return (
                    <Link
                      key={feature.name}
                      href={feature.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
                        active 
                          ? "bg-purple-50 text-purple-700" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className={cn(
                        "h-4 w-4 transition-colors",
                        active ? "text-purple-600" : "text-gray-400 group-hover:text-gray-600"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{feature.name}</p>
                        <p className="text-xs text-gray-500 truncate">{feature.description}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">AI Platform Manager</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 hover:text-gray-900">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 hover:text-gray-900">
                <FileText className="h-4 w-4 mr-2" />
                Billing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

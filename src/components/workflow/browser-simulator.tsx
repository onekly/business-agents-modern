'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight, 
  Home,
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface BrowserSimulatorProps {
  url: string;
  title: string;
  content: React.ReactNode;
  isLoading?: boolean;
  aiActions?: Array<{
    id: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    element?: string;
    action?: string;
  }>;
  onActionComplete?: (actionId: string) => void;
}

export default function BrowserSimulator({ 
  url, 
  title, 
  content, 
  isLoading = false,
  aiActions = [],
  onActionComplete
}: BrowserSimulatorProps) {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showActions, setShowActions] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setIsNavigating(true);
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const getActionIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Browser Header */}
      <div className="bg-gray-100 border border-gray-300 rounded-t-lg">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex-1 flex items-center gap-2 ml-4">
            <Button variant="ghost" size="sm" className="p-1">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1">
              <RefreshCw className={`w-4 h-4 ${isNavigating ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" className="p-1">
              <Home className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm">
              {currentUrl}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-1">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Browser Content */}
      <Card className="rounded-t-none border-t-0">
        <CardContent className="p-0">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-600">AI is working on this page...</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  AI Active
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowActions(!showActions)}
                >
                  {showActions ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* AI Actions Panel */}
          {showActions && aiActions.length > 0 && (
            <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
              <h3 className="text-sm font-medium text-blue-900 mb-3">AI Actions</h3>
              <div className="space-y-2">
                {aiActions.map((action, index) => (
                  <div
                    key={action.id}
                    className="flex items-center gap-3 p-2 bg-white rounded-md border border-blue-200"
                  >
                    {getActionIcon(action.status)}
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{action.description}</div>
                      {action.element && (
                        <div className="text-xs text-gray-500">
                          Element: {action.element}
                        </div>
                      )}
                    </div>
                    {action.status === 'running' && (
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="p-6">
            {isLoading || isNavigating ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Globe className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-600">Loading page...</p>
                </div>
              </div>
            ) : (
              content
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Example content components for different websites
export function InstacartContent() {
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for products..."
            className="flex-1 bg-transparent outline-none text-lg"
            defaultValue="shredded cheddar cheese"
          />
        </div>
      </div>

      {/* Store Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Sprouts Farmers Market</h2>
          <p className="text-sm text-gray-600">In-store prices • 100% satisfaction guarantee</p>
        </div>
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <span className="text-sm font-medium">5 items</span>
        </div>
      </div>

      {/* Search Results */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Results for 'shredded cheddar cheese'</h3>
        <div className="space-y-3">
          {[
            { name: 'Sprouts Shredded Thick Cut Sharp Cheddar Cheese (8 oz)', price: '$4.99', added: false },
            { name: 'Sprouts Shredded Mild Cheddar Cheese (8 oz)', price: '$4.99', added: true },
            { name: 'Sprouts Sharp Cheddar Shredded Cheese (32 oz)', price: '$11.49', added: false, badge: 'Best seller' },
            { name: 'Organic Valley Organic Shredded Sharp Cheddar Cheese (6 oz)', price: '$6.49', added: false, badge: 'Organic' },
          ].map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{product.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-semibold text-green-600">{product.price}</span>
                  {product.badge && (
                    <Badge variant="outline" className="text-xs">
                      {product.badge}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {product.added ? (
                  <Badge className="bg-green-100 text-green-800">1 ct</Badge>
                ) : (
                  <Button size="sm">Add</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GoogleCalendarContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">June 2025</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Today</Button>
          <Button variant="outline" size="sm">Week</Button>
          <Button variant="outline" size="sm">Month</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-600">{day}</div>
        ))}
        
        {Array.from({ length: 30 }, (_, i) => {
          const date = i + 1;
          const isWeekend = (i + 1) % 7 === 0 || (i + 1) % 7 === 1;
          const isFreeWeekend = date >= 21 && date <= 23;
          
          return (
            <div
              key={date}
              className={`p-2 text-center border border-gray-200 ${
                isFreeWeekend ? 'bg-green-50 border-green-200' : ''
              }`}
            >
              <div className={`text-sm ${isFreeWeekend ? 'font-semibold text-green-600' : ''}`}>
                {date}
              </div>
              {date === 15 && (
                <div className="text-xs text-blue-600 mt-1">Morning Run</div>
              )}
              {date === 18 && (
                <div className="text-xs text-purple-600 mt-1">Client Meeting</div>
              )}
              {date === 25 && (
                <div className="text-xs text-orange-600 mt-1">Conference 2025</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GoogleDriveContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-semibold">G</span>
        </div>
        <h2 className="text-lg font-semibold">Family Goulash Recipe</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Easy American Goulash</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div>Yields: 4-6 servings</div>
          <div>Prep time: 10 minutes</div>
          <div>Cook time: 25-35 minutes</div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Items I need:</h4>
            <ul className="space-y-1">
              {[
                '1 pound lean ground beef',
                '1 medium yellow onion',
                '2 cups beef broth',
                '1.5-2 cups uncooked elbow macaroni',
                '1 cup shredded cheddar cheese'
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Items I've bought:</h4>
            <ul className="space-y-1">
              {[
                '1 tablespoon olive oil',
                '1 green bell pepper',
                '2 cloves garlic',
                '1 (16-ounce) can diced tomatoes',
                '1 (15-ounce) can tomato sauce',
                '1 tablespoon Worcestershire sauce',
                '1-2 teaspoons Italian seasoning',
                '1 teaspoon seasoned salt',
                '1/2 teaspoon black pepper',
                '1 bay leaf',
                'Fresh parsley or chives'
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <input type="checkbox" checked className="rounded" />
                  <span className="line-through text-gray-500">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import WorkflowChat from '@/components/chat/workflow-chat';
import ModernSidebar from '@/components/modern-sidebar';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ModernSidebar />
      
      <div className="lg:pl-72">
        <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Workflow Assistant
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Describe what you want to accomplish, and I'll break it down into an automated workflow. 
            Just like Google Mariner, I'll show you each step, get your approval, and then create and execute the workflow for you.
          </p>
        </div>
        
        <WorkflowChat />
        
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="font-medium text-blue-900 mb-2">💡 Try these examples:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• "Find all best influencers in the Tech area and read their 5 best articles posted on LinkedIn"</p>
              <p>• "Send personalized emails to my Google Sheets contacts"</p>
              <p>• "Analyze customer feedback from my spreadsheet and generate insights"</p>
              <p>• "Research competitors and their social media strategies"</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
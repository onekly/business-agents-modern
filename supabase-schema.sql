-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50) DEFAULT '1.0.0',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category VARCHAR(100) DEFAULT 'general',
  is_template BOOLEAN DEFAULT FALSE,
  execution_history JSONB DEFAULT '[]'::jsonb
);

-- Create workflow_executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'paused', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_duration INTEGER, -- in milliseconds
  step_results JSONB DEFAULT '{}'::jsonb,
  user_interactions JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_category ON workflows(category);
CREATE INDEX IF NOT EXISTS idx_workflows_is_template ON workflows(is_template);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_workflows_updated_at 
  BEFORE UPDATE ON workflows 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_executions_updated_at 
  BEFORE UPDATE ON workflow_executions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth requirements)
-- For now, allowing all operations - you may want to restrict based on user authentication
CREATE POLICY "Allow all operations on workflows" ON workflows
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on workflow_executions" ON workflow_executions
  FOR ALL USING (true);

-- Insert some sample workflow templates
INSERT INTO workflows (name, description, version, status, steps, created_by, tags, category, is_template) VALUES
(
  'E-commerce Product Research',
  'Research products, compare prices, and gather reviews across multiple platforms',
  '1.0.0',
  'active',
  '[
    {
      "id": "step-1",
      "type": "ai_action",
      "name": "Analyze Product Requirements",
      "description": "AI analyzes the product description and requirements",
      "status": "pending",
      "inputs": {},
      "outputs": {},
      "dependencies": [],
      "config": {"model": "gemma3:1b", "temperature": 0.3},
      "userApprovalRequired": false,
      "retryCount": 0,
      "maxRetries": 3
    },
    {
      "id": "step-2",
      "type": "api_call",
      "name": "Search Amazon Products",
      "description": "Search for products on Amazon using the product requirements",
      "status": "pending",
      "inputs": {},
      "outputs": {},
      "dependencies": ["step-1"],
      "config": {
        "url": "/api/test-workflow",
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": {"searchQuery": "{{step-1.searchQuery}}"}
      },
      "userApprovalRequired": false,
      "retryCount": 0,
      "maxRetries": 3
    }
  ]'::jsonb,
  'system',
  '["ecommerce", "research", "pricing"]',
  'Research',
  true
),
(
  'Email Automation',
  'Automatically process and respond to emails based on content analysis',
  '1.0.0',
  'active',
  '[
    {
      "id": "step-1",
      "type": "api_call",
      "name": "Fetch New Emails",
      "description": "Retrieve new emails from Gmail API",
      "status": "pending",
      "inputs": {},
      "outputs": {},
      "dependencies": [],
      "config": {
        "url": "/api/test-workflow",
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": {"action": "fetch_emails"}
      },
      "userApprovalRequired": false,
      "retryCount": 0,
      "maxRetries": 3
    },
    {
      "id": "step-2",
      "type": "ai_action",
      "name": "Analyze Email Content",
      "description": "Use AI to analyze email content and determine response",
      "status": "pending",
      "inputs": {},
      "outputs": {},
      "dependencies": ["step-1"],
      "config": {
        "model": "gemma3:1b",
        "temperature": 0.2,
        "prompt": "Analyze this email and determine the appropriate response"
      },
      "userApprovalRequired": false,
      "retryCount": 0,
      "maxRetries": 3
    }
  ]'::jsonb,
  'system',
  '["email", "automation", "ai"]',
  'Communication',
  true
);

export interface WorkflowStep {
  id: string;
  type: 'ai_action' | 'user_input' | 'data_processing' | 'api_call' | 'decision' | 'loop' | 'parallel';
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'skipped';
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  dependencies: string[];
  config: Record<string, any>;
  userApprovalRequired?: boolean;
  userApproved?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  category: string;
  isTemplate: boolean;
  executionHistory: WorkflowExecution[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  currentStepId?: string;
  stepResults: Record<string, any>;
  userInteractions: UserInteraction[];
  totalDuration?: number;
  error?: string;
}

export interface UserInteraction {
  id: string;
  stepId: string;
  type: 'approval' | 'input' | 'modification' | 'skip' | 'retry';
  timestamp: Date;
  data: Record<string, any>;
  userMessage?: string;
}

export interface AITask {
  id: string;
  prompt: string;
  context: Record<string, any>;
  expectedOutput: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  steps: Omit<WorkflowStep, 'id' | 'status' | 'inputs' | 'outputs' | 'error' | 'startTime' | 'endTime' | 'duration' | 'retryCount'>[];
  tags: string[];
  icon: string;
  previewImage?: string;
}

export interface WorkflowBuilderNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    step: WorkflowStep;
    isSelected: boolean;
    isConnecting: boolean;
  };
}

export interface WorkflowBuilderEdge {
  id: string;
  source: string;
  target: string;
  type: 'default' | 'conditional' | 'parallel';
  data?: {
    condition?: string;
    label?: string;
  };
}

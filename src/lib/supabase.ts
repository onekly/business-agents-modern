import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      workflows: {
        Row: {
          id: string
          name: string
          description: string
          version: string
          status: 'draft' | 'active' | 'paused' | 'archived'
          steps: any // JSON
          created_at: string
          updated_at: string
          created_by: string
          tags: string[]
          category: string
          is_template: boolean
          execution_history: any // JSON
        }
        Insert: {
          id?: string
          name: string
          description: string
          version?: string
          status?: 'draft' | 'active' | 'paused' | 'archived'
          steps: any
          created_at?: string
          updated_at?: string
          created_by: string
          tags: string[]
          category: string
          is_template?: boolean
          execution_history?: any
        }
        Update: {
          id?: string
          name?: string
          description?: string
          version?: string
          status?: 'draft' | 'active' | 'paused' | 'archived'
          steps?: any
          created_at?: string
          updated_at?: string
          created_by?: string
          tags?: string[]
          category?: string
          is_template?: boolean
          execution_history?: any
        }
      }
      workflow_executions: {
        Row: {
          id: string
          workflow_id: string
          status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'
          started_at: string
          completed_at?: string
          total_duration?: number
          step_results: any // JSON
          user_interactions: any // JSON
          error_message?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workflow_id: string
          status?: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'
          started_at?: string
          completed_at?: string
          total_duration?: number
          step_results?: any
          user_interactions?: any
          error_message?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workflow_id?: string
          status?: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'
          started_at?: string
          completed_at?: string
          total_duration?: number
          step_results?: any
          user_interactions?: any
          error_message?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

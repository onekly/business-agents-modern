# Supabase Setup Guide

This guide will help you set up Supabase for the Business Agents Modern application to store workflows and execution data.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `business-agents-modern`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
6. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Project API Key (anon public)

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=gemma3:1b

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Set Up Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to execute the SQL

This will create:
- `workflows` table for storing workflow definitions
- `workflow_executions` table for storing execution data
- Indexes for better performance
- Row Level Security policies
- Sample workflow templates

## 5. Verify Setup

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/workflows`
3. You should see the sample workflow templates loaded from Supabase
4. Try creating a new workflow - it should be saved to Supabase

## 6. Database Schema Details

### Workflows Table
- `id`: UUID primary key
- `name`: Workflow name
- `description`: Workflow description
- `version`: Version string
- `status`: Workflow status (draft, active, paused, archived)
- `steps`: JSON array of workflow steps
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
- `created_by`: Creator identifier
- `tags`: Array of tags
- `category`: Workflow category
- `is_template`: Boolean for template workflows
- `execution_history`: JSON array of execution history

### Workflow Executions Table
- `id`: UUID primary key
- `workflow_id`: Foreign key to workflows table
- `status`: Execution status (running, completed, failed, paused, cancelled)
- `started_at`: Start timestamp
- `completed_at`: Completion timestamp
- `total_duration`: Duration in milliseconds
- `step_results`: JSON object of step results
- `user_interactions`: JSON array of user interactions
- `error_message`: Error message if failed
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## 7. Features Enabled

With Supabase integration, you now have:

✅ **Persistent Storage**: Workflows and executions are stored in Supabase
✅ **Real-time Updates**: Changes are immediately reflected across sessions
✅ **Data Integrity**: Foreign key relationships ensure data consistency
✅ **Scalability**: Supabase handles scaling automatically
✅ **Backup & Recovery**: Automatic backups and point-in-time recovery
✅ **Security**: Row Level Security policies protect your data
✅ **Performance**: Indexed queries for fast data retrieval

## 8. Troubleshooting

### Common Issues

1. **"Failed to load workflows"**: Check your Supabase credentials in `.env.local`
2. **"Database connection failed"**: Verify your Supabase project is active
3. **"Permission denied"**: Check your RLS policies in Supabase
4. **"Schema not found"**: Run the SQL schema setup again

### Debug Mode

Enable debug logging by adding to your `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```

This will show detailed logs of Supabase operations in the browser console.

## 9. Next Steps

- Set up authentication if you want user-specific workflows
- Configure RLS policies for multi-tenant access
- Set up real-time subscriptions for live updates
- Add data export/import functionality
- Implement workflow versioning

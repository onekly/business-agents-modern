# Ollama Integration Setup Guide

This guide will help you set up Ollama with the Gemma 2:2b model for your AI workflow system.

## Prerequisites

- Node.js 18+ installed
- Ollama installed on your system

## Step 1: Install Ollama

### macOS
```bash
# Install using Homebrew
brew install ollama

# Or download from https://ollama.ai
```

### Linux
```bash
# Install using the official script
curl -fsSL https://ollama.ai/install.sh | sh
```

### Windows
Download and install from https://ollama.ai

## Step 2: Start Ollama Service

```bash
# Start the Ollama service
ollama serve
```

This will start Ollama on `http://localhost:11434` by default.

## Step 3: Pull the Gemma 2:2b Model

```bash
# Pull the Gemma 2:2b model
ollama pull gemma2:2b
```

This will download the model (approximately 1.6GB) to your local machine.

## Step 4: Verify Installation

Run the test script to verify everything is working:

```bash
# Run the test script
node test-ollama.js
```

You should see output like:
```
✅ Ollama is running
Available models: ['gemma2:2b']
✅ Gemma2:2b model is available
✅ AI generation successful
Response: Hello! I'd be happy to help you with a simple task...
```

## Step 5: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=gemma2:2b

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 6: Test the Integration

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/workflows`

3. You should see the AI Status component showing "Connected" with the Gemma2:2b model

4. Try executing a workflow to test the AI integration

## Troubleshooting

### Ollama Not Starting
```bash
# Check if Ollama is running
ps aux | grep ollama

# Restart Ollama
pkill ollama
ollama serve
```

### Model Not Found
```bash
# List available models
ollama list

# Pull the model again
ollama pull gemma2:2b
```

### Connection Refused
- Ensure Ollama is running on port 11434
- Check firewall settings
- Verify the URL in your configuration

### Memory Issues
The Gemma2:2b model requires approximately 1.6GB of RAM. If you're experiencing memory issues:

1. Use a smaller model:
   ```bash
   ollama pull gemma2:1b
   ```

2. Update your configuration:
   ```bash
   OLLAMA_DEFAULT_MODEL=gemma2:1b
   ```

## Available Models

You can use other models by changing the `OLLAMA_DEFAULT_MODEL` environment variable:

- `gemma2:2b` - 1.6GB (recommended)
- `gemma2:1b` - 0.8GB (lighter)
- `llama3.2:3b` - 2GB
- `llama3.2:1b` - 0.8GB

## API Endpoints

The system provides several API endpoints for testing:

- `GET /api/ai/test` - Check Ollama connection status
- `POST /api/ai/test` - Test AI generation

## Workflow Integration

The AI service is automatically integrated into the workflow engine. AI steps will:

1. Check if Ollama is available
2. Use the configured model for processing
3. Provide confidence scores and reasoning
4. Handle errors gracefully

## Performance Tips

1. **Keep Ollama Running**: Start Ollama as a service to avoid cold starts
2. **Model Caching**: Ollama caches models in memory for faster responses
3. **Batch Processing**: Process multiple requests together when possible
4. **Resource Monitoring**: Monitor CPU and memory usage during heavy workloads

## Security Considerations

- Ollama runs locally, so your data stays on your machine
- No data is sent to external services
- Models are downloaded and run locally
- Consider network security if exposing Ollama over a network

## Next Steps

Once Ollama is set up:

1. Create your first AI workflow
2. Test different AI task types
3. Customize prompts for your use cases
4. Monitor performance and adjust settings

For more information, visit the [Ollama documentation](https://ollama.ai/docs).

// Simple test script to verify Ollama integration
const testOllamaConnection = async () => {
  try {
    console.log('Testing Ollama connection...');
    
    // Test basic connection
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Ollama is running');
    console.log('Available models:', data.models?.map(m => m.name) || []);
    
    // Test if gemma2:2b is available
    const hasGemma = data.models?.some(m => m.name.includes('gemma2:2b'));
    if (hasGemma) {
      console.log('✅ Gemma2:2b model is available');
    } else {
      console.log('⚠️  Gemma2:2b model not found, available models:', data.models?.map(m => m.name));
    }
    
    // Test a simple generation
    console.log('\nTesting AI generation...');
    const generateResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma2:2b',
        prompt: 'Hello, can you help me with a simple task?',
        stream: false,
        options: { temperature: 0.7, num_predict: 50 }
      })
    });
    
    if (!generateResponse.ok) {
      throw new Error(`Generation failed: ${generateResponse.status}`);
    }
    
    const generateData = await generateResponse.json();
    console.log('✅ AI generation successful');
    console.log('Response:', generateData.response);
    
  } catch (error) {
    console.error('❌ Ollama test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure Ollama is running: ollama serve');
    console.log('2. Pull the model: ollama pull gemma2:2b');
    console.log('3. Check if Ollama is accessible at http://localhost:11434');
  }
};

// Run the test
testOllamaConnection();

import { NextResponse } from 'next/server';
import { findRelevantContext } from '@/utils/csvHandler';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    console.log('Received message:', message);

    // Get relevant context from CSV
    const context = findRelevantContext(message);
    
    // Prepare the prompt with context and conversation history
    const prompt = `
      You are a helpful and friendly customer support assistant. Use the following Q&A pairs from our knowledge base to help answer the user's question.
      If the knowledge base doesn't contain relevant information, use your general knowledge to provide a helpful response, but mention that you're providing general information.
      
      Knowledge Base:
      ${context}
      
      Conversation History:
      ${history.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}
      
      User: ${message}
      Assistant:`;

    console.log('Sending request to Ollama...');
    
    // Call Ollama API
    const response = await fetch(`${process.env.OLLAMA_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Received response from Ollama:', data);
    
    return NextResponse.json({ response: data.response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
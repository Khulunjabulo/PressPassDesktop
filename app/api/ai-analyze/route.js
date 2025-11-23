// app/api/ai-analyze/route.js - FINAL WORKING VERSION
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { prompt, maxTokens = 4000 } = await req.json();

    console.log('🤖 AI Proxy: Request received');
    console.log('📝 Prompt length:', prompt?.length);

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error('❌ No API key');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log('🔑 API key found');
    console.log('📤 Calling Anthropic...');

    // Call Anthropic API with correct format
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    console.log('📥 Anthropic response:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Anthropic error:', errorData);
      
      // Return error details
      return NextResponse.json(
        { 
          error: `Anthropic error: ${response.status}`,
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Success! Response received');
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('💥 Server error:', error.message);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
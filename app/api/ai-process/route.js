// app/api/ai-process/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { prompt, maxTokens = 4000 } = await req.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        // Add API key here if needed (server-side only)
        // 'x-api-key': process.env.ANTHROPIC_API_KEY
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

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolSlug, prompt } = body as { toolSlug: string; prompt: string }

    if (!toolSlug || !prompt) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check tool exists and AI is enabled
    const tool = await prisma.tool.findUnique({
      where: { slug: toolSlug },
    })

    if (!tool) {
      return new Response(JSON.stringify({ error: 'Tool not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!tool.aiOutputEnabled) {
      return new Response(JSON.stringify({ error: 'AI output not enabled for this tool' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Find the most recent ToolRun to update later
    const latestRun = await prisma.toolRun.findFirst({
      where: { toolId: tool.id },
      orderBy: { createdAt: 'desc' },
    })

    // Stream from Claude
    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: 'You are a professional writing assistant. Provide well-structured, professional output exactly as requested.',
      messages: [{ role: 'user', content: prompt }],
    })

    // Create a ReadableStream to pipe Claude's output
    let fullOutput = ''
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const text = chunk.delta.text
              fullOutput += text
              controller.enqueue(new TextEncoder().encode(text))
            }
          }
          controller.close()

          // Update ToolRun with AI output (fire-and-forget)
          if (latestRun) {
            prisma.toolRun
              .update({
                where: { id: latestRun.id },
                data: { aiOutput: fullOutput, aiWasUsed: true },
              })
              .catch(console.error)
          }
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Error generating AI output:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

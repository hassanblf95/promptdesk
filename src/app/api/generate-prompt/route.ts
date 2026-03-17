import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/db'
import { renderPrompt } from '@/lib/prompt-engine'
import type { ToolField } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolSlug, fieldValues } = body as {
      toolSlug: string
      fieldValues: Record<string, string>
    }

    if (!toolSlug || !fieldValues) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch tool from DB
    const tool = await prisma.tool.findUnique({
      where: { slug: toolSlug },
    })

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    if (tool.status !== 'LIVE') {
      return NextResponse.json({ error: 'Tool is not available' }, { status: 404 })
    }

    // Render prompt
    const fields = tool.fieldsSchema as unknown as ToolField[]
    const { prompt, errors } = renderPrompt(tool.promptTemplate, fieldValues, fields)

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 422 })
    }

    // Get or set session cookie
    const cookieStore = await cookies()
    let sessionId = cookieStore.get('pd_session')?.value
    if (!sessionId) {
      sessionId = uuidv4()
    }

    // Create ToolRun (fire-and-forget)
    prisma.toolRun
      .create({
        data: {
          toolId: tool.id,
          sessionId,
          fieldValues,
          generatedPrompt: prompt,
        },
      })
      .catch(console.error)

    const response = NextResponse.json({ prompt })

    // Set session cookie
    if (!cookieStore.get('pd_session')) {
      response.cookies.set('pd_session', sessionId, {
        httpOnly: true,
        maxAge: 86400, // 24 hours
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    }

    return response
  } catch (error) {
    console.error('Error generating prompt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

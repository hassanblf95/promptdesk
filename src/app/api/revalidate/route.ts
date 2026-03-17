import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-revalidation-secret')

    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { toolSlug, type } = body as {
      toolSlug: string
      type: 'tool' | 'prompt' | 'guide' | 'all'
    }

    if (!toolSlug) {
      return NextResponse.json({ error: 'Missing toolSlug' }, { status: 400 })
    }

    // Get the tool's primary profession slug
    const tool = await prisma.tool.findUnique({
      where: { slug: toolSlug },
      include: {
        toolProfessions: {
          where: { isPrimary: true },
          include: { profession: true },
        },
      },
    })

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    const professionSlug = tool.toolProfessions[0]?.profession.slug

    const revalidated: string[] = []

    if (type === 'tool' || type === 'all') {
      if (professionSlug) {
        revalidatePath(`/${professionSlug}/${toolSlug}`)
        revalidated.push(`/${professionSlug}/${toolSlug}`)
      }
    }

    if (type === 'prompt' || type === 'all') {
      revalidatePath(`/prompts/${toolSlug}`)
      revalidated.push(`/prompts/${toolSlug}`)
    }

    if (type === 'guide' || type === 'all') {
      revalidatePath(`/blog/${toolSlug}`)
      revalidated.push(`/blog/${toolSlug}`)
    }

    if (type === 'all' && professionSlug) {
      revalidatePath(`/${professionSlug}`)
      revalidatePath('/')
      revalidated.push(`/${professionSlug}`, '/')
    }

    return NextResponse.json({ revalidated })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}

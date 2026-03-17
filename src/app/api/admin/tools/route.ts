import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tools = await prisma.tool.findMany({
      include: {
        toolProfessions: {
          include: { profession: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tools)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      slug,
      name,
      shortDesc,
      status,
      blueprint,
      aiOutputEnabled,
      fieldsSchema,
      promptTemplate,
      seoToolTitle,
      seoToolDesc,
      seoPromptTitle,
      seoPromptDesc,
      seoGuideTitle,
      seoGuideDesc,
      relatedSlugs,
      guideContent,
      promptLibrary,
      faq,
      professionIds,
      taskIds,
    } = body

    if (!slug || !name || !shortDesc || !promptTemplate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const tool = await prisma.tool.create({
      data: {
        slug,
        name,
        shortDesc,
        status: status || 'DRAFT',
        blueprint: blueprint || 'text-generator',
        aiOutputEnabled: aiOutputEnabled || false,
        fieldsSchema: fieldsSchema || [],
        promptTemplate,
        promptLibrary: promptLibrary || [],
        guideContent: guideContent || [],
        faq: faq || [],
        relatedSlugs: relatedSlugs || [],
        seoToolTitle: seoToolTitle || null,
        seoToolDesc: seoToolDesc || null,
        seoPromptTitle: seoPromptTitle || null,
        seoPromptDesc: seoPromptDesc || null,
        seoGuideTitle: seoGuideTitle || null,
        seoGuideDesc: seoGuideDesc || null,
        publishedAt: status === 'LIVE' ? new Date() : null,
      },
    })

    // Link professions
    if (professionIds && professionIds.length > 0) {
      await prisma.toolProfession.createMany({
        data: professionIds.map((profId: string, i: number) => ({
          toolId: tool.id,
          professionId: profId,
          isPrimary: i === 0,
          sortOrder: i,
        })),
        skipDuplicates: true,
      })
    }

    // Link tasks
    if (taskIds && taskIds.length > 0) {
      await prisma.taskTool.createMany({
        data: taskIds.map((taskId: string, i: number) => ({
          taskId,
          toolId: tool.id,
          isPrimary: i === 0,
          sortOrder: i,
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json(tool, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 })
  }
}

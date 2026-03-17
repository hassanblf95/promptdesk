import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tool = await prisma.tool.findUnique({
      where: { id: params.id },
      include: {
        toolProfessions: { include: { profession: true } },
        taskTools: { include: { task: true } },
      },
    })

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    return NextResponse.json(tool)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch tool' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get current tool to check if status changed to LIVE
    const currentTool = await prisma.tool.findUnique({ where: { id: params.id } })
    const isBeingPublished = status === 'LIVE' && currentTool?.status !== 'LIVE'

    const tool = await prisma.tool.update({
      where: { id: params.id },
      data: {
        slug,
        name,
        shortDesc,
        status,
        blueprint,
        aiOutputEnabled,
        fieldsSchema,
        promptTemplate,
        promptLibrary,
        guideContent,
        faq,
        relatedSlugs,
        seoToolTitle: seoToolTitle || null,
        seoToolDesc: seoToolDesc || null,
        seoPromptTitle: seoPromptTitle || null,
        seoPromptDesc: seoPromptDesc || null,
        seoGuideTitle: seoGuideTitle || null,
        seoGuideDesc: seoGuideDesc || null,
        publishedAt: isBeingPublished ? new Date() : undefined,
      },
    })

    // Update profession links
    if (professionIds !== undefined) {
      await prisma.toolProfession.deleteMany({ where: { toolId: params.id } })
      if (professionIds.length > 0) {
        await prisma.toolProfession.createMany({
          data: professionIds.map((profId: string, i: number) => ({
            toolId: params.id,
            professionId: profId,
            isPrimary: i === 0,
            sortOrder: i,
          })),
        })
      }
    }

    // Update task links
    if (taskIds !== undefined) {
      await prisma.taskTool.deleteMany({ where: { toolId: params.id } })
      if (taskIds.length > 0) {
        await prisma.taskTool.createMany({
          data: taskIds.map((taskId: string, i: number) => ({
            taskId,
            toolId: params.id,
            isPrimary: i === 0,
            sortOrder: i,
          })),
        })
      }
    }

    return NextResponse.json(tool)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update tool' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.tool.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete tool' }, { status: 500 })
  }
}

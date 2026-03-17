import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { ToolSpecSchema } from '@/lib/spec-validator'
import type { ImportResult } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { specs } = body as { specs: unknown[] }

    if (!Array.isArray(specs)) {
      return NextResponse.json({ error: 'specs must be an array' }, { status: 400 })
    }

    const result: ImportResult = {
      imported: 0,
      skipped: 0,
      errors: [],
    }

    for (const spec of specs) {
      const parseResult = ToolSpecSchema.safeParse(spec)

      if (!parseResult.success) {
        const slug = (spec as Record<string, unknown>)?.slug as string || 'unknown'
        result.errors.push({
          slug,
          error: parseResult.error.errors.map(e => e.message).join('; '),
        })
        continue
      }

      const validSpec = parseResult.data

      try {
        // Check if tool already exists
        const existing = await prisma.tool.findUnique({
          where: { slug: validSpec.slug },
        })

        if (existing) {
          result.skipped++
          continue
        }

        // Find profession
        const profession = await prisma.profession.findUnique({
          where: { slug: validSpec.professionSlug },
        })

        if (!profession) {
          result.errors.push({
            slug: validSpec.slug,
            error: `Profession "${validSpec.professionSlug}" not found`,
          })
          continue
        }

        // Create tool
        const tool = await prisma.tool.create({
          data: {
            slug: validSpec.slug,
            name: validSpec.name,
            shortDesc: validSpec.shortDesc,
            status: 'DRAFT',
            blueprint: validSpec.blueprint || 'text-generator',
            fieldsSchema: validSpec.fields,
            promptTemplate: validSpec.promptTemplate,
            seoToolTitle: validSpec.seoToolTitle || null,
            seoToolDesc: validSpec.seoToolDesc || null,
            seoGuideTitle: validSpec.seoGuideTitle || null,
            seoGuideDesc: validSpec.seoGuideDesc || null,
          },
        })

        // Link to profession
        await prisma.toolProfession.create({
          data: {
            toolId: tool.id,
            professionId: profession.id,
            isPrimary: true,
            sortOrder: 0,
          },
        })

        // Link to task if provided
        if (validSpec.taskSlug) {
          const task = await prisma.task.findUnique({
            where: { slug: validSpec.taskSlug },
          })
          if (task) {
            await prisma.taskTool.create({
              data: {
                taskId: task.id,
                toolId: tool.id,
                isPrimary: true,
                sortOrder: 0,
              },
            })
          }
        }

        result.imported++
      } catch (dbError) {
        result.errors.push({
          slug: validSpec.slug,
          error: 'Database error: ' + String(dbError),
        })
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}

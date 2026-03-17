import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const tasks = await prisma.task.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(tasks)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { slug, name, description, status, seoTitle, seoDesc } = body

    if (!slug || !name) return NextResponse.json({ error: 'slug and name are required' }, { status: 400 })

    const task = await prisma.task.create({
      data: {
        slug,
        name,
        description: description || '',
        status: status || 'DRAFT',
        seoTitle: seoTitle || null,
        seoDesc: seoDesc || null,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

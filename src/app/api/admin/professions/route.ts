import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const professions = await prisma.profession.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json(professions)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch professions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { slug, name, description, iconKey, sortOrder, isActive } = body

    if (!slug || !name) return NextResponse.json({ error: 'slug and name are required' }, { status: 400 })

    const profession = await prisma.profession.create({
      data: { slug, name, description: description || '', iconKey: iconKey || 'briefcase', sortOrder: sortOrder || 0, isActive: isActive !== false },
    })

    return NextResponse.json(profession, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create profession' }, { status: 500 })
  }
}

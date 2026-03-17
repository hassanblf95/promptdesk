import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { slug, name, description, iconKey, sortOrder, isActive } = body

    const profession = await prisma.profession.update({
      where: { id: params.id },
      data: { slug, name, description, iconKey, sortOrder, isActive },
    })

    return NextResponse.json(profession)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update profession' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.profession.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete profession' }, { status: 500 })
  }
}

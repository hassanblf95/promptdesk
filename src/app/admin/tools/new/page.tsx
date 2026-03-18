import { prisma } from '@/lib/db'
import { ToolEditor } from '@/components/admin/ToolEditor'

export default async function NewToolPage() {
  const professions = await prisma.profession.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  }).catch(() => [])

  const tasks = await prisma.task.findMany({
    orderBy: { name: 'asc' },
  }).catch(() => [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F1F3D]">Create New Tool</h1>
        <p className="text-gray-500 text-sm mt-1">Build a new AI tool from scratch.</p>
      </div>
      <ToolEditor
        professions={professions}
        tasks={tasks}
      />
    </div>
  )
}

import Link from 'next/link'
import { Plus, Upload, Wrench, Users, BarChart3, Clock } from 'lucide-react'
import { prisma } from '@/lib/db'

async function getStats() {
  try {
    const [toolsByStatus, totalProfessions, totalTasks, todayRuns] = await Promise.all([
      prisma.tool.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.profession.count({ where: { isActive: true } }),
      prisma.task.count(),
      prisma.toolRun.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ])

    const statusCounts: Record<string, number> = {}
    for (const item of toolsByStatus) {
      statusCounts[item.status] = item._count.id
    }

    return { statusCounts, totalProfessions, totalTasks, todayRuns }
  } catch {
    return { statusCounts: {}, totalProfessions: 0, totalTasks: 0, todayRuns: 0 }
  }
}

export default async function AdminDashboard() {
  const { statusCounts, totalProfessions, totalTasks, todayRuns } = await getStats()

  const statCards = [
    { label: 'Live Tools', value: statusCounts['LIVE'] || 0, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Draft Tools', value: statusCounts['DRAFT'] || 0, color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'In Review', value: statusCounts['REVIEW'] || 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Professions', value: totalProfessions, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tasks', value: totalTasks, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: "Tool Runs Today", value: todayRuns, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F1F3D]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your PromptDesk platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-xl border border-gray-200 bg-white p-5`}>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-[#0F1F3D] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/tools/new"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 hover:border-[#1A56A0] hover:shadow-sm transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
              <Plus className="h-5 w-5 text-[#1A56A0]" />
            </div>
            <div>
              <p className="font-semibold text-[#0F1F3D]">Create New Tool</p>
              <p className="text-xs text-gray-500 mt-0.5">Add a tool from scratch</p>
            </div>
          </Link>

          <Link
            href="/admin/import"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 hover:border-[#1A56A0] hover:shadow-sm transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
              <Upload className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="font-semibold text-[#0F1F3D]">Import Specs</p>
              <p className="text-xs text-gray-500 mt-0.5">Bulk import from JSON/CSV</p>
            </div>
          </Link>

          <Link
            href="/admin/tools"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 hover:border-[#1A56A0] hover:shadow-sm transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
              <Wrench className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="font-semibold text-[#0F1F3D]">Manage Tools</p>
              <p className="text-xs text-gray-500 mt-0.5">Edit, publish, archive tools</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Plus, Edit, ExternalLink } from 'lucide-react'
import { prisma } from '@/lib/db'
import { StatusBadge } from '@/components/admin/StatusBadge'

interface SearchParams {
  status?: string
  q?: string
  page?: string
}

const PAGE_SIZE = 20

export default async function AdminToolsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const status = searchParams.status
  const query = searchParams.q
  const page = parseInt(searchParams.page || '1')
  const skip = (page - 1) * PAGE_SIZE

  const where = {
    ...(status ? { status: status as 'DRAFT' | 'REVIEW' | 'LIVE' | 'ARCHIVED' } : {}),
    ...(query ? { name: { contains: query, mode: 'insensitive' as const } } : {}),
  }

  const [tools, total] = await Promise.all([
    prisma.tool.findMany({
      where,
      include: {
        toolProfessions: {
          include: { profession: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.tool.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F3D]">Tools</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total tools</p>
        </div>
        <Link
          href="/admin/tools/new"
          className="inline-flex items-center gap-2 bg-[#1A56A0] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#0F1F3D] transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          New Tool
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <form method="GET" className="flex-1 max-w-xs">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search tools..."
            className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/30"
          />
        </form>
        <div className="flex gap-2">
          {['', 'LIVE', 'REVIEW', 'DRAFT', 'ARCHIVED'].map((s) => (
            <Link
              key={s}
              href={s ? `?status=${s}` : '?'}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                status === s || (!status && !s)
                  ? 'bg-[#0F1F3D] text-white border-[#0F1F3D]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {s || 'All'}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Profession(s)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">AI</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Created</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tools.map((tool) => (
                <tr key={tool.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-[#0F1F3D]">{tool.name}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{tool.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {tool.toolProfessions.map(tp => (
                        <span key={tp.professionId} className={`text-xs px-2 py-0.5 rounded-full ${tp.isPrimary ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {tp.profession.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={tool.status} />
                  </td>
                  <td className="px-4 py-3">
                    {tool.aiOutputEnabled ? (
                      <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5">Yes</span>
                    ) : (
                      <span className="text-xs text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(tool.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/tools/${tool.id}`}
                        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#1A56A0] font-medium transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      {tool.status === 'LIVE' && tool.toolProfessions[0] && (
                        <Link
                          href={`/${tool.toolProfessions[0].profession.slug}/${tool.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tools.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No tools found.</p>
              <Link href="/admin/tools/new" className="text-sm text-[#1A56A0] hover:underline mt-2 inline-block">
                Create your first tool →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`?page=${p}${status ? `&status=${status}` : ''}${query ? `&q=${query}` : ''}`}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                p === page ? 'bg-[#1A56A0] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

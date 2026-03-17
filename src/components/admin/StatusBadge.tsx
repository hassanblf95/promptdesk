import type { ToolStatus } from '@/types'

interface StatusBadgeProps {
  status: ToolStatus | string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  LIVE: { label: 'Live', className: 'bg-green-100 text-green-700 border-green-200' },
  REVIEW: { label: 'Review', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  ARCHIVED: { label: 'Archived', className: 'bg-red-100 text-red-700 border-red-200' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.DRAFT
  return (
    <span className={`inline-flex items-center border rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

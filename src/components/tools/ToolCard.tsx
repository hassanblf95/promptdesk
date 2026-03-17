import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface ToolCardProps {
  name: string
  shortDesc: string
  slug: string
  professionSlug: string
  aiOutputEnabled?: boolean
}

export function ToolCard({ name, shortDesc, slug, professionSlug, aiOutputEnabled }: ToolCardProps) {
  return (
    <Link
      href={`/${professionSlug}/${slug}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 hover:border-[#1A56A0] hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-[#0F1F3D] text-base leading-snug group-hover:text-[#1A56A0] transition-colors">
          {name}
        </h3>
        {aiOutputEnabled && (
          <span className="ml-2 flex-shrink-0 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5">
            AI
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-4">{shortDesc}</p>
      <div className="flex items-center text-sm font-medium text-[#1A56A0] group-hover:gap-2 gap-1 transition-all">
        <span>Use Tool</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  )
}

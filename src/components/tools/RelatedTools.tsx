import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface RelatedTool {
  slug: string
  name: string
  shortDesc: string
  professionSlug: string
}

interface RelatedToolsProps {
  tools: RelatedTool[]
}

export function RelatedTools({ tools }: RelatedToolsProps) {
  if (tools.length === 0) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <h3 className="font-semibold text-[#0F1F3D] mb-4">Related Tools</h3>
      <div className="space-y-3">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/${tool.professionSlug}/${tool.slug}`}
            className="group flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-[#1A56A0] hover:shadow-sm transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F1F3D] group-hover:text-[#1A56A0] transition-colors leading-snug">
                {tool.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{tool.shortDesc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#1A56A0] flex-shrink-0 mt-0.5 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}

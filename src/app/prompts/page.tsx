import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SiteLayout } from '@/components/layout/SiteLayout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AI Prompt Library — Copy-Paste Prompts for Professionals',
  description:
    'Browse hundreds of copy-paste AI prompts for HR, teachers, marketers, sales, and more. Works with ChatGPT, Claude, and Gemini.',
  openGraph: {
    title: 'AI Prompt Library | PromptDesk',
    description: 'Copy-paste AI prompts for every professional task.',
    url: '/prompts',
  },
  alternates: { canonical: '/prompts' },
}

export default async function PromptsIndexPage() {
  const tools = await prisma.tool.findMany({
    where: { status: 'LIVE' },
    include: {
      toolProfessions: {
        where: { isPrimary: true },
        include: { profession: true },
      },
    },
    orderBy: { publishedAt: 'desc' },
  }).catch(() => [])

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-[#0F1F3D] to-[#1a3a6e] text-white py-14">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">AI Prompt Library</h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Copy-paste AI prompts for every professional task. Works with ChatGPT, Claude, and Gemini.
          </p>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const profession = tool.toolProfessions[0]?.profession
            if (!profession) return null
            return (
              <Link
                key={tool.id}
                href={`/prompts/${tool.slug}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-[#1A56A0] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-[#1A56A0] bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                    {profession.name}
                  </span>
                </div>
                <h2 className="font-semibold text-[#0F1F3D] group-hover:text-[#1A56A0] transition-colors mt-2">
                  {tool.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{tool.shortDesc}</p>
                <p className="text-xs text-[#1A56A0] mt-3 font-medium">View prompts →</p>
              </Link>
            )
          })}
        </div>
      </div>
    </SiteLayout>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SiteLayout } from '@/components/layout/SiteLayout'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'AI Guides for Professionals — PromptDesk Blog',
  description:
    'Step-by-step guides for using AI in your professional work. Learn how to write job descriptions, cold emails, lesson plans, and more with AI.',
  openGraph: {
    title: 'AI Guides for Professionals | PromptDesk',
    description: 'Step-by-step AI guides for every professional task.',
    url: '/blog',
  },
  alternates: { canonical: '/blog' },
}

export default async function BlogIndexPage() {
  const tools = await prisma.tool.findMany({
    where: { status: 'LIVE' },
    include: {
      toolProfessions: {
        where: { isPrimary: true },
        include: { profession: true },
      },
    },
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-[#0F1F3D] to-[#1a3a6e] text-white py-14">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">AI Guides for Professionals</h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Complete guides to using AI for every professional task. From job descriptions to lesson plans.
          </p>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const profession = tool.toolProfessions[0]?.profession
            if (!profession) return null

            const guideTitle = tool.seoGuideTitle || `How to use ${tool.name}: Complete Guide`
            const guideDesc = tool.seoGuideDesc || tool.shortDesc

            return (
              <Link
                key={tool.id}
                href={`/blog/${tool.slug}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-[#1A56A0] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-medium text-[#1A56A0] bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                    {profession.name}
                  </span>
                </div>
                <h2 className="font-semibold text-[#0F1F3D] group-hover:text-[#1A56A0] transition-colors leading-snug">
                  {guideTitle}
                </h2>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{guideDesc}</p>
                <p className="text-xs text-[#1A56A0] mt-3 font-medium">Read guide →</p>
              </Link>
            )
          })}
        </div>
      </div>
    </SiteLayout>
  )
}

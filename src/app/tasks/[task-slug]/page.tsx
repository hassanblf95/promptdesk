import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { ToolCard } from '@/components/tools/ToolCard'

export const revalidate = 3600

interface Props {
  params: { 'task-slug': string }
}

async function getTaskData(slug: string) {
  try {
    return await prisma.task.findFirst({
      where: { slug, status: 'LIVE' },
      include: {
        taskTools: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          include: {
            tool: {
              include: {
                toolProfessions: {
                  where: { isPrimary: true },
                  include: { profession: true },
                },
              },
            },
          },
        },
        taskProfessions: {
          include: { profession: true },
        },
      },
    })
  } catch (error) {
    console.error('[TaskPage] DB error:', error)
    return null
  }
}

export async function generateStaticParams() {
  try {
    const tasks = await prisma.task.findMany({
      where: { status: 'LIVE' },
      select: { slug: true },
    })
    return tasks.map(t => ({ 'task-slug': t.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const task = await getTaskData(params['task-slug'])
  if (!task) return {}

  const title = task.seoTitle || `${task.name} — AI Tools & Guides | PromptDesk`
  const description = task.seoDesc || task.description

  return {
    title,
    description,
    openGraph: { title, description, url: `/tasks/${task.slug}` },
    alternates: { canonical: `/tasks/${task.slug}` },
  }
}

export default async function TaskPage({ params }: Props) {
  const task = await getTaskData(params['task-slug'])
  if (!task) return notFound()

  const tools = task.taskTools.map(tt => tt.tool).filter(t => t.status === 'LIVE')
  const primaryTool = task.taskTools.find(tt => tt.isPrimary)?.tool
  const relatedProfessions = task.taskProfessions.map(tp => tp.profession)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Tasks', item: `${process.env.NEXT_PUBLIC_BASE_URL}/tasks` },
      { '@type': 'ListItem', position: 3, name: task.name },
    ],
  }

  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="border-b bg-gray-50">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#1A56A0]">Home</Link>
            <span>/</span>
            <Link href="/tasks" className="hover:text-[#1A56A0]">Tasks</Link>
            <span>/</span>
            <span className="text-gray-900">{task.name}</span>
          </nav>
        </div>
      </div>

      <section className="bg-gradient-to-b from-[#0F1F3D] to-[#1a3a6e] text-white py-12">
        <div className="container">
          <div className="flex flex-wrap gap-2 mb-4">
            {relatedProfessions.map(p => (
              <Link
                key={p.id}
                href={`/${p.slug}`}
                className="text-xs font-medium bg-white/10 text-blue-100 rounded-full px-2.5 py-1 hover:bg-white/20 transition-colors"
              >
                {p.name}
              </Link>
            ))}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{task.name}</h1>
          <p className="text-blue-100 text-lg max-w-2xl">{task.description}</p>
        </div>
      </section>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Primary Tool Featured */}
            {primaryTool && primaryTool.toolProfessions[0] && (
              <div>
                <h2 className="text-xl font-bold text-[#0F1F3D] mb-4">Recommended Tool</h2>
                <div className="rounded-xl border-2 border-[#1A56A0] bg-blue-50/50 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#0F1F3D]">{primaryTool.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{primaryTool.shortDesc}</p>
                    </div>
                    {primaryTool.aiOutputEnabled && (
                      <span className="text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5">
                        AI
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Link
                      href={`/${primaryTool.toolProfessions[0].profession.slug}/${primaryTool.slug}`}
                      className="bg-[#1A56A0] text-white font-medium px-5 py-2 rounded-lg hover:bg-[#0F1F3D] transition-colors text-sm"
                    >
                      Use Tool
                    </Link>
                    <Link
                      href={`/prompts/${primaryTool.slug}`}
                      className="border border-[#1A56A0] text-[#1A56A0] font-medium px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                    >
                      View Prompts
                    </Link>
                    <Link
                      href={`/blog/${primaryTool.slug}`}
                      className="border border-gray-200 text-gray-700 font-medium px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Read Guide
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* All Tools */}
            {tools.length > 1 && (
              <div>
                <h2 className="text-xl font-bold text-[#0F1F3D] mb-4">All Tools for This Task</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tools.map((tool) => {
                    const profSlug = tool.toolProfessions[0]?.profession.slug
                    if (!profSlug) return null
                    return (
                      <ToolCard
                        key={tool.id}
                        name={tool.name}
                        shortDesc={tool.shortDesc}
                        slug={tool.slug}
                        professionSlug={profSlug}
                        aiOutputEnabled={tool.aiOutputEnabled}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Resources */}
            {tools.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[#0F1F3D] mb-4">Guides & Prompts</h2>
                <div className="space-y-3">
                  {tools.map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                      <p className="font-medium text-[#0F1F3D] text-sm">{tool.name}</p>
                      <div className="flex gap-2">
                        <Link href={`/prompts/${tool.slug}`} className="text-xs text-[#1A56A0] hover:underline">
                          Prompts
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link href={`/blog/${tool.slug}`} className="text-xs text-[#1A56A0] hover:underline">
                          Guide
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {relatedProfessions.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-[#0F1F3D] mb-3">Related Professions</h3>
                <ul className="space-y-2">
                  {relatedProfessions.map(p => (
                    <li key={p.id}>
                      <Link href={`/${p.slug}`} className="text-sm text-[#1A56A0] hover:underline">
                        {p.name} Tools
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </SiteLayout>
  )
}

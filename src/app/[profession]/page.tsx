import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { ToolCard } from '@/components/tools/ToolCard'
import type { ToolField } from '@/types'

export const revalidate = 3600

interface Props {
  params: { profession: string }
}

const adminPaths = ['admin', 'api', 'prompts', 'blog', 'tasks']

async function getProfessionData(slug: string) {
  try {
    return await prisma.profession.findUnique({
      where: { slug, isActive: true },
      include: {
        toolProfessions: {
          where: { tool: { status: 'LIVE' } },
          include: {
            tool: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        taskProfessions: {
          include: { task: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
  } catch (error) {
    console.error('[ProfessionPage] DB error for slug:', slug, error)
    return null
  }
}

export async function generateStaticParams() {
  try {
    const professions = await prisma.profession.findMany({
      where: { isActive: true },
      select: { slug: true },
    })
    return professions.map(p => ({ profession: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profession = await getProfessionData(params.profession).catch(() => null)
  if (!profession) return {}

  const title = profession.seoTitle || `AI Tools for ${profession.name} | PromptDesk`
  const description = profession.seoDesc || profession.description

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${profession.slug}`,
    },
    alternates: {
      canonical: `/${profession.slug}`,
    },
  }
}

export default async function ProfessionPage({ params }: Props) {
  if (adminPaths.includes(params.profession)) return notFound()

  const profession = await getProfessionData(params.profession)
  if (!profession) return notFound()

  const tools = profession.toolProfessions.map(tp => tp.tool)
  const tasks = profession.taskProfessions
    .map(tp => tp.task)
    .filter((t) => t.status === 'LIVE')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_BASE_URL },
      { '@type': 'ListItem', position: 2, name: profession.name },
    ],
  }

  return (
    <SiteLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0F1F3D] to-[#1a3a6e] text-white py-14">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-blue-200 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span>{profession.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{profession.name}</h1>
          <p className="text-blue-100 text-lg max-w-2xl">{profession.description}</p>
          <p className="text-blue-200 text-sm mt-2">{tools.length} tool{tools.length !== 1 ? 's' : ''} available</p>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tools Grid */}
          <div className="lg:col-span-3">
            {tools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    name={tool.name}
                    shortDesc={tool.shortDesc}
                    slug={tool.slug}
                    professionSlug={profession.slug}
                    aiOutputEnabled={tool.aiOutputEnabled}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <p>No tools available yet for this profession.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {tasks.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h2 className="font-semibold text-[#0F1F3D] mb-3">Common Tasks</h2>
                <ul className="space-y-2">
                  {tasks.map((task) => task && (
                    <li key={task.id}>
                      <Link
                        href={`/tasks/${task.slug}`}
                        className="text-sm text-[#1A56A0] hover:underline"
                      >
                        {task.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="font-semibold text-[#0F1F3D] mb-3">Prompt Library</h2>
              <p className="text-sm text-gray-600 mb-3">
                Browse copy-paste prompts for {profession.name.toLowerCase()}.
              </p>
              {tools.length > 0 && (
                <Link
                  href={`/prompts/${tools[0].slug}`}
                  className="text-sm text-[#1A56A0] hover:underline"
                >
                  View prompts →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}

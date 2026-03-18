import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { GuideRenderer } from '@/components/content/GuideRenderer'
import { FaqRenderer } from '@/components/content/FaqRenderer'
import type { GuideSection, FaqEntry } from '@/types'

export const revalidate = 3600

interface Props {
  params: { 'tool-slug': string }
}

async function getToolData(slug: string) {
  try {
    return await prisma.tool.findFirst({
      where: { slug, status: 'LIVE' },
      include: {
        toolProfessions: {
          where: { isPrimary: true },
          include: { profession: true },
        },
        taskTools: {
          where: { isPrimary: true },
          include: { task: true },
        },
      },
    })
  } catch (error) {
    console.error('[GuidePage] DB error:', error)
    return null
  }
}

async function getRelatedGuides(currentSlug: string, professionId: string) {
  try {
    return await prisma.tool.findMany({
      where: {
        status: 'LIVE',
        slug: { not: currentSlug },
        toolProfessions: { some: { professionId } },
      },
      include: {
        toolProfessions: {
          where: { isPrimary: true },
          include: { profession: true },
        },
      },
      take: 3,
    })
  } catch {
    return []
  }
}

export async function generateStaticParams() {
  try {
    const tools = await prisma.tool.findMany({
      where: { status: 'LIVE' },
      select: { slug: true },
    })
    return tools.map(t => ({ 'tool-slug': t.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await getToolData(params['tool-slug'])
  if (!tool) return {}

  const taskName = tool.taskTools[0]?.task?.name
  const title = tool.seoGuideTitle || `How to ${taskName || 'Use ' + tool.name}: Complete Guide | PromptDesk`
  const description = tool.seoGuideDesc || tool.shortDesc

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/blog/${tool.slug}`,
      type: 'article',
    },
    alternates: { canonical: `/blog/${tool.slug}` },
  }
}

export default async function GuidePage({ params }: Props) {
  const tool = await getToolData(params['tool-slug'])
  if (!tool) return notFound()

  const profession = tool.toolProfessions[0]?.profession
  const guideContent = tool.guideContent as unknown as GuideSection[]
  const faq = tool.faq as unknown as FaqEntry[]
  const taskName = tool.taskTools[0]?.task?.name

  const relatedGuides = profession
    ? await getRelatedGuides(tool.slug, profession.id)
    : []

  const title = tool.seoGuideTitle || `How to ${taskName || 'Use ' + tool.name}: Complete Guide`

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${process.env.NEXT_PUBLIC_BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: title },
    ],
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: tool.seoGuideDesc || tool.shortDesc,
    datePublished: tool.publishedAt?.toISOString() || tool.createdAt.toISOString(),
    dateModified: tool.updatedAt.toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'PromptDesk',
      url: process.env.NEXT_PUBLIC_BASE_URL,
    },
  }

  const faqJsonLd = faq.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }
    : null

  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <div className="border-b bg-gray-50">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#1A56A0]">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#1A56A0]">Guides</Link>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-[200px]">{title}</span>
          </nav>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Article */}
          <article className="lg:col-span-2">
            {profession && (
              <div className="flex items-center gap-2 mb-4">
                <Link
                  href={`/${profession.slug}`}
                  className="text-xs font-medium text-[#1A56A0] bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1 hover:bg-blue-100 transition-colors"
                >
                  {profession.name}
                </Link>
              </div>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-[#0F1F3D] mb-4 leading-tight">{title}</h1>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">{tool.shortDesc}</p>

            {guideContent.length > 0 ? (
              <GuideRenderer sections={guideContent} />
            ) : (
              <p className="text-gray-500">Guide content coming soon.</p>
            )}

            {/* Inline CTA */}
            {profession && (
              <div className="my-10 rounded-xl bg-gradient-to-r from-[#0F1F3D] to-[#1A56A0] text-white p-6">
                <h3 className="font-bold text-lg mb-2">Ready to try it yourself?</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Use our free {tool.name} to generate professional results in seconds.
                </p>
                <Link
                  href={`/${profession.slug}/${tool.slug}`}
                  className="inline-flex items-center gap-2 bg-white text-[#0F1F3D] font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                >
                  Use {tool.name} — Free
                </Link>
              </div>
            )}

            {faq.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[#0F1F3D] mb-4">Frequently Asked Questions</h2>
                <FaqRenderer entries={faq} />
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {profession && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 sticky top-24">
                <h3 className="font-semibold text-[#0F1F3D] mb-3">Use the Tool</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Try the free {tool.name} to get results instantly.
                </p>
                <Link
                  href={`/${profession.slug}/${tool.slug}`}
                  className="block w-full text-center bg-[#1A56A0] text-white font-medium py-2.5 rounded-lg hover:bg-[#0F1F3D] transition-colors text-sm"
                >
                  Open {tool.name}
                </Link>
                <Link
                  href={`/prompts/${tool.slug}`}
                  className="block w-full text-center border border-gray-200 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm mt-2"
                >
                  Browse Prompts
                </Link>
              </div>
            )}

            {relatedGuides.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="font-semibold text-[#0F1F3D] mb-3">Related Guides</h3>
                <ul className="space-y-2">
                  {relatedGuides.map(guide => (
                    <li key={guide.id}>
                      <Link
                        href={`/blog/${guide.slug}`}
                        className="text-sm text-[#1A56A0] hover:underline leading-snug"
                      >
                        {guide.seoGuideTitle || `${guide.name} Guide`}
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

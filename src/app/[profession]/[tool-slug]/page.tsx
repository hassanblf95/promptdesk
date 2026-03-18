import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { ToolForm } from '@/components/tools/ToolForm'
import { RelatedTools } from '@/components/tools/RelatedTools'
import { GuideRenderer } from '@/components/content/GuideRenderer'
import { FaqRenderer } from '@/components/content/FaqRenderer'
import type { ToolField, GuideSection, FaqEntry } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: { profession: string; 'tool-slug': string }
}

async function getToolData(professionSlug: string, toolSlug: string) {
  try {
    return await prisma.tool.findFirst({
      where: {
        slug: toolSlug,
        status: 'LIVE',
        toolProfessions: {
          some: { profession: { slug: professionSlug } },
        },
      },
      include: {
        toolProfessions: {
          include: { profession: true },
        },
      },
    })
  } catch (error) {
    console.error('[ToolPage] DB error:', error)
    return null
  }
}

async function getRelatedTools(slugs: string[]) {
  if (!slugs || slugs.length === 0) return []
  try {
    return await prisma.tool.findMany({
      where: { slug: { in: slugs }, status: 'LIVE' },
      include: {
        toolProfessions: {
          where: { isPrimary: true },
          include: { profession: true },
        },
      },
      take: 4,
    })
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await getToolData(params.profession, params['tool-slug'])
  if (!tool) return {}

  const title = tool.seoToolTitle || `Free ${tool.name} | PromptDesk`
  const description = tool.seoToolDesc || tool.shortDesc
  const profession = tool.toolProfessions[0]?.profession

  const jsonLdWebApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.shortDesc,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/${profession?.slug}/${tool.slug}`,
    applicationCategory: 'ProductivityApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${params.profession}/${params['tool-slug']}`,
      type: 'website',
    },
    alternates: {
      canonical: `/${params.profession}/${params['tool-slug']}`,
    },
    other: {
      'application/ld+json': JSON.stringify(jsonLdWebApp),
    },
  }
}

export default async function ToolPage({ params }: Props) {
  const tool = await getToolData(params.profession, params['tool-slug'])
  if (!tool) return notFound()

  const profession = tool.toolProfessions.find(tp => tp.profession.slug === params.profession)?.profession
    || tool.toolProfessions[0]?.profession

  if (!profession) return notFound()

  const fieldsSchema = tool.fieldsSchema as unknown as ToolField[]
  const guideContent = tool.guideContent as unknown as GuideSection[]
  const faq = tool.faq as unknown as FaqEntry[]
  const relatedSlugs = (tool.relatedSlugs as unknown as string[]) || []

  const relatedTools = await getRelatedTools(relatedSlugs)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_BASE_URL },
      { '@type': 'ListItem', position: 2, name: profession.name, item: `${process.env.NEXT_PUBLIC_BASE_URL}/${profession.slug}` },
      { '@type': 'ListItem', position: 3, name: tool.name },
    ],
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

  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.shortDesc,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/${profession.slug}/${tool.slug}`,
    applicationCategory: 'ProductivityApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      {/* Breadcrumb */}
      <div className="border-b bg-gray-50">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#1A56A0] transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/${profession.slug}`} className="hover:text-[#1A56A0] transition-colors">{profession.name}</Link>
            <span>/</span>
            <span className="text-gray-900">{tool.name}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-[#0F1F3D] mb-2">{tool.name}</h1>
              <p className="text-gray-600 text-lg">{tool.shortDesc}</p>
              {tool.aiOutputEnabled && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2.5 py-1">
                  ✨ AI Output Available
                </span>
              )}
            </div>

            {/* Tool Form */}
            <ToolForm
              toolSlug={tool.slug}
              fieldsSchema={fieldsSchema}
              aiOutputEnabled={tool.aiOutputEnabled}
            />

            {/* How to use */}
            <div className="mt-10">
              <h2 className="text-xl font-bold text-[#0F1F3D] mb-4">How to use this tool</h2>
              <div className="space-y-3">
                {[
                  `Fill in all the fields above with details specific to your ${tool.name.toLowerCase()} needs.`,
                  'Click "Generate Prompt" to create a customized AI prompt based on your inputs.',
                  tool.aiOutputEnabled
                    ? 'Copy the prompt to ChatGPT or Claude, or click "Generate with AI" for instant results.'
                    : 'Copy the generated prompt and paste it into ChatGPT, Claude, or any other AI assistant.',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1A56A0] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Guide Content */}
            {guideContent.length > 0 && (
              <div className="mt-10">
                <GuideRenderer sections={guideContent} />
              </div>
            )}

            {/* FAQ */}
            {faq.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-bold text-[#0F1F3D] mb-4">Frequently Asked Questions</h2>
                <FaqRenderer entries={faq} />
              </div>
            )}

            {/* CTA to prompt page */}
            <div className="mt-10 rounded-xl bg-gray-50 border border-gray-200 p-6">
              <h3 className="font-semibold text-[#0F1F3D] mb-2">Want more prompts?</h3>
              <p className="text-gray-600 text-sm mb-3">
                Browse our full prompt library for {tool.name} with copy-paste examples for different use cases.
              </p>
              <Link
                href={`/prompts/${tool.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#1A56A0] hover:underline"
              >
                View Prompt Library →
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick links */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-[#0F1F3D] mb-3">Also available</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href={`/prompts/${tool.slug}`} className="text-[#1A56A0] hover:underline flex items-center gap-1">
                    📋 Prompt Library
                  </Link>
                </li>
                <li>
                  <Link href={`/blog/${tool.slug}`} className="text-[#1A56A0] hover:underline flex items-center gap-1">
                    📖 Complete Guide
                  </Link>
                </li>
              </ul>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <RelatedTools
                tools={relatedTools.map(t => ({
                  slug: t.slug,
                  name: t.name,
                  shortDesc: t.shortDesc,
                  professionSlug: t.toolProfessions[0]?.profession.slug || '',
                }))}
              />
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}

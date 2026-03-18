import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { PromptLibraryRenderer } from '@/components/content/PromptLibraryRenderer'
import { FaqRenderer } from '@/components/content/FaqRenderer'
import type { PromptEntry, FaqEntry } from '@/types'

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
      },
    })
  } catch (error) {
    console.error('[PromptsPage] DB error:', error)
    return null
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

  const title = tool.seoPromptTitle || `Best AI Prompts for ${tool.name} (Copy-Paste) | PromptDesk`
  const description = tool.seoPromptDesc || `Copy-paste AI prompts for ${tool.name}. Works with ChatGPT, Claude, and Gemini.`

  return {
    title,
    description,
    openGraph: { title, description, url: `/prompts/${tool.slug}` },
    alternates: { canonical: `/prompts/${tool.slug}` },
  }
}

export default async function PromptLibraryPage({ params }: Props) {
  const tool = await getToolData(params['tool-slug'])
  if (!tool) return notFound()

  const profession = tool.toolProfessions[0]?.profession
  const promptLibrary = tool.promptLibrary as unknown as PromptEntry[]
  const faq = tool.faq as unknown as FaqEntry[]

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Prompts', item: `${process.env.NEXT_PUBLIC_BASE_URL}/prompts` },
      { '@type': 'ListItem', position: 3, name: tool.name },
    ],
  }

  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="border-b bg-gray-50">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#1A56A0] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/prompts" className="hover:text-[#1A56A0] transition-colors">Prompts</Link>
            <span>/</span>
            <span className="text-gray-900">{tool.name}</span>
          </nav>
        </div>
      </div>

      <section className="bg-gradient-to-b from-[#0F1F3D] to-[#1a3a6e] text-white py-12">
        <div className="container">
          {profession && (
            <div className="flex items-center gap-2 text-sm text-blue-200 mb-3">
              <Link href={`/${profession.slug}`} className="hover:text-white transition-colors">{profession.name}</Link>
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {tool.seoPromptTitle || `AI Prompts for ${tool.name}`}
          </h1>
          <p className="text-blue-100 max-w-2xl">
            Copy-paste prompts for {tool.name.toLowerCase()}. Works with ChatGPT, Claude, and Gemini.
          </p>
        </div>
      </section>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PromptLibraryRenderer entries={promptLibrary} />

            {faq.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[#0F1F3D] mb-4">Frequently Asked Questions</h2>
                <FaqRenderer entries={faq} />
              </div>
            )}
          </div>

          <div>
            {/* CTA to Tool */}
            <div className="rounded-xl border border-[#1A56A0]/30 bg-blue-50 p-5 sticky top-24">
              <h3 className="font-semibold text-[#0F1F3D] mb-2">Use the Interactive Tool</h3>
              <p className="text-sm text-gray-600 mb-4">
                Fill in your specific details and generate a customized prompt in seconds.
              </p>
              {profession && (
                <Link
                  href={`/${profession.slug}/${tool.slug}`}
                  className="block w-full text-center bg-[#1A56A0] text-white font-medium py-2.5 rounded-lg hover:bg-[#0F1F3D] transition-colors text-sm"
                >
                  Open {tool.name} →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}

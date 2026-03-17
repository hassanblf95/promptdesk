import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Wand2, BookOpen, Users, Zap } from 'lucide-react'
import { prisma } from '@/lib/db'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { ToolCard } from '@/components/tools/ToolCard'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'PromptDesk — Free AI Tools for Professionals',
  description:
    'AI-powered tools for HR teams, teachers, marketers, sales, recruiters, and freelancers. Generate professional prompts in seconds.',
  openGraph: {
    title: 'PromptDesk — Free AI Tools for Professionals',
    description: 'AI-powered tools for HR, teachers, marketers, sales, and more.',
    url: '/',
  },
}

const professionIcons: Record<string, string> = {
  hr: '👥',
  teachers: '🎓',
  marketers: '📣',
  sales: '📈',
  recruiters: '🔍',
  freelancers: '💻',
}

async function getProfessionsWithCounts() {
  return prisma.profession.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          toolProfessions: {
            where: {
              tool: { status: 'LIVE' },
            },
          },
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })
}

async function getFeaturedTools() {
  return prisma.tool.findMany({
    where: { status: 'LIVE' },
    include: {
      toolProfessions: {
        where: { isPrimary: true },
        include: { profession: true },
      },
    },
    take: 6,
    orderBy: { publishedAt: 'desc' },
  })
}

export default async function HomePage() {
  const [professions, featuredTools] = await Promise.all([
    getProfessionsWithCounts().catch(() => []),
    getFeaturedTools().catch(() => []),
  ])

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0F1F3D] to-[#1A56A0] text-white py-20 md:py-28">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Zap className="h-4 w-4 text-yellow-400" />
            AI tools for non-technical professionals
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
            Generate better AI outputs in seconds
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Structured tools for HR, teachers, marketers, sales, recruiters, and freelancers.
            Fill in a form. Get a perfect prompt. Paste it into ChatGPT or Claude.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/hr"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#0F1F3D] font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors text-base"
            >
              Explore HR Tools
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/prompts"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/20 transition-colors text-base border border-white/20"
            >
              Browse Prompt Library
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50 border-b">
        <div className="container">
          <h2 className="text-2xl font-bold text-center text-[#0F1F3D] mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                icon: <Wand2 className="h-6 w-6 text-[#1A56A0]" />,
                title: 'Choose your tool',
                desc: 'Pick from dozens of AI tools built for your profession.',
              },
              {
                step: '2',
                icon: <Users className="h-6 w-6 text-[#1A56A0]" />,
                title: 'Fill in the form',
                desc: 'Enter your specific details. No prompt engineering needed.',
              },
              {
                step: '3',
                icon: <BookOpen className="h-6 w-6 text-[#1A56A0]" />,
                title: 'Get your output',
                desc: 'Copy the prompt or generate AI output instantly.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="w-7 h-7 rounded-full bg-[#1A56A0] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </span>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-[#0F1F3D] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profession Directory */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-[#0F1F3D] mb-2">Tools by profession</h2>
          <p className="text-gray-600 mb-8">Choose your role to see relevant AI tools.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {professions.map((profession) => (
              <Link
                key={profession.slug}
                href={`/${profession.slug}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 hover:border-[#1A56A0] hover:shadow-md transition-all text-center"
              >
                <span className="text-3xl">{professionIcons[profession.slug] || '🛠️'}</span>
                <div>
                  <p className="font-semibold text-sm text-[#0F1F3D] group-hover:text-[#1A56A0] transition-colors leading-snug">
                    {profession.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {profession._count.toolProfessions} tool{profession._count.toolProfessions !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      {featuredTools.length > 0 && (
        <section className="py-16 bg-gray-50 border-t">
          <div className="container">
            <h2 className="text-2xl font-bold text-[#0F1F3D] mb-2">Featured tools</h2>
            <p className="text-gray-600 mb-8">Popular tools used by thousands of professionals.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredTools.map((tool) => {
                const primaryProfession = tool.toolProfessions[0]?.profession
                if (!primaryProfession) return null
                return (
                  <ToolCard
                    key={tool.id}
                    name={tool.name}
                    shortDesc={tool.shortDesc}
                    slug={tool.slug}
                    professionSlug={primaryProfession.slug}
                    aiOutputEnabled={tool.aiOutputEnabled}
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="py-16 bg-[#1A56A0] text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to work smarter with AI?</h2>
          <p className="text-blue-100 mb-8 text-lg max-w-xl mx-auto">
            Pick your profession and start generating professional AI prompts in seconds. No account required.
          </p>
          <Link
            href="/prompts"
            className="inline-flex items-center gap-2 bg-white text-[#0F1F3D] font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors text-base"
          >
            Browse All Prompts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  )
}

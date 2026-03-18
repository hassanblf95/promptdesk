import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { SiteLayout } from '@/components/layout/SiteLayout'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Task Hub — AI Tools by Task | PromptDesk',
  description: 'Find AI tools organized by task. Write job descriptions, cold emails, lesson plans, and more with AI assistance.',
  openGraph: {
    title: 'Task Hub | PromptDesk',
    description: 'AI tools organized by professional task.',
    url: '/tasks',
  },
  alternates: { canonical: '/tasks' },
}

export default async function TasksIndexPage() {
  const tasks = await prisma.task.findMany({
    where: { status: 'LIVE' },
    include: {
      taskTools: {
        include: { tool: { include: { toolProfessions: { where: { isPrimary: true }, include: { profession: true } } } } },
      },
      taskProfessions: {
        include: { profession: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-[#0F1F3D] to-[#1a3a6e] text-white py-14">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Task Hub</h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Find AI tools organized by the task you need to complete.
          </p>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.slug}`}
              className="group rounded-xl border border-gray-200 bg-white p-6 hover:border-[#1A56A0] hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-2 flex-wrap mb-2">
                {task.taskProfessions.map(tp => (
                  <span key={tp.professionId} className="text-xs font-medium text-[#1A56A0] bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                    {tp.profession.name}
                  </span>
                ))}
              </div>
              <h2 className="font-semibold text-[#0F1F3D] group-hover:text-[#1A56A0] transition-colors text-lg">
                {task.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1 mb-3">{task.description}</p>
              <p className="text-xs text-gray-400">{task.taskTools.length} tool{task.taskTools.length !== 1 ? 's' : ''} available</p>
            </Link>
          ))}
        </div>
      </div>
    </SiteLayout>
  )
}

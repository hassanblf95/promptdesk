import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ToolEditor } from '@/components/admin/ToolEditor'
import type { ToolField, GuideSection, PromptEntry, FaqEntry } from '@/types'

interface Props {
  params: { id: string }
}

export default async function EditToolPage({ params }: Props) {
  const [tool, professions, tasks] = await Promise.all([
    prisma.tool.findUnique({
      where: { id: params.id },
      include: {
        toolProfessions: { include: { profession: true } },
        taskTools: { include: { task: true } },
      },
    }),
    prisma.profession.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.task.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!tool) return notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F1F3D]">Edit Tool</h1>
        <p className="text-gray-500 text-sm mt-1 font-mono">{tool.slug}</p>
      </div>
      <ToolEditor
        professions={professions}
        tasks={tasks}
        initialData={{
          id: tool.id,
          slug: tool.slug,
          name: tool.name,
          shortDesc: tool.shortDesc,
          status: tool.status,
          blueprint: tool.blueprint,
          aiOutputEnabled: tool.aiOutputEnabled,
          fieldsSchema: JSON.stringify(tool.fieldsSchema as unknown as ToolField[], null, 2),
          promptTemplate: tool.promptTemplate,
          seoToolTitle: tool.seoToolTitle || '',
          seoToolDesc: tool.seoToolDesc || '',
          seoPromptTitle: tool.seoPromptTitle || '',
          seoPromptDesc: tool.seoPromptDesc || '',
          seoGuideTitle: tool.seoGuideTitle || '',
          seoGuideDesc: tool.seoGuideDesc || '',
          relatedSlugs: JSON.stringify((tool.relatedSlugs as unknown as string[]) || []),
          guideContent: JSON.stringify(tool.guideContent as unknown as GuideSection[], null, 2),
          promptLibrary: JSON.stringify(tool.promptLibrary as unknown as PromptEntry[], null, 2),
          faq: JSON.stringify(tool.faq as unknown as FaqEntry[], null, 2),
          professionIds: tool.toolProfessions.map(tp => tp.professionId),
          taskIds: tool.taskTools.map(tt => tt.taskId),
        }}
      />
    </div>
  )
}

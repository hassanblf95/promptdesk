'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, Archive, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { validateFieldsSchema, validateTemplateVars } from '@/lib/prompt-engine'

interface Profession {
  id: string
  slug: string
  name: string
}

interface Task {
  id: string
  slug: string
  name: string
}

interface ToolEditorProps {
  professions: Profession[]
  tasks: Task[]
  initialData?: {
    id?: string
    slug?: string
    name?: string
    shortDesc?: string
    status?: string
    blueprint?: string
    aiOutputEnabled?: boolean
    fieldsSchema?: string
    promptTemplate?: string
    seoToolTitle?: string
    seoToolDesc?: string
    seoPromptTitle?: string
    seoPromptDesc?: string
    seoGuideTitle?: string
    seoGuideDesc?: string
    relatedSlugs?: string
    guideContent?: string
    promptLibrary?: string
    faq?: string
    professionIds?: string[]
    taskIds?: string[]
  }
}

export function ToolEditor({ professions, tasks, initialData }: ToolEditorProps) {
  const router = useRouter()
  const isEditing = !!initialData?.id

  const [formData, setFormData] = useState({
    slug: initialData?.slug || '',
    name: initialData?.name || '',
    shortDesc: initialData?.shortDesc || '',
    status: initialData?.status || 'DRAFT',
    blueprint: initialData?.blueprint || 'text-generator',
    aiOutputEnabled: initialData?.aiOutputEnabled || false,
    fieldsSchema: initialData?.fieldsSchema || '[]',
    promptTemplate: initialData?.promptTemplate || '',
    seoToolTitle: initialData?.seoToolTitle || '',
    seoToolDesc: initialData?.seoToolDesc || '',
    seoPromptTitle: initialData?.seoPromptTitle || '',
    seoPromptDesc: initialData?.seoPromptDesc || '',
    seoGuideTitle: initialData?.seoGuideTitle || '',
    seoGuideDesc: initialData?.seoGuideDesc || '',
    relatedSlugs: initialData?.relatedSlugs || '[]',
    guideContent: initialData?.guideContent || '[]',
    promptLibrary: initialData?.promptLibrary || '[]',
    faq: initialData?.faq || '[]',
    professionIds: initialData?.professionIds || [],
    taskIds: initialData?.taskIds || [],
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<string[]>([])
  const [templateErrors, setTemplateErrors] = useState<string[]>([])

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80)
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name, isEditing])

  // Real-time field schema validation
  useEffect(() => {
    try {
      const parsed = JSON.parse(formData.fieldsSchema)
      const result = validateFieldsSchema(parsed)
      setFieldErrors(result.errors)
    } catch {
      setFieldErrors(['Invalid JSON format'])
    }
  }, [formData.fieldsSchema])

  // Real-time template var validation
  useEffect(() => {
    try {
      const fields = JSON.parse(formData.fieldsSchema)
      if (Array.isArray(fields) && fields.length > 0) {
        const result = validateTemplateVars(formData.promptTemplate, fields)
        if (!result.valid) {
          setTemplateErrors(result.missingVars.map(v => `{{${v}}} has no matching field`))
        } else {
          setTemplateErrors([])
        }
      } else {
        setTemplateErrors([])
      }
    } catch {
      setTemplateErrors([])
    }
  }, [formData.promptTemplate, formData.fieldsSchema])

  const handleSave = async (newStatus?: string) => {
    setIsSaving(true)
    setSaveError(null)

    const payload = {
      ...formData,
      status: newStatus || formData.status,
      fieldsSchema: JSON.parse(formData.fieldsSchema || '[]'),
      promptLibrary: JSON.parse(formData.promptLibrary || '[]'),
      guideContent: JSON.parse(formData.guideContent || '[]'),
      faq: JSON.parse(formData.faq || '[]'),
      relatedSlugs: JSON.parse(formData.relatedSlugs || '[]'),
    }

    try {
      const url = isEditing ? `/api/admin/tools/${initialData!.id}` : '/api/admin/tools'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setSaveError(data.error || 'Save failed')
        return
      }

      const savedTool = await res.json()

      // If publishing, trigger revalidation
      if (newStatus === 'LIVE') {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-revalidation-secret': process.env.NEXT_PUBLIC_REVALIDATION_SECRET || '',
          },
          body: JSON.stringify({ toolSlug: savedTool.slug, type: 'all' }),
        })
      }

      router.push('/admin/tools')
    } catch {
      setSaveError('Network error. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const update = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Basic Info */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#0F1F3D]">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Tool Name</Label>
            <Input
              value={formData.name}
              onChange={e => update('name', e.target.value)}
              placeholder="e.g. Job Description Generator"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Slug (URL)</Label>
            <Input
              value={formData.slug}
              onChange={e => update('slug', e.target.value)}
              placeholder="e.g. job-description-generator"
              className="font-mono text-sm"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Short Description</Label>
          <Textarea
            value={formData.shortDesc}
            onChange={e => update('shortDesc', e.target.value)}
            placeholder="One sentence description of what this tool does..."
            rows={2}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={v => update('status', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="LIVE">Live</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Blueprint</Label>
            <Select value={formData.blueprint} onValueChange={v => update('blueprint', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-generator">Text Generator</SelectItem>
                <SelectItem value="email-composer">Email Composer</SelectItem>
                <SelectItem value="list-generator">List Generator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-3 pb-1">
            <Switch
              checked={formData.aiOutputEnabled}
              onCheckedChange={v => update('aiOutputEnabled', v)}
            />
            <Label>AI Output Enabled</Label>
          </div>
        </div>
      </section>

      {/* Profession & Task Assignment */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#0F1F3D]">Assignments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Professions</Label>
            <div className="space-y-1 max-h-40 overflow-y-auto rounded border p-2">
              {professions.map(p => (
                <label key={p.id} className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.professionIds.includes(p.id)}
                    onChange={e => {
                      const ids = e.target.checked
                        ? [...formData.professionIds, p.id]
                        : formData.professionIds.filter(id => id !== p.id)
                      update('professionIds', ids)
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tasks</Label>
            <div className="space-y-1 max-h-40 overflow-y-auto rounded border p-2">
              {tasks.map(t => (
                <label key={t.id} className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.taskIds.includes(t.id)}
                    onChange={e => {
                      const ids = e.target.checked
                        ? [...formData.taskIds, t.id]
                        : formData.taskIds.filter(id => id !== t.id)
                      update('taskIds', ids)
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{t.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fields Schema */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#0F1F3D]">Fields Schema</h2>
        <Textarea
          value={formData.fieldsSchema}
          onChange={e => update('fieldsSchema', e.target.value)}
          rows={10}
          className="font-mono text-xs"
          placeholder='[{"key": "field_name", "type": "text", "label": "Field Label", "required": true}]'
        />
        {fieldErrors.length > 0 && (
          <div className="space-y-1">
            {fieldErrors.map((err, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {err}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Prompt Template */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#0F1F3D]">Prompt Template</h2>
        <p className="text-sm text-gray-500">Use {'{{'}<span>variable</span>{'}}'} syntax to reference field keys.</p>
        <Textarea
          value={formData.promptTemplate}
          onChange={e => update('promptTemplate', e.target.value)}
          rows={8}
          className="font-mono text-sm"
          placeholder="Write your prompt template here..."
        />
        {templateErrors.length > 0 && (
          <div className="space-y-1">
            {templateErrors.map((err, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {err}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SEO */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#0F1F3D]">SEO Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'seoToolTitle', label: 'Tool Page Title', max: 70 },
            { key: 'seoToolDesc', label: 'Tool Page Description', max: 160 },
            { key: 'seoPromptTitle', label: 'Prompt Page Title', max: 70 },
            { key: 'seoPromptDesc', label: 'Prompt Page Description', max: 160 },
            { key: 'seoGuideTitle', label: 'Guide Page Title', max: 70 },
            { key: 'seoGuideDesc', label: 'Guide Page Description', max: 160 },
          ].map(field => (
            <div key={field.key} className="space-y-1.5">
              <Label>{field.label} <span className="text-gray-400 font-normal">(max {field.max})</span></Label>
              {field.max === 160 ? (
                <Textarea
                  value={(formData as Record<string, unknown>)[field.key] as string || ''}
                  onChange={e => update(field.key, e.target.value)}
                  rows={2}
                  maxLength={field.max}
                />
              ) : (
                <Input
                  value={(formData as Record<string, unknown>)[field.key] as string || ''}
                  onChange={e => update(field.key, e.target.value)}
                  maxLength={field.max}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Content JSON fields */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-[#0F1F3D]">Content</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Guide Content (JSON)</Label>
            <Textarea
              value={formData.guideContent}
              onChange={e => update('guideContent', e.target.value)}
              rows={8}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Prompt Library (JSON)</Label>
            <Textarea
              value={formData.promptLibrary}
              onChange={e => update('promptLibrary', e.target.value)}
              rows={8}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label>FAQ (JSON)</Label>
            <Textarea
              value={formData.faq}
              onChange={e => update('faq', e.target.value)}
              rows={6}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Related Tool Slugs (JSON array)</Label>
            <Input
              value={formData.relatedSlugs}
              onChange={e => update('relatedSlugs', e.target.value)}
              placeholder='["tool-slug-1", "tool-slug-2"]'
              className="font-mono text-sm"
            />
          </div>
        </div>
      </section>

      {/* Error */}
      {saveError && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{saveError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-gray-200 px-8 py-4 flex items-center gap-3">
        <Button
          onClick={() => handleSave('DRAFT')}
          disabled={isSaving}
          variant="outline"
        >
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSave('REVIEW')}
          disabled={isSaving}
          variant="outline"
          className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
        >
          Submit for Review
        </Button>
        <Button
          onClick={() => handleSave('LIVE')}
          disabled={isSaving || fieldErrors.length > 0}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Eye className="h-4 w-4 mr-2" />
          {isSaving ? 'Publishing...' : 'Publish Live'}
        </Button>
        {isEditing && (
          <Button
            onClick={() => handleSave('ARCHIVED')}
            disabled={isSaving}
            variant="ghost"
            className="ml-auto text-gray-500 hover:text-red-600"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        )}
      </div>
    </div>
  )
}

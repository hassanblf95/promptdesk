'use client'

import { useState, useEffect } from 'react'
import { Plus, Save, X, Edit2 } from 'lucide-react'
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
import { StatusBadge } from '@/components/admin/StatusBadge'

interface Task {
  id: string
  slug: string
  name: string
  description: string
  status: string
  seoTitle: string | null
  seoDesc: string | null
}

const emptyForm = {
  slug: '',
  name: '',
  description: '',
  status: 'DRAFT',
  seoTitle: '',
  seoDesc: '',
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    const res = await fetch('/api/admin/tasks')
    if (res.ok) setTasks(await res.json())
  }

  useEffect(() => { fetchTasks() }, [])

  const handleEdit = (t: Task) => {
    setEditingId(t.id)
    setShowCreate(false)
    setForm({
      slug: t.slug,
      name: t.name,
      description: t.description,
      status: t.status,
      seoTitle: t.seoTitle || '',
      seoDesc: t.seoDesc || '',
    })
  }

  const handleSave = async (id?: string) => {
    setIsSaving(true)
    setError(null)

    const url = id ? `/api/admin/tasks/${id}` : '/api/admin/tasks'
    const method = id ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setEditingId(null)
      setShowCreate(false)
      setForm({ ...emptyForm })
      fetchTasks()
    } else {
      const data = await res.json()
      setError(data.error || 'Save failed')
    }
    setIsSaving(false)
  }

  const update = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }))

  const InlineForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="rounded-xl border-2 border-[#1A56A0] bg-blue-50 p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={form.name} onChange={e => update('name', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Slug</Label>
          <Input value={form.slug} onChange={e => update('slug', e.target.value)} className="font-mono text-sm" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => update('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="LIVE">Live</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>SEO Title</Label>
          <Input value={form.seoTitle} onChange={e => update('seoTitle', e.target.value)} maxLength={70} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>SEO Description</Label>
        <Textarea value={form.seoDesc} onChange={e => update('seoDesc', e.target.value)} rows={2} maxLength={160} />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={isSaving}>
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="h-3.5 w-3.5 mr-1.5" />
          Cancel
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F3D]">Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">{tasks.length} tasks</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setEditingId(null); setForm({ ...emptyForm }) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {showCreate && (
        <InlineForm onSave={() => handleSave()} onCancel={() => setShowCreate(false)} />
      )}

      <div className="space-y-3">
        {tasks.map((t) => (
          <div key={t.id}>
            {editingId === t.id ? (
              <InlineForm onSave={() => handleSave(t.id)} onCancel={() => setEditingId(null)} />
            ) : (
              <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#0F1F3D]">{t.name}</p>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{t.slug}</p>
                  <p className="text-sm text-gray-600 mt-1">{t.description}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(t)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

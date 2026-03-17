'use client'

import { useState, useEffect } from 'react'
import { Plus, Save, X, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface Profession {
  id: string
  slug: string
  name: string
  description: string
  iconKey: string
  sortOrder: number
  isActive: boolean
}

const emptyForm = {
  slug: '',
  name: '',
  description: '',
  iconKey: 'briefcase',
  sortOrder: 0,
  isActive: true,
}

export default function ProfessionsPage() {
  const [professions, setProfessions] = useState<Profession[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfessions = async () => {
    const res = await fetch('/api/admin/professions')
    if (res.ok) {
      const data = await res.json()
      setProfessions(data)
    }
  }

  useEffect(() => {
    fetchProfessions()
  }, [])

  const handleEdit = (p: Profession) => {
    setEditingId(p.id)
    setShowCreate(false)
    setForm({
      slug: p.slug,
      name: p.name,
      description: p.description,
      iconKey: p.iconKey,
      sortOrder: p.sortOrder,
      isActive: p.isActive,
    })
  }

  const handleSave = async (id?: string) => {
    setIsSaving(true)
    setError(null)

    const url = id ? `/api/admin/professions/${id}` : '/api/admin/professions'
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
      fetchProfessions()
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
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Icon Key</Label>
          <Input value={form.iconKey} onChange={e => update('iconKey', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Sort Order</Label>
          <Input type="number" value={form.sortOrder} onChange={e => update('sortOrder', parseInt(e.target.value))} />
        </div>
        <div className="flex items-end gap-2 pb-1">
          <Switch checked={form.isActive} onCheckedChange={v => update('isActive', v)} />
          <Label>Active</Label>
        </div>
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
          <h1 className="text-2xl font-bold text-[#0F1F3D]">Professions</h1>
          <p className="text-gray-500 text-sm mt-1">{professions.length} professions</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setEditingId(null); setForm({ ...emptyForm }) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Profession
        </Button>
      </div>

      {showCreate && (
        <InlineForm
          onSave={() => handleSave()}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <div className="space-y-3">
        {professions.map((p) => (
          <div key={p.id}>
            {editingId === p.id ? (
              <InlineForm
                onSave={() => handleSave(p.id)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#0F1F3D]">{p.name}</p>
                      {!p.isActive && (
                        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{p.slug}</p>
                    <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(p)}>
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

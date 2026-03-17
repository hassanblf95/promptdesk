'use client'

import { useState, useRef } from 'react'
import { Upload, FileJson, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImportResultItem {
  slug: string
  error?: string
}

interface ImportResults {
  imported: number
  skipped: number
  errors: ImportResultItem[]
}

const SAMPLE_SPEC = [
  {
    slug: 'email-subject-generator',
    name: 'Email Subject Line Generator',
    shortDesc: 'Generate compelling email subject lines that increase open rates.',
    professionSlug: 'marketers',
    blueprint: 'text-generator',
    fields: [
      { key: 'email_topic', type: 'text', label: 'Email Topic', placeholder: 'e.g. Product launch announcement', required: true },
      { key: 'target_audience', type: 'text', label: 'Target Audience', placeholder: 'e.g. SaaS founders', required: true },
      { key: 'tone', type: 'select', label: 'Tone', required: true, options: [
        { value: 'professional', label: 'Professional' },
        { value: 'urgent', label: 'Urgent' },
        { value: 'curious', label: 'Curiosity-driven' },
        { value: 'friendly', label: 'Friendly' },
      ]},
    ],
    promptTemplate: 'Generate 5 compelling email subject lines for {{email_topic}}.\n\nTarget audience: {{target_audience}}\nTone: {{tone}}\n\nRequirements:\n- Under 50 characters each\n- A/B test variations\n- No spam trigger words\n- Include an emoji option',
    seoToolTitle: 'Free Email Subject Line Generator | PromptDesk',
    seoToolDesc: 'Generate high-converting email subject lines with AI. Free tool for email marketers.',
  },
]

export function SpecImporter() {
  const [isDragging, setIsDragging] = useState(false)
  const [results, setResults] = useState<ImportResults | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    setParseError(null)
    setResults(null)

    let specs: unknown[]

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text()
        const parsed = JSON.parse(text)
        specs = Array.isArray(parsed) ? parsed : [parsed]
      } else if (file.name.endsWith('.csv')) {
        const text = await file.text()
        const lines = text.trim().split('\n')
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
        specs = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
          const obj: Record<string, unknown> = {}
          headers.forEach((h, i) => {
            obj[h] = values[i] || ''
          })
          if (obj.fields && typeof obj.fields === 'string') {
            try { obj.fields = JSON.parse(obj.fields) } catch { obj.fields = [] }
          }
          return obj
        })
      } else {
        setParseError('Unsupported file type. Please upload a .json or .csv file.')
        return
      }
    } catch {
      setParseError('Failed to parse file. Please check the format and try again.')
      return
    }

    setIsImporting(true)
    try {
      const response = await fetch('/api/admin/import-specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specs }),
      })
      const data = await response.json()
      if (!response.ok) {
        setParseError(data.error || 'Import failed')
      } else {
        setResults(data)
      }
    } catch {
      setParseError('Network error during import.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const downloadSample = () => {
    const blob = new Blob([JSON.stringify(SAMPLE_SPEC, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-tool-spec.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#0F1F3D]">Upload Spec File</h2>
        <Button variant="outline" size="sm" onClick={downloadSample}>
          <Download className="h-4 w-4 mr-2" />
          Sample JSON
        </Button>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-[#1A56A0] bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".json,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <FileJson className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-base font-medium text-gray-700 mb-1">
          Drop your file here or click to browse
        </p>
        <p className="text-sm text-gray-500">Supports .json and .csv formats</p>
      </div>

      {parseError && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{parseError}</p>
        </div>
      )}

      {isImporting && (
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <Upload className="h-5 w-5 text-blue-500 animate-pulse" />
          <p className="text-sm text-blue-700">Importing specs...</p>
        </div>
      )}

      {results && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-[#0F1F3D]">Import Results</h3>
          </div>
          <div className="p-4">
            <div className="flex gap-6 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">{results.imported} imported</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium">{results.skipped} skipped</span>
              </div>
              {results.errors.length > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium">{results.errors.length} errors</span>
                </div>
              )}
            </div>

            {results.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Errors:</h4>
                {results.errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded p-2">
                    <span className="font-mono font-medium">{err.slug}:</span>
                    <span>{err.error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

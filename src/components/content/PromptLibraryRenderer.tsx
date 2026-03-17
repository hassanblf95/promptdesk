'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PromptEntry } from '@/types'

interface PromptLibraryRendererProps {
  entries: PromptEntry[]
}

const platformColors: Record<string, string> = {
  chatgpt: 'bg-green-100 text-green-700 border-green-200',
  claude: 'bg-purple-100 text-purple-700 border-purple-200',
  gemini: 'bg-blue-100 text-blue-700 border-blue-200',
  any: 'bg-gray-100 text-gray-600 border-gray-200',
}

const platformLabels: Record<string, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini',
  any: 'Any AI',
}

function PromptCard({ entry }: { entry: PromptEntry }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = entry.prompt
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-[#0F1F3D] text-sm">{entry.useCase}</h3>
          <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${platformColors[entry.platform] || platformColors.any}`}>
            {platformLabels[entry.platform] || entry.platform}
          </span>
          {entry.tags.map((tag) => (
            <span key={tag} className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-gray-500 hover:text-gray-900 flex-shrink-0"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1 text-green-600" />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-700 font-mono leading-relaxed whitespace-pre-wrap">{entry.prompt}</p>
      </div>
    </div>
  )
}

export function PromptLibraryRenderer({ entries }: PromptLibraryRendererProps) {
  if (!entries || entries.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No prompts available yet.</p>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <PromptCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}

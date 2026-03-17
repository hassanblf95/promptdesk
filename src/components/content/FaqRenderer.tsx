'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { FaqEntry } from '@/types'

interface FaqRendererProps {
  entries: FaqEntry[]
}

function FaqItem({ entry }: { entry: FaqEntry }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left gap-4 hover:text-[#1A56A0] transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-[#0F1F3D] hover:text-[#1A56A0] transition-colors text-sm md:text-base">
          {entry.question}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-4">
          <p className="text-gray-600 leading-relaxed text-sm">{entry.answer}</p>
        </div>
      )}
    </div>
  )
}

export function FaqRenderer({ entries }: FaqRendererProps) {
  if (!entries || entries.length === 0) return null

  return (
    <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white px-6 py-2">
      {entries.map((entry) => (
        <FaqItem key={entry.id} entry={entry} />
      ))}
    </div>
  )
}

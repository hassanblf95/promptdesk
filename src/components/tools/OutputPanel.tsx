'use client'

import { useState } from 'react'
import { Copy, Check, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OutputPanelProps {
  prompt: string
  toolSlug: string
  aiOutputEnabled: boolean
}

export function OutputPanel({ prompt, toolSlug, aiOutputEnabled }: OutputPanelProps) {
  const [copied, setCopied] = useState(false)
  const [aiOutput, setAiOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiCopied, setAiCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = prompt
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyAi = async () => {
    try {
      await navigator.clipboard.writeText(aiOutput)
      setAiCopied(true)
      setTimeout(() => setAiCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = aiOutput
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setAiCopied(true)
      setTimeout(() => setAiCopied(false), 2000)
    }
  }

  const handleGenerateAI = async () => {
    setIsGenerating(true)
    setAiOutput('')

    try {
      const response = await fetch('/api/generate-output', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolSlug, prompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate AI output')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setAiOutput(accumulated)
      }
    } catch (error) {
      setAiOutput('Error generating AI output. Please try again.')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Generated Prompt */}
      <div className="rounded-xl overflow-hidden border border-gray-700">
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2.5">
          <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">Generated Prompt</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-gray-300 hover:text-white hover:bg-gray-700"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-green-400" />
                <span className="text-xs">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </Button>
        </div>
        <div className="bg-gray-950 p-4">
          <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap leading-relaxed">{prompt}</pre>
        </div>
      </div>

      {/* Usage hint */}
      <p className="text-sm text-gray-500 text-center">
        Paste this prompt into{' '}
        <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="text-[#1A56A0] hover:underline">ChatGPT</a>
        {' '}or{' '}
        <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-[#1A56A0] hover:underline">Claude</a>
        {' '}for best results.
      </p>

      {/* AI Generate Button */}
      {aiOutputEnabled && (
        <Button
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium h-11"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating with AI...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </>
          )}
        </Button>
      )}

      {/* AI Output */}
      {aiOutput && (
        <div className="rounded-xl overflow-hidden border border-purple-200">
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-medium text-white uppercase tracking-wider">AI Output</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAi}
              className="h-7 px-2 text-white hover:bg-white/20"
            >
              {aiCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </Button>
          </div>
          <div className="bg-purple-50/50 p-4">
            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">{aiOutput}</div>
          </div>
        </div>
      )}
    </div>
  )
}

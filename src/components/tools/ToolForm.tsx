'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Wand2 } from 'lucide-react'
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
import { OutputPanel } from './OutputPanel'
import type { ToolField } from '@/types'

interface ToolFormProps {
  toolSlug: string
  fieldsSchema: ToolField[]
  aiOutputEnabled: boolean
}

export function ToolForm({ toolSlug, fieldsSchema, aiOutputEnabled }: ToolFormProps) {
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Record<string, string>>()

  const onSubmit = async (data: Record<string, string>) => {
    setIsLoading(true)
    setError(null)
    setGeneratedPrompt(null)

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolSlug, fieldValues: data }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.errors) {
          setError(result.errors.join(', '))
        } else {
          setError(result.error || 'Failed to generate prompt')
        }
        return
      }

      setGeneratedPrompt(result.prompt)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#0F1F3D] mb-5">Fill in your details</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fieldsSchema.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key} className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {field.type === 'text' || field.type === 'number' ? (
                <Input
                  id={field.key}
                  type={field.type === 'number' ? 'number' : 'text'}
                  placeholder={field.placeholder}
                  {...register(field.key, {
                    required: field.required ? `${field.label} is required` : false,
                  })}
                  className={errors[field.key] ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
              ) : field.type === 'textarea' ? (
                <Textarea
                  id={field.key}
                  placeholder={field.placeholder}
                  rows={4}
                  {...register(field.key, {
                    required: field.required ? `${field.label} is required` : false,
                  })}
                  className={errors[field.key] ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
              ) : field.type === 'select' ? (
                <Select
                  onValueChange={(value) => setValue(field.key, value)}
                >
                  <SelectTrigger
                    id={field.key}
                    className={errors[field.key] ? 'border-red-400 focus:ring-red-400' : ''}
                  >
                    <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'multi-select' ? (
                <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                  {field.options?.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        value={opt.value}
                        className="rounded border-gray-300"
                        onChange={(e) => {
                          const currentValues = (document.querySelectorAll<HTMLInputElement>(
                            `input[type="checkbox"][value]`
                          ))
                          const checked = Array.from(currentValues)
                            .filter(el => el.name === field.key && el.checked)
                            .map(el => el.value)
                          setValue(field.key, checked.join(', '))
                        }}
                        name={field.key}
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              ) : null}

              {errors[field.key] && (
                <p className="text-xs text-red-500">{errors[field.key]?.message}</p>
              )}
            </div>
          ))}

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1A56A0] hover:bg-[#0F1F3D] text-white font-medium h-11 text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Prompt
              </>
            )}
          </Button>
        </form>
      </div>

      {generatedPrompt && (
        <OutputPanel
          prompt={generatedPrompt}
          toolSlug={toolSlug}
          aiOutputEnabled={aiOutputEnabled}
        />
      )}
    </div>
  )
}

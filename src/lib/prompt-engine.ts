import type { ToolField, RenderPromptResult, ValidateFieldsResult, ValidateTemplateResult } from '@/types'

/**
 * Substitutes {{variable}} placeholders with field values.
 * Returns { prompt, errors } — validates required fields are present.
 */
export function renderPrompt(
  template: string,
  fieldValues: Record<string, string>,
  fields: ToolField[]
): RenderPromptResult {
  const errors: string[] = []

  // Validate required fields
  for (const field of fields) {
    if (field.required) {
      const value = fieldValues[field.key]
      if (value === undefined || value === null || String(value).trim() === '') {
        errors.push(`Field "${field.label}" is required`)
      }
    }
  }

  if (errors.length > 0) {
    return { prompt: '', errors }
  }

  // Substitute variables
  let prompt = template
  for (const [key, value] of Object.entries(fieldValues)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    prompt = prompt.replace(regex, String(value))
  }

  // Check for any remaining unfilled variables
  const remainingVars = prompt.match(/\{\{(\w+)\}\}/g)
  if (remainingVars) {
    for (const varRef of remainingVars) {
      const varName = varRef.slice(2, -2)
      const field = fields.find(f => f.key === varName)
      if (!field || !field.required) {
        // Replace optional unfilled vars with empty string
        prompt = prompt.replace(new RegExp(`\\{\\{${varName}\\}\\}`, 'g'), '')
      }
    }
  }

  return { prompt: prompt.trim(), errors: [] }
}

/**
 * Validates a fields_schema JSON array.
 * Returns { valid, errors }
 */
export function validateFieldsSchema(schema: unknown): ValidateFieldsResult {
  const errors: string[] = []

  if (!Array.isArray(schema)) {
    return { valid: false, errors: ['Fields schema must be an array'] }
  }

  if (schema.length === 0) {
    return { valid: false, errors: ['Fields schema must have at least one field'] }
  }

  const validTypes = ['text', 'textarea', 'select', 'multi-select', 'number']
  const seenKeys = new Set<string>()

  for (let i = 0; i < schema.length; i++) {
    const field = schema[i] as Record<string, unknown>

    if (typeof field !== 'object' || field === null) {
      errors.push(`Field at index ${i} must be an object`)
      continue
    }

    // Validate key
    if (typeof field.key !== 'string' || !field.key) {
      errors.push(`Field at index ${i} must have a key`)
    } else if (!/^\w+$/.test(field.key)) {
      errors.push(`Field key "${field.key}" must contain only letters, numbers, and underscores`)
    } else if (seenKeys.has(field.key)) {
      errors.push(`Duplicate field key: "${field.key}"`)
    } else {
      seenKeys.add(field.key)
    }

    // Validate type
    if (typeof field.type !== 'string' || !validTypes.includes(field.type)) {
      errors.push(`Field "${field.key || i}" has invalid type. Must be one of: ${validTypes.join(', ')}`)
    }

    // Validate label
    if (typeof field.label !== 'string' || !field.label.trim()) {
      errors.push(`Field "${field.key || i}" must have a non-empty label`)
    }

    // Validate select fields have at least 2 options
    if (field.type === 'select' || field.type === 'multi-select') {
      if (!Array.isArray(field.options) || field.options.length < 2) {
        errors.push(`Field "${field.key || i}" of type "${field.type}" must have at least 2 options`)
      } else {
        for (let j = 0; j < field.options.length; j++) {
          const opt = field.options[j] as Record<string, unknown>
          if (typeof opt.value !== 'string' || !opt.value) {
            errors.push(`Option ${j} in field "${field.key}" must have a non-empty value`)
          }
          if (typeof opt.label !== 'string' || !opt.label) {
            errors.push(`Option ${j} in field "${field.key}" must have a non-empty label`)
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Extracts all {{variable}} references from template and checks each has a matching field key.
 * Returns { valid, missingVars }
 */
export function validateTemplateVars(
  template: string,
  fields: ToolField[]
): ValidateTemplateResult {
  const varMatches = template.match(/\{\{(\w+)\}\}/g) ?? []
  const templateVars = Array.from(new Set(varMatches.map(v => v.slice(2, -2))))
  const fieldKeys = new Set(fields.map(f => f.key))

  const missingVars = templateVars.filter(v => !fieldKeys.has(v))

  return {
    valid: missingVars.length === 0,
    missingVars,
  }
}

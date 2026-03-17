import { z } from 'zod'
import { validateTemplateVars } from './prompt-engine'

export const ToolFieldSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    key: z.string().regex(/^\w+$/, 'Key must contain only letters, numbers, and underscores'),
    label: z.string().min(1, 'Label is required'),
    required: z.boolean(),
    placeholder: z.string().optional(),
  }),
  z.object({
    type: z.literal('textarea'),
    key: z.string().regex(/^\w+$/, 'Key must contain only letters, numbers, and underscores'),
    label: z.string().min(1, 'Label is required'),
    required: z.boolean(),
    placeholder: z.string().optional(),
  }),
  z.object({
    type: z.literal('number'),
    key: z.string().regex(/^\w+$/, 'Key must contain only letters, numbers, and underscores'),
    label: z.string().min(1, 'Label is required'),
    required: z.boolean(),
    placeholder: z.string().optional(),
  }),
  z.object({
    type: z.literal('select'),
    key: z.string().regex(/^\w+$/, 'Key must contain only letters, numbers, and underscores'),
    label: z.string().min(1, 'Label is required'),
    required: z.boolean(),
    options: z
      .array(z.object({ value: z.string().min(1), label: z.string().min(1) }))
      .min(2, 'Select fields must have at least 2 options'),
  }),
  z.object({
    type: z.literal('multi-select'),
    key: z.string().regex(/^\w+$/, 'Key must contain only letters, numbers, and underscores'),
    label: z.string().min(1, 'Label is required'),
    required: z.boolean(),
    options: z
      .array(z.object({ value: z.string().min(1), label: z.string().min(1) }))
      .min(2, 'Multi-select fields must have at least 2 options'),
  }),
])

export const ToolSpecSchema = z
  .object({
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only')
      .min(3, 'Slug must be at least 3 characters')
      .max(80, 'Slug must be at most 80 characters'),
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(120, 'Name must be at most 120 characters'),
    shortDesc: z
      .string()
      .min(10, 'Short description must be at least 10 characters')
      .max(200, 'Short description must be at most 200 characters'),
    professionSlug: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'Profession slug must be lowercase letters, numbers, and hyphens'),
    taskSlug: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'Task slug must be lowercase letters, numbers, and hyphens')
      .optional(),
    blueprint: z
      .enum(['text-generator', 'email-composer', 'list-generator'])
      .optional(),
    fields: z
      .array(ToolFieldSchema)
      .min(1, 'At least one field is required')
      .max(10, 'Maximum 10 fields allowed'),
    promptTemplate: z
      .string()
      .min(20, 'Prompt template must be at least 20 characters'),
    guideIntro: z.string().optional(),
    seoToolTitle: z.string().max(70, 'SEO title must be at most 70 characters').optional(),
    seoToolDesc: z.string().max(160, 'SEO description must be at most 160 characters').optional(),
    seoGuideTitle: z.string().max(70, 'SEO guide title must be at most 70 characters').optional(),
    seoGuideDesc: z.string().max(160, 'SEO guide description must be at most 160 characters').optional(),
  })
  .superRefine((data, ctx) => {
    // Cross-field validation: check template vars match fields
    const result = validateTemplateVars(data.promptTemplate, data.fields)
    if (!result.valid) {
      for (const missingVar of result.missingVars) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Template variable "{{${missingVar}}}" has no matching field`,
          path: ['promptTemplate'],
        })
      }
    }
  })

export type ValidatedToolSpec = z.infer<typeof ToolSpecSchema>

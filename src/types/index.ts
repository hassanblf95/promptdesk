export type FieldType = "text" | "textarea" | "select" | "multi-select" | "number"

export interface ToolField {
  key: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: { value: string; label: string }[]
}

export type GuideSectionType =
  | "intro"
  | "section"
  | "steps"
  | "example"
  | "callout"
  | "faq_embed"
  | "tool_cta"

export interface GuideSection {
  type: GuideSectionType
  heading?: string
  body?: string
  items?: string[]
  label?: string
  content?: string
  variant?: "tip" | "warning" | "note"
  faqIds?: string[]
}

export interface PromptEntry {
  id: string
  useCase: string
  prompt: string
  platform: "chatgpt" | "claude" | "gemini" | "any"
  tags: string[]
}

export interface FaqEntry {
  id: string
  question: string
  answer: string
}

export interface ToolSpec {
  slug: string
  name: string
  shortDesc: string
  professionSlug: string
  taskSlug?: string
  blueprint?: string
  fields: ToolField[]
  promptTemplate: string
  guideIntro?: string
  seoToolTitle?: string
  seoToolDesc?: string
  seoGuideTitle?: string
  seoGuideDesc?: string
}

export type ToolStatus = "DRAFT" | "REVIEW" | "LIVE" | "ARCHIVED"
export type TaskStatus = "DRAFT" | "LIVE" | "ARCHIVED"
export type Blueprint = "text-generator" | "email-composer" | "list-generator"

export interface ToolWithRelations {
  id: string
  slug: string
  name: string
  shortDesc: string
  status: ToolStatus
  specVersion: number
  blueprint: string
  fieldsSchema: ToolField[]
  promptTemplate: string
  promptLibrary: PromptEntry[]
  guideContent: GuideSection[]
  faq: FaqEntry[]
  aiOutputEnabled: boolean
  relatedSlugs: string[]
  seoToolTitle: string | null
  seoToolDesc: string | null
  seoPromptTitle: string | null
  seoPromptDesc: string | null
  seoGuideTitle: string | null
  seoGuideDesc: string | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  toolProfessions: {
    isPrimary: boolean
    sortOrder: number
    profession: ProfessionRecord
  }[]
  taskTools?: {
    isPrimary: boolean
    task: TaskRecord
  }[]
}

export interface ProfessionRecord {
  id: string
  slug: string
  name: string
  description: string
  iconKey: string
  sortOrder: number
  isActive: boolean
  seoTitle: string | null
  seoDesc: string | null
  createdAt: Date
  updatedAt: Date
}

export interface TaskRecord {
  id: string
  slug: string
  name: string
  description: string
  status: TaskStatus
  seoTitle: string | null
  seoDesc: string | null
  createdAt: Date
  updatedAt: Date
}

export interface RenderPromptResult {
  prompt: string
  errors: string[]
}

export interface ValidateFieldsResult {
  valid: boolean
  errors: string[]
}

export interface ValidateTemplateResult {
  valid: boolean
  missingVars: string[]
}

export interface ImportResult {
  imported: number
  skipped: number
  errors: { slug: string; error: string }[]
}

import Link from 'next/link'
import { Zap } from 'lucide-react'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#0F1F3D]">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1A56A0]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          PromptDesk
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/prompts" className="text-gray-600 hover:text-[#1A56A0] transition-colors">
            Prompt Library
          </Link>
          <Link href="/blog" className="text-gray-600 hover:text-[#1A56A0] transition-colors">
            Guides
          </Link>
          <Link href="/tasks" className="text-gray-600 hover:text-[#1A56A0] transition-colors">
            Tasks
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/hr"
            className="hidden md:inline-flex items-center justify-center rounded-md bg-[#1A56A0] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F1F3D] transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </header>
  )
}

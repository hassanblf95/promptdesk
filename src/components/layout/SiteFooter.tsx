import Link from 'next/link'
import { Zap } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t bg-[#0F1F3D] text-white mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1A56A0]">
                <Zap className="h-4 w-4 text-white" />
              </div>
              PromptDesk
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              AI tools for professionals. Generate better outputs, faster.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-gray-200">Professions</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/hr" className="hover:text-white transition-colors">HR Professionals</Link></li>
              <li><Link href="/teachers" className="hover:text-white transition-colors">Teachers</Link></li>
              <li><Link href="/marketers" className="hover:text-white transition-colors">Marketers</Link></li>
              <li><Link href="/sales" className="hover:text-white transition-colors">Sales</Link></li>
              <li><Link href="/recruiters" className="hover:text-white transition-colors">Recruiters</Link></li>
              <li><Link href="/freelancers" className="hover:text-white transition-colors">Freelancers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-gray-200">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/prompts" className="hover:text-white transition-colors">Prompt Library</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Guides</Link></li>
              <li><Link href="/tasks" className="hover:text-white transition-colors">Tasks</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-gray-200">Platform</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Panel</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} PromptDesk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

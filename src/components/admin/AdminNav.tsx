'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wrench, Upload, Users, ListChecks, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/tools', label: 'Tools', icon: Wrench },
  { href: '/admin/import', label: 'Import Specs', icon: Upload },
  { href: '/admin/professions', label: 'Professions', icon: Users },
  { href: '/admin/tasks', label: 'Tasks', icon: ListChecks },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-[#0F1F3D] text-white flex flex-col">
      <div className="p-4 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1A56A0]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          PromptDesk
          <span className="text-xs font-normal text-gray-400 ml-1">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  )
}

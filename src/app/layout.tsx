import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'PromptDesk — AI Tools for Professionals',
    template: '%s | PromptDesk',
  },
  description:
    'Free AI-powered tools for HR teams, teachers, marketers, sales professionals, and more. Generate prompts, guides, and outputs instantly.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://promptdesk.io'),
  openGraph: {
    type: 'website',
    siteName: 'PromptDesk',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className="font-sans antialiased">
          {children}
          <Toaster />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}

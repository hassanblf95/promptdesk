'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-4xl font-bold text-[#0F1F3D] mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-8">
          We ran into an unexpected error. Please try again or go back to the homepage.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="rounded-md bg-[#1A56A0] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0F1F3D] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}

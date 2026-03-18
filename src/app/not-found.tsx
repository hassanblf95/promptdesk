import Link from 'next/link'
import { SiteLayout } from '@/components/layout/SiteLayout'

export default function NotFound() {
  return (
    <SiteLayout>
      <div className="container flex min-h-[60vh] items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-6xl font-bold text-[#1A56A0] mb-4">404</p>
          <h1 className="text-2xl font-bold text-[#0F1F3D] mb-3">Page not found</h1>
          <p className="text-gray-600 mb-8">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/"
            className="rounded-md bg-[#1A56A0] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0F1F3D] transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </SiteLayout>
  )
}

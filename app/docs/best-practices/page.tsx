/**
 * Best Practices Page
 */

import Link from 'next/link'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { TrendingUp, ChevronRight, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'SEO Best Practices | SEO Analyzer Pro Documentation',
  description: 'Learn industry best practices for SEO optimization and improving search engine rankings.',
}

export default function BestPracticesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/docs" className="hover:text-primary-600">Documentation</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Best Practices</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">SEO Best Practices</h1>
        <p className="text-xl text-gray-600 mb-12">
          Industry-standard best practices for optimizing your website for search engines
        </p>

        {/* On-Page SEO */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">On-Page SEO Best Practices</h2>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Title Tags</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Keep between 50-60 characters</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Include primary keyword near the beginning</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Make each page's title unique</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Content Quality</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Aim for 1,500+ words for comprehensive pages</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Use natural keyword placement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Structure content with clear headings</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div className="bg-primary-50 rounded-xl p-8">
          <TrendingUp className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Start Optimizing Today</h2>
          <p className="text-gray-600 mb-6 text-center">
            Use SEO Analyzer Pro to implement these best practices
          </p>
          <div className="flex justify-center">
            <Link
              href="/signup"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

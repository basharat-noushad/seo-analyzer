/**
 * User Guide
 */

import Link from 'next/link'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { BookOpen, Search, AlertCircle, TrendingUp, Users, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'User Guide | SEO Analyzer Pro Documentation',
  description: 'Step-by-step tutorials and guides for using SEO Analyzer Pro effectively.',
}

export default function UserGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/docs" className="hover:text-primary-600">Documentation</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">User Guide</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">User Guide</h1>
        <p className="text-xl text-gray-600 mb-12">
          Detailed tutorials and step-by-step guides for common SEO tasks
        </p>

        {/* Tutorials */}
        <section id="analyze-page" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Analyze a Webpage</h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Navigate to Page Analyzer</h3>
              <p className="text-gray-700 mb-3">From your dashboard, click on "Tools" → "Page Analyzer" or use the quick action button on the homepage.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Enter the URL</h3>
              <p className="text-gray-700 mb-3">Paste the complete URL of the page you want to analyze. Make sure to include https:// or http://</p>
              <div className="bg-white border border-gray-200 rounded p-3 font-mono text-sm mt-3">
                https://example.com/page-to-analyze
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Configure Settings</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Device:</strong> Choose Mobile or Desktop analysis</li>
                <li>• <strong>Location:</strong> Select target country for localized results</li>
                <li>• <strong>Language:</strong> Specify content language if applicable</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 4: Review Results</h3>
              <p className="text-gray-700 mb-3">Analysis completes in 10-30 seconds. You'll see:</p>
              <ul className="space-y-2 text-gray-700">
                <li>• Overall SEO score (0-100)</li>
                <li>• Critical issues requiring immediate attention</li>
                <li>• Warnings for moderate priority items</li>
                <li>• Recommendations for optimization</li>
                <li>• Detailed metrics for each SEO factor</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="fix-issues" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Fix Common SEO Issues</h2>

          <div className="space-y-6">
            <div className="border-l-4 border-red-600 bg-red-50 p-6">
              <h3 className="text-xl font-semibold text-red-900 mb-3">🔴 Missing or Poor Title Tag</h3>
              <p className="text-red-800 mb-3"><strong>Issue:</strong> Title tag is too short, too long, or missing target keywords</p>
              <p className="text-red-800 mb-3"><strong>Fix:</strong></p>
              <ol className="list-decimal list-inside space-y-2 text-red-800">
                <li>Keep title between 50-60 characters</li>
                <li>Include your primary keyword near the beginning</li>
                <li>Make it compelling and relevant to page content</li>
                <li>Include your brand name at the end</li>
              </ol>
              <div className="bg-white border border-red-200 rounded p-3 mt-3 font-mono text-sm">
                &lt;title&gt;Primary Keyword - Secondary Keyword | Brand Name&lt;/title&gt;
              </div>
            </div>

            <div className="border-l-4 border-yellow-600 bg-yellow-50 p-6">
              <h3 className="text-xl font-semibold text-yellow-900 mb-3">🟡 Slow Page Speed</h3>
              <p className="text-yellow-800 mb-3"><strong>Issue:</strong> Page takes longer than 3 seconds to load</p>
              <p className="text-yellow-800 mb-3"><strong>Fix:</strong></p>
              <ul className="space-y-2 text-yellow-800">
                <li>• Compress and optimize images (use WebP format)</li>
                <li>• Enable browser caching</li>
                <li>• Minify CSS, JavaScript, and HTML</li>
                <li>• Use a Content Delivery Network (CDN)</li>
                <li>• Reduce server response time</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-600 bg-blue-50 p-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">🔵 Missing Alt Text on Images</h3>
              <p className="text-blue-800 mb-3"><strong>Issue:</strong> Images don't have descriptive alt attributes</p>
              <p className="text-blue-800 mb-3"><strong>Fix:</strong></p>
              <ul className="space-y-2 text-blue-800">
                <li>• Add descriptive alt text to all images</li>
                <li>• Include relevant keywords naturally</li>
                <li>• Keep it concise but descriptive (5-15 words)</li>
                <li>• Don't use "image of" or "picture of"</li>
              </ul>
              <div className="bg-white border border-blue-200 rounded p-3 mt-3 font-mono text-sm">
                &lt;img src="product.jpg" alt="Blue running shoes with white laces"&gt;
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">More Tutorials</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/docs/features#competitor-analysis" className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <Users className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tracking Competitors</h3>
              <p className="text-gray-600 text-sm">Learn how to monitor competitor rankings and strategies</p>
            </Link>

            <Link href="/docs/features#keyword-tracking" className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <TrendingUp className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keyword Monitoring</h3>
              <p className="text-gray-600 text-sm">Set up keyword tracking and interpret ranking changes</p>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

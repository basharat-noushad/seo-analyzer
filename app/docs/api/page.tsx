/**
 * API Documentation
 */

import Link from 'next/link'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { Code, Key, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'API Documentation | SEO Analyzer Pro',
  description: 'Complete API reference for integrating SEO Analyzer Pro into your applications.',
}

export default function APIDocPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/docs" className="hover:text-primary-600">Documentation</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">API Documentation</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">API Documentation</h1>
        <p className="text-xl text-gray-600 mb-12">
          Complete API reference for integrating SEO analysis into your applications
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mb-12">
          <p className="text-yellow-900">
            <strong>Note:</strong> API access is available on Agency plans only. <Link href="/pricing" className="underline">Upgrade to access the API</Link>
          </p>
        </div>

        {/* Authentication */}
        <section id="authentication" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Authentication</h2>
          
          <p className="text-gray-700 mb-6">
            All API requests require authentication using your API key. Include your key in the Authorization header.
          </p>

          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <pre className="text-green-400 text-sm overflow-x-auto">
{`curl -X POST https://api.seoanalyzer.pro/v1/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}
            </pre>
          </div>

          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-blue-900">
              <Key className="w-4 h-4 inline mr-2" />
              Get your API key from <Link href="/dashboard/api-keys" className="underline font-medium">Dashboard → API Keys</Link>
            </p>
          </div>
        </section>

        {/* Endpoints */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Endpoints</h2>

          <div className="space-y-8">
            {/* Analyze Page */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded">POST</span>
                <code className="text-gray-900 font-mono">/v1/analyze</code>
              </div>
              
              <p className="text-gray-700 mb-4">Analyze a webpage for SEO issues and opportunities</p>

              <h4 className="font-semibold text-gray-900 mb-2">Request Body:</h4>
              <div className="bg-gray-900 rounded p-4 mb-4">
                <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "url": "https://example.com/page",
  "device": "desktop",  // or "mobile"
  "country": "US"       // optional
}`}
                </pre>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">Response:</h4>
              <div className="bg-gray-900 rounded p-4">
                <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "score": 87,
    "url": "https://example.com/page",
    "title": "Example Page Title",
    "issues": [
      {
        "severity": "high",
        "type": "meta_description",
        "message": "Meta description is too short"
      }
    ],
    "metrics": {
      "performance": 92,
      "accessibility": 85,
      "seo": 87
    }
  }
}`}
                </pre>
              </div>
            </div>

            {/* Get Analysis */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded">GET</span>
                <code className="text-gray-900 font-mono">/v1/analysis/:id</code>
              </div>
              
              <p className="text-gray-700 mb-4">Retrieve a previously completed analysis</p>

              <h4 className="font-semibold text-gray-900 mb-2">Response:</h4>
              <div className="bg-gray-900 rounded p-4">
                <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "id": "abc123",
    "url": "https://example.com",
    "score": 87,
    "created_at": "2025-01-15T10:30:00Z",
    "status": "completed"
  }
}`}
                </pre>
              </div>
            </div>

            {/* Track Keywords */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded">POST</span>
                <code className="text-gray-900 font-mono">/v1/keywords/track</code>
              </div>
              
              <p className="text-gray-700 mb-4">Add keywords to track for a domain</p>

              <h4 className="font-semibold text-gray-900 mb-2">Request Body:</h4>
              <div className="bg-gray-900 rounded p-4">
                <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "domain": "example.com",
  "keywords": ["seo tools", "keyword tracking"],
  "location": "US"
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Rate Limits</h2>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 text-gray-900">Plan</th>
                  <th className="text-left py-2 text-gray-900">Requests per Hour</th>
                  <th className="text-left py-2 text-gray-900">Daily Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 text-gray-700">Agency</td>
                  <td className="py-2 text-gray-700">1,000</td>
                  <td className="py-2 text-gray-700">10,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SDK Libraries */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">SDK Libraries</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">JavaScript / Node.js</h3>
              <div className="bg-gray-900 rounded p-3 text-sm">
                <code className="text-green-400">npm install @seoanalyzer/sdk</code>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Python</h3>
              <div className="bg-gray-900 rounded p-3 text-sm">
                <code className="text-green-400">pip install seoanalyzer</code>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">PHP</h3>
              <div className="bg-gray-900 rounded p-3 text-sm">
                <code className="text-green-400">composer require seoanalyzer/php-sdk</code>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ruby</h3>
              <div className="bg-gray-900 rounded p-3 text-sm">
                <code className="text-green-400">gem install seoanalyzer</code>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-primary-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Use the API?</h2>
          <p className="text-gray-600 mb-6">
            Upgrade to Agency plan to get API access and start integrating
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium transition-colors"
          >
            View Agency Plan
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

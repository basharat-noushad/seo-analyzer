/**
 * Features Documentation
 */

import Link from 'next/link'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { Search, BarChart, Users, TrendingUp, Globe, Zap, FileText, Bell, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Features | SEO Analyzer Pro Documentation',
  description: 'Complete guide to all SEO analysis features, tools, and capabilities of SEO Analyzer Pro.',
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/docs" className="hover:text-primary-600">Documentation</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Features</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Features Overview</h1>
        <p className="text-xl text-gray-600 mb-12">
          Comprehensive guide to all SEO analysis features and tools available in SEO Analyzer Pro.
        </p>

        {/* Core Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Core Features</h2>

          <div className="space-y-8">
            {/* Page Analysis */}
            <div id="page-analysis" className="scroll-mt-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Search className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Page Analysis</h3>
                  <p className="text-gray-600">Comprehensive on-page SEO analysis for any webpage</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">What's Analyzed:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Title Tags:</strong> Length, keywords, uniqueness</li>
                  <li>• <strong>Meta Descriptions:</strong> Character count, keyword presence, call-to-action</li>
                  <li>• <strong>Headings (H1-H6):</strong> Structure, keyword usage, hierarchy</li>
                  <li>• <strong>Content Quality:</strong> Word count, readability score, keyword density</li>
                  <li>• <strong>Images:</strong> Alt text, file names, compression</li>
                  <li>• <strong>Links:</strong> Internal/external links, anchor text, broken links</li>
                  <li>• <strong>Performance:</strong> Page load speed, Core Web Vitals</li>
                  <li>• <strong>Mobile-Friendliness:</strong> Responsive design, touch elements</li>
                </ul>
              </div>
            </div>

            {/* Competitor Analysis */}
            <div id="competitor-analysis" className="scroll-mt-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Competitor Analysis</h3>
                  <p className="text-gray-600">Compare your SEO performance against competitors</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Side-by-side comparison of up to 5 websites</li>
                  <li>• Keyword gap analysis to find opportunities</li>
                  <li>• Backlink comparison and quality assessment</li>
                  <li>• Content strategy insights</li>
                  <li>• Domain authority comparison</li>
                  <li>• Traffic estimation and trends</li>
                </ul>
              </div>
            </div>

            {/* Keyword Tracking */}
            <div id="keyword-tracking" className="scroll-mt-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Keyword Tracking</h3>
                  <p className="text-gray-600">Monitor keyword rankings and trends over time</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Capabilities:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Track unlimited keywords (Pro & Agency plans)</li>
                  <li>• Daily ranking updates</li>
                  <li>• Location-specific tracking (local SEO)</li>
                  <li>• SERP feature tracking (featured snippets, people also ask, etc.)</li>
                  <li>• Historical ranking data and trends</li>
                  <li>• Competitor keyword tracking</li>
                </ul>
              </div>
            </div>

            {/* Site Audit */}
            <div id="site-audit" className="scroll-mt-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Site Audit</h3>
                  <p className="text-gray-600">Full website crawl and technical SEO analysis</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Checks Include:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Crawlability and indexability issues</li>
                  <li>• Broken links and 404 errors</li>
                  <li>• Duplicate content detection</li>
                  <li>• XML sitemap validation</li>
                  <li>• Robots.txt analysis</li>
                  <li>• SSL certificate and HTTPS implementation</li>
                  <li>• Structured data (Schema.org) validation</li>
                  <li>• Mobile usability issues</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Advanced Features</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <Zap className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Monitoring</h3>
              <p className="text-gray-600 mb-4">Track your SEO performance 24/7 with instant alerts</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Ranking changes notifications</li>
                <li>• Technical issue alerts</li>
                <li>• Competitor movement tracking</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <FileText className="w-8 h-8 text-indigo-600 mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Reports</h3>
              <p className="text-gray-600 mb-4">Generate beautiful, branded SEO reports</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• White-label reporting (Agency)</li>
                <li>• Scheduled report delivery</li>
                <li>• Custom branding and logos</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <Bell className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Alerts</h3>
              <p className="text-gray-600 mb-4">Stay informed with customizable notifications</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Ranking drop alerts</li>
                <li>• New backlink notifications</li>
                <li>• Site health warnings</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <BarChart className="w-8 h-8 text-teal-600 mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Integration</h3>
              <p className="text-gray-600 mb-4">Connect with popular analytics platforms</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Google Analytics integration</li>
                <li>• Google Search Console sync</li>
                <li>• Custom dashboard creation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Feature Comparison by Plan</h2>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Feature</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b">Free</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b">Pro</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b">Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Page Analyses</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">5/month</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">100/month</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Projects</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">1</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">10</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Keyword Tracking</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">-</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">20 keywords</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">100 keywords</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Site Audit</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">-</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">100 pages</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">5,000 pages</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Competitor Tracking</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">-</td>
                  <td className="px-4 py-3 text-sm text-center text-green-600">✓</td>
                  <td className="px-4 py-3 text-sm text-center text-green-600">✓</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">White-label Reports</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">-</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">-</td>
                  <td className="px-4 py-3 text-sm text-center text-green-600">✓</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">API Access</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">-</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">-</td>
                  <td className="px-4 py-3 text-sm text-center text-green-600">✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              View Full Pricing Details
            </Link>
          </div>
        </section>

        {/* Next Steps */}
        <div className="bg-primary-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Try These Features?</h2>
          <p className="text-gray-600 mb-6">
            Start with a free account and explore all the powerful SEO tools we offer
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/docs/guide"
              className="bg-white text-gray-900 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium transition-colors"
            >
              View User Guide
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

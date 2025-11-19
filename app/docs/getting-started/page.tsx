/**
 * Getting Started Guide
 */

import Link from 'next/link'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import {
  UserPlus,
  LogIn,
  Search,
  BarChart,
  Settings,
  CheckCircle,
  ArrowRight,
  ChevronRight
} from 'lucide-react'

export const metadata = {
  title: 'Getting Started | SEO Analyzer Pro',
  description: 'Quick start guide for SEO Analyzer Pro - create your account and run your first SEO analysis in minutes.',
}

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/docs" className="hover:text-primary-600">Documentation</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Getting Started</span>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Getting Started with SEO Analyzer Pro
          </h1>
          <p className="text-xl text-gray-600">
            Learn how to set up your account and run your first SEO analysis in just a few minutes.
          </p>
        </div>

        {/* Quick Overview */}
        <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">⏱️ Time Required: 5 minutes</h2>
          <p className="text-gray-700">
            This guide will walk you through creating an account, exploring the dashboard, and running your first SEO analysis.
          </p>
        </div>

        {/* Step 1 */}
        <section id="create-account" className="mb-16 scroll-mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              Start by creating your free SEO Analyzer Pro account. No credit card required to get started!
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sign Up Steps:</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-medium">Visit the signup page:</span>{' '}
                    <Link href="/signup" className="text-primary-600 hover:underline">
                      Sign Up Here
                    </Link>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span>Enter your full name, email address, and create a strong password</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span>Click "Create Account" to complete registration</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span>You'll be automatically logged in and redirected to your dashboard</span>
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>💡 Tip:</strong> Use a password that's at least 8 characters long and includes numbers and special characters for better security.
              </p>
            </div>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Create Free Account
            </Link>
          </div>
        </section>

        {/* Step 2 */}
        <section id="explore-dashboard" className="mb-16 scroll-mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Explore Your Dashboard</h2>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              Once logged in, you'll see your personalized dashboard with all your SEO tools and analytics.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <BarChart className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
                <p className="text-gray-600 text-sm">
                  View your total analyses, tracked keywords, and overall SEO score at a glance.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <Search className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Enter any URL to instantly analyze its SEO performance and get actionable recommendations.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <Settings className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Projects</h3>
                <p className="text-gray-600 text-sm">
                  Organize your websites into projects for better tracking and comparison over time.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <BarChart className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports</h3>
                <p className="text-gray-600 text-sm">
                  Access detailed reports on page performance, keywords, and competitor analysis.
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4">
              <p className="text-sm text-yellow-900">
                <strong>📊 Free Tier Limits:</strong> Free accounts get 5 analyses per month. Upgrade to Pro for unlimited analyses and advanced features.
              </p>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section id="first-analysis" className="mb-16 scroll-mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Run Your First Analysis</h2>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              Let's analyze a webpage to see what SEO improvements it needs!
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Analysis Steps:</h3>
              <ol className="space-y-4">
                <li>
                  <strong className="text-gray-900">1. Go to the Page Analyzer</strong>
                  <p className="text-gray-600 mt-1">
                    From your dashboard, click "Analyze New Page" or navigate to Tools → Page Analyzer
                  </p>
                </li>
                <li>
                  <strong className="text-gray-900">2. Enter the URL</strong>
                  <p className="text-gray-600 mt-1">
                    Type or paste the complete URL of the page you want to analyze (e.g., https://example.com/page)
                  </p>
                </li>
                <li>
                  <strong className="text-gray-900">3. Configure Options (Optional)</strong>
                  <p className="text-gray-600 mt-1">
                    Choose whether to analyze mobile or desktop version, and select your target country
                  </p>
                </li>
                <li>
                  <strong className="text-gray-900">4. Click "Analyze"</strong>
                  <p className="text-gray-600 mt-1">
                    The analysis typically takes 10-30 seconds depending on the page size
                  </p>
                </li>
                <li>
                  <strong className="text-gray-900">5. Review Results</strong>
                  <p className="text-gray-600 mt-1">
                    You'll see a comprehensive report with scores, issues, and recommendations
                  </p>
                </li>
              </ol>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll See in Results:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Overall SEO Score</strong> - A grade from 0-100 indicating overall health</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Meta Tags Analysis</strong> - Title, description, and other meta tags evaluation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Content Quality</strong> - Word count, readability, keyword usage</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Technical SEO</strong> - Page speed, mobile-friendliness, structured data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Issues & Warnings</strong> - Prioritized list of problems to fix</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Recommendations</strong> - Specific actions to improve your SEO</span>
                </li>
              </ul>
            </div>

            <Link
              href="/competitor-analyzer"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              <Search className="w-5 h-5" />
              Try Free Analyzer
            </Link>
          </div>
        </section>

        {/* Step 4 */}
        <section id="understand-results" className="mb-16 scroll-mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Understanding Your Results</h2>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              Learn how to interpret your SEO analysis results and prioritize improvements.
            </p>

            <div className="space-y-6 mb-6">
              <div className="border-l-4 border-green-600 bg-green-50 p-4">
                <h3 className="font-semibold text-green-900 mb-2">🟢 Score 90-100: Excellent</h3>
                <p className="text-green-800 text-sm">
                  Your page is well-optimized. Focus on maintaining quality and keeping content fresh.
                </p>
              </div>

              <div className="border-l-4 border-blue-600 bg-blue-50 p-4">
                <h3 className="font-semibold text-blue-900 mb-2">🔵 Score 70-89: Good</h3>
                <p className="text-blue-800 text-sm">
                  Solid foundation with room for improvement. Address warning-level issues first.
                </p>
              </div>

              <div className="border-l-4 border-yellow-600 bg-yellow-50 p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">🟡 Score 50-69: Needs Work</h3>
                <p className="text-yellow-800 text-sm">
                  Several issues need attention. Start with high-priority items like meta tags and page speed.
                </p>
              </div>

              <div className="border-l-4 border-red-600 bg-red-50 p-4">
                <h3 className="font-semibold text-red-900 mb-2">🔴 Score 0-49: Critical</h3>
                <p className="text-red-800 text-sm">
                  Significant SEO problems detected. Follow the recommendations step-by-step to improve.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Priority Levels:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">HIGH</span>
                  <span className="text-gray-700">Fix immediately - these directly impact rankings</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">MEDIUM</span>
                  <span className="text-gray-700">Address soon - moderate impact on SEO performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">LOW</span>
                  <span className="text-gray-700">Nice to have - minor improvements for optimization</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Next Steps</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/docs/guide"
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                User Guide
              </h3>
              <p className="text-gray-600 mb-4">
                Detailed tutorials on using all features of SEO Analyzer Pro
              </p>
              <span className="text-primary-600 font-medium flex items-center gap-2">
                Read guide <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/docs/features"
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                Features Overview
              </h3>
              <p className="text-gray-600 mb-4">
                Explore all the powerful SEO analysis tools available
              </p>
              <span className="text-primary-600 font-medium flex items-center gap-2">
                Explore features <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/docs/faq"
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                FAQ
              </h3>
              <p className="text-gray-600 mb-4">
                Common questions and answers about the platform
              </p>
              <span className="text-primary-600 font-medium flex items-center gap-2">
                Browse FAQ <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/pricing"
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                Upgrade Plans
              </h3>
              <p className="text-gray-600 mb-4">
                Unlock unlimited analyses and advanced features
              </p>
              <span className="text-primary-600 font-medium flex items-center gap-2">
                View pricing <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </section>

        {/* Help */}
        <div className="bg-primary-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you succeed with SEO Analyzer Pro
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

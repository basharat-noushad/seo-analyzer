/**
 * FAQ Page
 */

import Link from 'next/link'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { HelpCircle, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'FAQ | SEO Analyzer Pro Documentation',
  description: 'Frequently asked questions about SEO Analyzer Pro features, pricing, and usage.',
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/docs" className="hover:text-primary-600">Documentation</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">FAQ</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-600 mb-12">
          Find answers to common questions about SEO Analyzer Pro
        </p>

        {/* General Questions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">General Questions</h2>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">What is SEO Analyzer Pro?</h3>
              <p className="text-gray-700">
                SEO Analyzer Pro is a comprehensive SEO analysis platform that helps you improve your website's search engine rankings. We provide on-page analysis, competitor tracking, keyword monitoring, site audits, and more.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Do I need technical knowledge to use it?</h3>
              <p className="text-gray-700">
                No! Our platform is designed to be user-friendly for everyone, from beginners to SEO experts. We provide clear explanations and actionable recommendations that anyone can understand and implement.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How accurate are the SEO scores?</h3>
              <p className="text-gray-700">
                Our scoring system is based on industry best practices and Google's published guidelines. While no tool can guarantee rankings, our scores provide a reliable indicator of your page's SEO health and areas for improvement.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing & Plans */}
        <section id="pricing" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Pricing & Plans</h2>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Is there a free plan?</h3>
              <p className="text-gray-700">
                Yes! Our free plan includes 5 page analyses per month and access to basic features. It's perfect for individuals and small websites getting started with SEO.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-700">
                Yes, you can change your plan at any time from your dashboard. Upgrades take effect immediately, and downgrades take effect at the end of your current billing period.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-700">
                We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Do you offer refunds?</h3>
              <p className="text-gray-700">
                Yes, we offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact our support team for a full refund.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Features & Usage</h2>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How long does an analysis take?</h3>
              <p className="text-gray-700">
                Most page analyses complete in 10-30 seconds. Full site audits can take longer depending on the number of pages being crawled (typically 5-15 minutes for 100 pages).
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I analyze competitor websites?</h3>
              <p className="text-gray-700">
                Yes! You can analyze any publicly accessible website. Pro and Agency plans include dedicated competitor tracking features for monitoring multiple competitors over time.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Do you offer white-label reports?</h3>
              <p className="text-gray-700">
                White-label reporting is available on Agency plans. You can add your own logo, branding, and custom domain to all reports.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How often are keyword rankings updated?</h3>
              <p className="text-gray-700">
                Keyword rankings are updated daily for Pro and Agency plans. You'll receive email alerts when significant ranking changes occur.
              </p>
            </div>
          </div>
        </section>

        {/* Technical */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Technical Questions</h2>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Is my data secure?</h3>
              <p className="text-gray-700">
                Yes. We use industry-standard encryption (SSL/TLS) for all data transmission. Your data is stored securely and never shared with third parties. See our <Link href="/privacy" className="text-primary-600 underline">Privacy Policy</Link> for details.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Do you have an API?</h3>
              <p className="text-gray-700">
                Yes, API access is available on Agency plans. Our RESTful API lets you integrate SEO analysis directly into your applications. See our <Link href="/docs/api" className="text-primary-600 underline">API Documentation</Link>.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I export my data?</h3>
              <p className="text-gray-700">
                Yes, you can export all your analysis data as CSV, PDF, or JSON files. Pro and Agency users can also schedule automated report delivery via email.
              </p>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Support</h2>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How can I get help?</h3>
              <p className="text-gray-700 mb-3">
                We offer multiple support channels:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Documentation:</strong> Comprehensive guides and tutorials</li>
                <li>• <strong>Email Support:</strong> Available to all users</li>
                <li>• <strong>Priority Support:</strong> Phone and chat for Agency plans</li>
                <li>• <strong>Community Forum:</strong> Connect with other users</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">What are your support hours?</h3>
              <p className="text-gray-700">
                Email support is available 24/7 with responses within 24 hours. Priority support for Agency plans includes phone and chat Monday-Friday, 9 AM - 5 PM EST.
              </p>
            </div>
          </div>
        </section>

        <div className="bg-primary-50 rounded-xl p-8 text-center">
          <HelpCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Still Have Questions?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help
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

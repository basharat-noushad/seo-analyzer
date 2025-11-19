/**
 * Documentation Landing Page
 */

import Link from 'next/link'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import {
  BookOpen,
  Rocket,
  Settings,
  Code,
  HelpCircle,
  Users,
  Zap,
  Shield,
  TrendingUp,
  FileText
} from 'lucide-react'

export const metadata = {
  title: 'Documentation | SEO Analyzer Pro',
  description: 'Complete guide to using SEO Analyzer Pro - tutorials, API docs, and best practices for improving your website SEO.',
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about using SEO Analyzer Pro to improve your website's search engine rankings
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-8 mb-16">
          <div className="flex items-start gap-4">
            <Rocket className="w-12 h-12 text-primary-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                New to SEO Analyzer Pro?
              </h2>
              <p className="text-gray-700 mb-4">
                Start here to learn the basics and get your first SEO analysis running in minutes.
              </p>
              <Link
                href="/docs/getting-started"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium transition-colors"
              >
                <Rocket className="w-5 h-5" />
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Main Documentation Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Getting Started */}
          <Link
            href="/docs/getting-started"
            className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
              <Rocket className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Getting Started</h3>
            <p className="text-gray-600 mb-4">
              Quick start guide, account setup, and your first SEO analysis
            </p>
            <span className="text-primary-600 font-medium group-hover:underline">
              Read guide →
            </span>
          </Link>

          {/* Features */}
          <Link
            href="/docs/features"
            className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Features Overview</h3>
            <p className="text-gray-600 mb-4">
              Comprehensive guide to all SEO analysis features and tools
            </p>
            <span className="text-primary-600 font-medium group-hover:underline">
              Explore features →
            </span>
          </Link>

          {/* User Guide */}
          <Link
            href="/docs/guide"
            className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">User Guide</h3>
            <p className="text-gray-600 mb-4">
              Detailed tutorials and step-by-step guides for common tasks
            </p>
            <span className="text-primary-600 font-medium group-hover:underline">
              View tutorials →
            </span>
          </Link>

          {/* API Documentation */}
          <Link
            href="/docs/api"
            className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <Code className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">API Documentation</h3>
            <p className="text-gray-600 mb-4">
              Complete API reference for integrating SEO tools into your apps
            </p>
            <span className="text-primary-600 font-medium group-hover:underline">
              View API docs →
            </span>
          </Link>

          {/* FAQ */}
          <Link
            href="/docs/faq"
            className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
              <HelpCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">FAQ</h3>
            <p className="text-gray-600 mb-4">
              Answers to frequently asked questions about SEO and our platform
            </p>
            <span className="text-primary-600 font-medium group-hover:underline">
              Browse FAQ →
            </span>
          </Link>

          {/* Best Practices */}
          <Link
            href="/docs/best-practices"
            className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Best Practices</h3>
            <p className="text-gray-600 mb-4">
              SEO optimization strategies and industry best practices
            </p>
            <span className="text-primary-600 font-medium group-hover:underline">
              Learn more →
            </span>
          </Link>
        </div>

        {/* Popular Topics */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Topics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/docs/getting-started#create-account" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-1">Creating Your Account</h3>
              <p className="text-sm text-gray-600">Set up your SEO Analyzer Pro account in under 2 minutes</p>
            </Link>
            <Link href="/docs/guide#analyze-page" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-1">Running Your First Analysis</h3>
              <p className="text-sm text-gray-600">Learn how to analyze any webpage for SEO issues</p>
            </Link>
            <Link href="/docs/features#competitor-analysis" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-1">Competitor Analysis</h3>
              <p className="text-sm text-gray-600">Track and analyze your competitors' SEO strategies</p>
            </Link>
            <Link href="/docs/guide#fix-issues" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-1">Fixing Common SEO Issues</h3>
              <p className="text-sm text-gray-600">Step-by-step guide to resolving common problems</p>
            </Link>
            <Link href="/docs/api#authentication" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-1">API Authentication</h3>
              <p className="text-sm text-gray-600">Securely authenticate your API requests</p>
            </Link>
            <Link href="/docs/faq#pricing" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-1">Pricing & Plans</h3>
              <p className="text-sm text-gray-600">Understanding our pricing tiers and features</p>
            </Link>
          </div>
        </div>

        {/* Need Help */}
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Need More Help?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you get the most out of SEO Analyzer Pro.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/docs/faq"
              className="bg-white text-gray-900 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium transition-colors"
            >
              Browse FAQ
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

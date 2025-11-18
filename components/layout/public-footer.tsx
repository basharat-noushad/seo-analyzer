/**
 * Public Footer Component
 *
 * Comprehensive footer with links, features, and legal info
 */

import Link from 'next/link'

export function PublicFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-bold">SEO Analyzer Pro</h3>
            <p className="text-sm text-gray-400">
              Comprehensive SEO analysis and monitoring platform for modern websites.
              Track, analyze, and improve your search engine rankings.
            </p>
          </div>

          {/* Tools */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">SEO Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/competitor-analyzer" className="hover:text-white transition-colors">
                  Competitor Analyzer
                </Link>
              </li>
              <li>
                <Link href="/tools/page-analyzer" className="hover:text-white transition-colors">
                  Page Analyzer
                </Link>
              </li>
              <li>
                <Link href="/tools/site-audit" className="hover:text-white transition-colors">
                  Site Audit
                </Link>
              </li>
              <li>
                <Link href="/tools/keyword-research" className="hover:text-white transition-colors">
                  Keyword Research
                </Link>
              </li>
              <li>
                <Link href="/tools/rank-tracker" className="hover:text-white transition-colors">
                  Rank Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/projects" className="hover:text-white transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/dashboard/monitoring" className="hover:text-white transition-colors">
                  Monitoring
                </Link>
              </li>
              <li>
                <Link href="/dashboard/reports" className="hover:text-white transition-colors">
                  Reports
                </Link>
              </li>
              <li>
                <Link href="/dashboard/api-keys" className="hover:text-white transition-colors">
                  API Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} SEO Analyzer Pro. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

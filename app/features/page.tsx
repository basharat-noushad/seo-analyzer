'use client'

/**
 * Features Page
 *
 * Detailed overview of all platform features
 */

import Link from 'next/link'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Search,
  TrendingUp,
  FileSearch,
  Zap,
  Shield,
  Check,
  ArrowRight,
  Globe,
  Bell,
  Users,
  Code,
  BarChart,
  Rocket,
  Target,
  Link as LinkIcon,
  Gauge,
  Lock
} from 'lucide-react'

const features = [
  {
    category: "Analysis & Insights",
    items: [
      {
        icon: BarChart3,
        title: "Competitor Analysis",
        description: "Compare your pages against competitors side-by-side. Identify gaps in your SEO strategy and discover what's working for your competition."
      },
      {
        icon: FileSearch,
        title: "Site Audits",
        description: "Comprehensive website crawls to find technical SEO issues, broken links, duplicate content, and optimization opportunities across your entire site."
      },
      {
        icon: Search,
        title: "Page Analyzer",
        description: "Deep dive into individual page SEO metrics including meta tags, headings, content quality, mobile-friendliness, and Core Web Vitals."
      },
      {
        icon: TrendingUp,
        title: "Rank Tracking",
        description: "Monitor your keyword rankings across search engines. Track changes over time and get alerts when your positions improve or decline."
      }
    ]
  },
  {
    category: "Keywords & Content",
    items: [
      {
        icon: Target,
        title: "Keyword Research",
        description: "Discover high-value keywords with search volume data, competition analysis, and content opportunities to target in your SEO strategy."
      },
      {
        icon: Globe,
        title: "Content Optimization",
        description: "Get AI-powered suggestions to improve your content for target keywords. Optimize readability, keyword density, and semantic relevance."
      },
      {
        icon: Zap,
        title: "SERP Analysis",
        description: "Analyze search engine results pages to understand ranking factors, identify featured snippet opportunities, and improve your content strategy."
      }
    ]
  },
  {
    category: "Technical SEO",
    items: [
      {
        icon: Gauge,
        title: "Performance Monitoring",
        description: "Track Core Web Vitals including LCP, FID, and CLS. Monitor page speed and identify performance bottlenecks affecting your rankings."
      },
      {
        icon: LinkIcon,
        title: "Backlink Analysis",
        description: "Monitor your backlink profile, identify toxic links, and discover link building opportunities to improve your domain authority."
      },
      {
        icon: Shield,
        title: "Security Audits",
        description: "Check for HTTPS implementation, mixed content issues, and security best practices that affect trust and search rankings."
      }
    ]
  },
  {
    category: "Automation & Collaboration",
    items: [
      {
        icon: Bell,
        title: "Alerts & Monitoring",
        description: "Set up automated alerts for critical issues, ranking changes, or competitors' activities. Stay informed with real-time notifications."
      },
      {
        icon: BarChart,
        title: "Custom Reports",
        description: "Generate white-label PDF reports with your branding. Schedule automated reports for clients or stakeholders."
      },
      {
        icon: Users,
        title: "Team Collaboration",
        description: "Invite team members, assign roles, and collaborate on SEO projects. Perfect for agencies managing multiple clients."
      },
      {
        icon: Code,
        title: "API Access",
        description: "Integrate SEO data into your own tools and workflows with our comprehensive REST API. Full documentation included."
      }
    ]
  },
  {
    category: "Enterprise Features",
    items: [
      {
        icon: Rocket,
        title: "Priority Support",
        description: "Get dedicated support from our SEO experts. Fast response times and personalized assistance for complex issues."
      },
      {
        icon: Lock,
        title: "Data Security",
        description: "Enterprise-grade security with encryption at rest and in transit. GDPR compliant with data residency options."
      }
    ]
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 to-white py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <span className="text-primary-600"> SEO Success</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to analyze, optimize, and monitor your website's search engine performance.
              From competitor analysis to automated reporting, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      {features.map((section, idx) => (
        <section key={idx} className={`py-16 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {section.category}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {section.items.map((feature, featureIdx) => {
                const Icon = feature.icon
                return (
                  <div
                    key={featureIdx}
                    className="p-6 border border-gray-200 rounded-lg bg-white hover:shadow-lg transition-shadow"
                  >
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Improve Your SEO?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of businesses using SEO Analyzer to boost their search rankings.
            Start your free trial today, no credit card required.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="gap-2">
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

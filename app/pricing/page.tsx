'use client'

/**
 * Pricing Page
 *
 * Detailed pricing plans and comparison
 */

import Link from 'next/link'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  ArrowRight,
  Zap,
  HelpCircle
} from 'lucide-react'

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out our platform",
    features: [
      "5 projects",
      "10 analyses per month",
      "Basic SEO metrics",
      "Page analyzer tool",
      "Community support",
      "7-day data retention"
    ],
    limitations: [
      "No rank tracking",
      "No automated monitoring",
      "No API access",
      "No custom reports"
    ],
    cta: "Get Started Free",
    ctaLink: "/signup",
    popular: false
  },
  {
    name: "Professional",
    price: "$29",
    period: "per month",
    description: "For professionals and small businesses",
    features: [
      "Unlimited projects",
      "500 analyses per month",
      "Advanced SEO metrics",
      "Rank tracking (50 keywords)",
      "Site audit tool",
      "Priority support",
      "API access",
      "Custom reports",
      "90-day data retention",
      "Email alerts",
      "Competitor tracking (5)"
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup?plan=pro",
    popular: true
  },
  {
    name: "Agency",
    price: "$99",
    period: "per month",
    description: "For agencies and large organizations",
    features: [
      "Everything in Pro",
      "Unlimited analyses",
      "Rank tracking (500 keywords)",
      "White-label reports",
      "Team collaboration (10 users)",
      "Dedicated support",
      "Custom integrations",
      "Unlimited data retention",
      "Webhook notifications",
      "Competitor tracking (25)",
      "Priority processing",
      "Custom domain support"
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup?plan=agency",
    popular: false
  }
]

const faqs = [
  {
    question: "Can I change plans later?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the charges."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) through Stripe. Enterprise customers can also pay via invoice."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! Professional and Agency plans come with a 14-day free trial. No credit card required to start."
  },
  {
    question: "What happens when I hit my analysis limit?",
    answer: "You'll be notified when you're approaching your limit. You can upgrade your plan or wait until next month for your quota to reset."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. You can cancel your subscription at any time from your billing settings. No questions asked, no cancellation fees."
  },
  {
    question: "Do you offer custom enterprise plans?",
    answer: "Yes! For larger organizations with specific needs, we offer custom enterprise plans. Contact our sales team for more information."
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 to-white py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Simple, Transparent
              <span className="text-primary-600"> Pricing</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Choose the perfect plan for your needs. All plans include a 14-day free trial.
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative p-8 border-2 rounded-2xl ${
                  plan.popular
                    ? 'border-primary-600 shadow-2xl scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                } transition-all`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg rounded-tr-lg">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/ {plan.period}</span>
                  </div>
                </div>

                <Link href={plan.ctaLink}>
                  <Button
                    size="lg"
                    className="w-full mb-6"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                    {plan.popular && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </Link>

                <div className="space-y-3">
                  {plan.features.map((feature, featureIdx) => (
                    <div key={featureIdx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations && plan.limitations.map((limitation, limitIdx) => (
                    <div key={limitIdx} className="flex items-start gap-3 opacity-50">
                      <span className="text-gray-400 text-xs mt-1">✗</span>
                      <span className="text-gray-500 text-sm line-through">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center mt-12 text-gray-600">
            All plans include SSL encryption, daily backups, and 99.9% uptime SLA
          </p>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Compare Plans
            </h2>
            <p className="text-xl text-gray-600">
              See which features are included in each plan
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center p-4 font-semibold text-gray-900">Free</th>
                  <th className="text-center p-4 font-semibold text-gray-900">
                    <div className="flex items-center justify-center gap-2">
                      Pro
                      <Badge variant="default" className="text-xs">Popular</Badge>
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-900">Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-4 text-gray-700">Projects</td>
                  <td className="p-4 text-center text-gray-600">5</td>
                  <td className="p-4 text-center text-gray-900 font-semibold">Unlimited</td>
                  <td className="p-4 text-center text-gray-900 font-semibold">Unlimited</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 text-gray-700">Monthly Analyses</td>
                  <td className="p-4 text-center text-gray-600">10</td>
                  <td className="p-4 text-center text-gray-900 font-semibold">500</td>
                  <td className="p-4 text-center text-gray-900 font-semibold">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-700">Rank Tracking</td>
                  <td className="p-4 text-center text-gray-400">—</td>
                  <td className="p-4 text-center text-gray-900">50 keywords</td>
                  <td className="p-4 text-center text-gray-900 font-semibold">500 keywords</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 text-gray-700">API Access</td>
                  <td className="p-4 text-center text-gray-400">—</td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-700">Team Members</td>
                  <td className="p-4 text-center text-gray-600">1</td>
                  <td className="p-4 text-center text-gray-600">3</td>
                  <td className="p-4 text-center text-gray-900 font-semibold">10</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4 text-gray-700">White-Label Reports</td>
                  <td className="p-4 text-center text-gray-400">—</td>
                  <td className="p-4 text-center text-gray-400">—</td>
                  <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-700">Support</td>
                  <td className="p-4 text-center text-gray-600">Community</td>
                  <td className="p-4 text-center text-gray-900">Priority</td>
                  <td className="p-4 text-center text-gray-900 font-semibold">Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <HelpCircle className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-yellow-300" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Start Your Free Trial Today
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            No credit card required. Full access to all features for 14 days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary-600">
                Talk to Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

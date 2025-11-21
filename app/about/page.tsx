'use client'

/**
 * About Page
 *
 * Company information, mission, and team
 */

import Link from 'next/link'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { Button } from '@/components/ui/button'
import {
  Target,
  Users,
  Lightbulb,
  Award,
  TrendingUp,
  Globe,
  ArrowRight
} from 'lucide-react'

const team = [
  { name: "Sarah Johnson", role: "CEO & Founder", initials: "SJ" },
  { name: "Mike Chen", role: "CTO", initials: "MC" },
  { name: "Emma Davis", role: "Head of Product", initials: "ED" },
  { name: "David Park", role: "Lead SEO Specialist", initials: "DP" },
  { name: "Lisa Wong", role: "Head of Marketing", initials: "LW" },
  { name: "Alex Turner", role: "Customer Success", initials: "AT" }
]

const values = [
  {
    icon: Target,
    title: "Customer-First",
    description: "We build tools that solve real problems for real businesses. Every feature is designed with our customers' success in mind."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We stay ahead of SEO trends and algorithm changes, constantly innovating to provide cutting-edge tools and insights."
  },
  {
    icon: Users,
    title: "Transparency",
    description: "Clear pricing, honest recommendations, and no hidden agendas. We believe in building trust through transparency."
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We're committed to delivering the highest quality SEO analysis and tools, backed by industry-leading support."
  }
]

const stats = [
  { number: "50,000+", label: "Active Users" },
  { number: "10M+", label: "Pages Analyzed" },
  { number: "500+", label: "Enterprise Clients" },
  { number: "99.9%", label: "Uptime SLA" }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 to-white py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              We're on a Mission to
              <span className="text-primary-600"> Simplify SEO</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              SEO Analyzer was founded in 2020 with a simple goal: make professional SEO tools
              accessible to everyone, from solo entrepreneurs to enterprise teams.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Story
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              SEO Analyzer started when our founder, Sarah Johnson, was running a digital marketing agency
              and struggled to find affordable, comprehensive SEO tools. The existing solutions were either
              too expensive for small businesses or lacked the features agencies needed.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Determined to solve this problem, she assembled a team of SEO experts and engineers to build
              a platform that would democratize access to professional-grade SEO tools. What started as a
              simple page analyzer has grown into a comprehensive SEO platform trusted by over 50,000 users worldwide.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Today, we're proud to help businesses of all sizes improve their search rankings, drive organic
              traffic, and grow their online presence. But our mission remains the same: make SEO accessible,
              actionable, and effective for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => {
              const Icon = value.icon
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              The people behind SEO Analyzer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {member.initials}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-gray-600">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Globe className="h-16 w-16 text-primary-100 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            To empower businesses worldwide with the tools, insights, and knowledge they need
            to succeed in organic search. We believe everyone deserves access to professional-grade
            SEO tools, regardless of their budget or technical expertise.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <TrendingUp className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Join Thousands of Successful Businesses
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start improving your SEO today with our powerful tools and expert insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

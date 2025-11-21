'use client'

/**
 * Individual Blog Post Page
 *
 * Display full blog post content
 */

import { use } from 'react'
import Link from 'next/link'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react'

// Mock blog post data
// In production, this would be fetched from a CMS or database
const blogPosts: Record<string, any> = {
  "seo-best-practices-2025": {
    title: "SEO Best Practices for 2025: What You Need to Know",
    excerpt: "Stay ahead of the curve with the latest SEO strategies and Google algorithm updates.",
    author: "Sarah Johnson",
    date: "2025-01-15",
    readTime: "8 min read",
    category: "SEO Strategy",
    content: `
# Introduction

The SEO landscape is constantly evolving, and 2025 brings new challenges and opportunities for digital marketers. In this comprehensive guide, we'll explore the most important SEO best practices you need to implement to stay competitive.

## 1. User Experience is King

Google's algorithm updates continue to emphasize user experience. Core Web Vitals, mobile-friendliness, and page speed are now critical ranking factors. Focus on:

- Improving LCP (Largest Contentful Paint) to under 2.5 seconds
- Reducing CLS (Cumulative Layout Shift) to less than 0.1
- Optimizing FID (First Input Delay) to under 100ms

## 2. Content Quality Over Quantity

Gone are the days of keyword stuffing and thin content. Modern SEO requires:

- Comprehensive, well-researched content that answers user intent
- Proper use of semantic keywords and related topics
- Regular content updates to maintain freshness

## 3. Technical SEO Fundamentals

Don't neglect the technical aspects:

- Implement proper schema markup
- Ensure mobile-first indexing compatibility
- Fix crawl errors and broken links
- Optimize site architecture and internal linking

## 4. E-A-T Still Matters

Expertise, Authoritativeness, and Trustworthiness remain crucial:

- Author bios and credentials
- Quality backlinks from authoritative sources
- Transparent information about your organization

## Conclusion

SEO in 2025 requires a holistic approach that balances technical excellence, quality content, and outstanding user experience. By following these best practices, you'll be well-positioned to improve your search rankings and drive organic traffic to your website.
    `
  }
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const post = blogPosts[slug]

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
        <PublicFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Article Header */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link href="/blog">
            <Button variant="ghost" className="mb-8 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>

          {/* Category Badge */}
          <Badge className="mb-4">{post.category}</Badge>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {post.author.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <span className="font-medium">{post.author}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-sm font-medium text-gray-600">Share:</span>
            <Button variant="outline" size="sm" className="gap-2">
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>

          {/* Featured Image */}
          <div className="bg-gray-200 rounded-lg h-96 mb-12 flex items-center justify-center">
            <span className="text-gray-400">Article Featured Image</span>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
          </div>

          {/* Author Bio */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold">
                  {post.author.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.author}</h3>
                <p className="text-gray-600">
                  SEO specialist with over 10 years of experience helping businesses improve their search rankings.
                  Passionate about data-driven marketing and technical SEO.
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Link key={i} href="/blog/related-post">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gray-200 h-48 flex items-center justify-center">
                    <span className="text-gray-400">Related Image</span>
                  </div>
                  <div className="p-6">
                    <Badge variant="outline" className="mb-3">SEO Strategy</Badge>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Related Article Title {i}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Short excerpt of the related article goes here...
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Improve Your SEO?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Start analyzing your website with our powerful SEO tools.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

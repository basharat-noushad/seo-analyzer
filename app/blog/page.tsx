'use client'

/**
 * Blog Listing Page
 *
 * Display all blog posts with filtering and search
 */

import Link from 'next/link'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react'

// Mock blog posts
// In production, these would come from a CMS or database
const blogPosts = [
  {
    slug: "seo-best-practices-2025",
    title: "SEO Best Practices for 2025: What You Need to Know",
    excerpt: "Stay ahead of the curve with the latest SEO strategies and Google algorithm updates. Learn what's working in 2025 and how to implement these tactics.",
    author: "Sarah Johnson",
    date: "2025-01-15",
    readTime: "8 min read",
    category: "SEO Strategy",
    image: "/blog/seo-2025.jpg"
  },
  {
    slug: "technical-seo-checklist",
    title: "The Complete Technical SEO Checklist",
    excerpt: "A comprehensive guide to technical SEO. From site speed optimization to structured data, ensure your website is technically sound.",
    author: "Mike Chen",
    date: "2025-01-10",
    readTime: "12 min read",
    category: "Technical SEO",
    image: "/blog/technical-seo.jpg"
  },
  {
    slug: "keyword-research-guide",
    title: "Keyword Research in 2025: A Complete Guide",
    excerpt: "Master the art of keyword research with our comprehensive guide. Discover tools, techniques, and strategies that actually work.",
    author: "Emma Davis",
    date: "2025-01-05",
    readTime: "10 min read",
    category: "Keyword Research",
    image: "/blog/keyword-research.jpg"
  },
  {
    slug: "core-web-vitals-explained",
    title: "Core Web Vitals Explained: LCP, FID, and CLS",
    excerpt: "Understanding and optimizing Core Web Vitals is crucial for SEO success. Learn how to measure and improve these critical metrics.",
    author: "David Park",
    date: "2024-12-28",
    readTime: "7 min read",
    category: "Performance",
    image: "/blog/core-web-vitals.jpg"
  },
  {
    slug: "content-optimization-tips",
    title: "10 Content Optimization Tips That Actually Work",
    excerpt: "Create content that ranks and converts. These proven optimization techniques will help you improve your content's performance.",
    author: "Lisa Wong",
    date: "2024-12-20",
    readTime: "6 min read",
    category: "Content",
    image: "/blog/content-optimization.jpg"
  },
  {
    slug: "link-building-strategies",
    title: "Modern Link Building Strategies for 2025",
    excerpt: "Build high-quality backlinks with ethical strategies that work. Learn modern approaches to earning valuable links.",
    author: "Alex Turner",
    date: "2024-12-15",
    readTime: "9 min read",
    category: "Link Building",
    image: "/blog/link-building.jpg"
  }
]

const categories = [
  "All Posts",
  "SEO Strategy",
  "Technical SEO",
  "Keyword Research",
  "Content",
  "Link Building",
  "Performance"
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              SEO Insights & Updates
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Expert tips, strategies, and the latest news in SEO and digital marketing.
              Stay informed and improve your search rankings.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  className="pl-12 pr-4 py-6 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, idx) => (
              <Button
                key={idx}
                variant={idx === 0 ? "default" : "outline"}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {blogPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Featured Article</h2>
            </div>

            <Link href={`/blog/${blogPosts[0].slug}`}>
              <div className="grid md:grid-cols-2 gap-8 p-6 border-2 border-primary-200 rounded-2xl hover:shadow-xl transition-shadow bg-gradient-to-br from-primary-50 to-white">
                <div className="flex flex-col justify-center">
                  <Badge className="w-fit mb-3">{blogPosts[0].category}</Badge>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {blogPosts[0].title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                    <span>{blogPosts[0].author}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(blogPosts[0].date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {blogPosts[0].readTime}
                    </div>
                  </div>
                  <Button className="w-fit gap-2">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
                  <span className="text-gray-400">Featured Image</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Articles</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post, idx) => (
              <Link key={idx} href={`/blog/${post.slug}`}>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                  <div className="bg-gray-200 h-48 flex items-center justify-center">
                    <span className="text-gray-400">Article Image</span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <Badge variant="outline" className="w-fit mb-3">
                      {post.category}
                    </Badge>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-4 flex-1 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
                      <span>{post.author}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Get SEO Tips in Your Inbox
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Subscribe to our newsletter for weekly SEO insights, updates, and exclusive content.
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white"
            />
            <Button variant="secondary" className="whitespace-nowrap">
              Subscribe
            </Button>
          </div>
          <p className="mt-4 text-sm text-primary-100">
            Join 10,000+ marketers. Unsubscribe anytime.
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

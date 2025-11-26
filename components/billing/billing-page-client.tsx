"use client"

/**
 * Billing Page Client Component
 *
 * Handles Stripe checkout and subscription management
 */

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  Download,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

// Pricing tiers configuration
const PRICING_TIERS = {
  free: {
    name: "Free",
    price: "$0",
    features: [
      "1 project",
      "10 analyses per month",
      "Basic SEO metrics",
      "Community support"
    ]
  },
  pro: {
    name: "Professional",
    price: "$49",
    features: [
      "10 projects",
      "500 analyses per month",
      "Advanced SEO metrics",
      "JavaScript rendering",
      "Core Web Vitals",
      "Priority support",
      "API access"
    ]
  },
  agency: {
    name: "Agency",
    price: "$199",
    features: [
      "Unlimited projects",
      "Unlimited analyses",
      "All Pro features",
      "White-label reports",
      "Team collaboration",
      "AI recommendations",
      "Dedicated support",
      "Custom integrations"
    ]
  }
} as const

type User = {
  id: string
  email: string
  tier: 'free' | 'pro' | 'agency'
  stripeCustomerId?: string | null
  subscriptionStatus?: string | null
  subscriptionEndsAt?: Date | null
}

type Invoice = {
  id: string
  number: string | null
  amountDue: number
  amountPaid: number
  currency: string
  status: string | null
  created: Date
  pdfUrl: string | null
  hostedUrl: string | null
}

export function BillingPageClient({ user }: { user: User }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

  const currentTier = user.tier as keyof typeof PRICING_TIERS

  // Load invoices if user has a subscription
  useEffect(() => {
    if (user.stripeCustomerId) {
      loadInvoices()
    }
  }, [user.stripeCustomerId])

  // Show success/cancel messages
  useEffect(() => {
    if (searchParams.get('success')) {
      alert('✅ Subscription activated successfully! Welcome to ' + (user.tier === 'pro' ? 'Pro' : 'Agency') + '!')
      router.replace('/dashboard/billing')
    } else if (searchParams.get('canceled')) {
      alert('❌ Checkout canceled. You can upgrade anytime.')
      router.replace('/dashboard/billing')
    }
  }, [searchParams])

  async function loadInvoices() {
    setLoadingInvoices(true)
    try {
      const res = await fetch('/api/stripe/invoices')
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.invoices.map((inv: any) => ({
          ...inv,
          created: new Date(inv.created),
          dueDate: inv.dueDate ? new Date(inv.dueDate) : null,
        })))
      }
    } catch (error) {
      console.error('Error loading invoices:', error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  async function handleUpgrade(plan: 'pro' | 'agency') {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to create checkout session')
        return
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleManageSubscription() {
    setLoading('portal')
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to open customer portal')
        return
      }

      // Redirect to Stripe customer portal
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error opening portal:', error)
      alert('Failed to open customer portal. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleCancelSubscription() {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return
    }

    setLoading('cancel')
    try {
      const res = await fetch('/api/stripe/cancel', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to cancel subscription')
        return
      }

      alert(data.message)
      window.location.reload()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Failed to cancel subscription. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleReactivate() {
    setLoading('reactivate')
    try {
      const res = await fetch('/api/stripe/reactivate', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to reactivate subscription')
        return
      }

      alert(data.message)
      window.location.reload()
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      alert('Failed to reactivate subscription. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-1">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Your active subscription details
              </CardDescription>
            </div>
            <Badge
              variant={currentTier === "agency" ? "default" : currentTier === "pro" ? "secondary" : "outline"}
              className="text-lg px-4 py-2"
            >
              {PRICING_TIERS[currentTier].name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <CreditCard className="h-4 w-4" />
                <span>Monthly Price</span>
              </div>
              <p className="text-3xl font-bold">{PRICING_TIERS[currentTier].price}</p>
              {currentTier !== "free" && <p className="text-sm text-gray-600 mt-1">per month</p>}
            </div>

            {user.subscriptionStatus && (
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  {user.subscriptionStatus === "active" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold capitalize">
                    {user.subscriptionStatus}
                  </p>
                  <Badge
                    variant={user.subscriptionStatus === "active" ? "default" : "destructive"}
                  >
                    {user.subscriptionStatus === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            )}

            {user.subscriptionEndsAt && (
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>{user.subscriptionStatus === "active" ? "Renews On" : "Expires On"}</span>
                </div>
                <p className="text-lg font-semibold">
                  {new Date(user.subscriptionEndsAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Current Plan Features */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-3">Plan Features</h4>
            <ul className="grid gap-2 md:grid-cols-2">
              {PRICING_TIERS[currentTier].features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3 flex-wrap">
            {currentTier === "free" && (
              <a href="#upgrade">
                <Button className="gap-2">
                  <ArrowUpCircle className="h-4 w-4" />
                  Upgrade Plan
                </Button>
              </a>
            )}
            {currentTier !== "free" && user.subscriptionStatus === "active" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={loading === 'portal'}
                >
                  {loading === 'portal' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  Manage Subscription
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={handleCancelSubscription}
                  disabled={loading === 'cancel'}
                >
                  {loading === 'cancel' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Cancel Subscription
                </Button>
              </>
            )}
            {currentTier !== "free" && user.subscriptionStatus !== "active" && (
              <Button onClick={handleReactivate} disabled={loading === 'reactivate'}>
                {loading === 'reactivate' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Reactivate Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Plans Section */}
      {currentTier === "free" && (
        <div id="upgrade">
          <h2 className="text-2xl font-bold mb-4">Upgrade Your Plan</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Pro Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">{PRICING_TIERS.pro.name}</CardTitle>
                <CardDescription>
                  Perfect for professionals and small businesses
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{PRICING_TIERS.pro.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {PRICING_TIERS.pro.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleUpgrade('pro')}
                  disabled={loading === 'pro'}
                >
                  {loading === 'pro' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Upgrade to Pro'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Agency Plan */}
            <Card className="relative border-2 border-blue-500">
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-semibold rounded-bl rounded-tr">
                MOST POPULAR
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">{PRICING_TIERS.agency.name}</CardTitle>
                <CardDescription>
                  For agencies and large organizations
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{PRICING_TIERS.agency.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {PRICING_TIERS.agency.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleUpgrade('agency')}
                  disabled={loading === 'agency'}
                >
                  {loading === 'agency' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Upgrade to Agency'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Billing History Card */}
      {currentTier !== "free" && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View and download your past invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInvoices ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-gray-400" />
                <p className="text-gray-500">Loading invoices...</p>
              </div>
            ) : invoices.length > 0 ? (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">
                          Invoice {invoice.number || invoice.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: invoice.currency.toUpperCase(),
                          }).format(invoice.amountPaid / 100)} • {invoice.created.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                        {invoice.status || 'Unknown'}
                      </Badge>
                      {invoice.pdfUrl && (
                        <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No billing history available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

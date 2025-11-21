/**
 * Billing & Subscription Management Page
 *
 * Manage subscription, payment methods, and view invoices
 */

import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  Download,
  Loader2
} from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

// Pricing tiers configuration
const PRICING_TIERS = {
  free: {
    name: "Free",
    price: "$0",
    features: [
      "5 projects",
      "10 analyses per month",
      "Basic SEO metrics",
      "Community support"
    ]
  },
  pro: {
    name: "Professional",
    price: "$29",
    features: [
      "Unlimited projects",
      "500 analyses per month",
      "Advanced SEO metrics",
      "Priority support",
      "API access",
      "Custom reports"
    ]
  },
  agency: {
    name: "Agency",
    price: "$99",
    features: [
      "Everything in Pro",
      "Unlimited analyses",
      "White-label reports",
      "Team collaboration",
      "Dedicated support",
      "Custom integrations"
    ]
  }
}

export default async function BillingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const currentTier = user.tier as keyof typeof PRICING_TIERS

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
          <div className="mt-6 flex gap-3">
            {currentTier === "free" && (
              <Link href="#upgrade">
                <Button className="gap-2">
                  <ArrowUpCircle className="h-4 w-4" />
                  Upgrade Plan
                </Button>
              </Link>
            )}
            {currentTier !== "free" && user.subscriptionStatus === "active" && (
              <>
                <Link href="#manage">
                  <Button variant="outline">
                    Manage Subscription
                  </Button>
                </Link>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  Cancel Subscription
                </Button>
              </>
            )}
            {currentTier !== "free" && user.subscriptionStatus !== "active" && (
              <Link href="#reactivate">
                <Button>
                  Reactivate Subscription
                </Button>
              </Link>
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
                <Button className="w-full" size="lg">
                  Upgrade to Pro
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
                <Button className="w-full" size="lg">
                  Upgrade to Agency
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Payment Method Card */}
      {currentTier !== "free" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Manage your payment methods and billing information
                </CardDescription>
              </div>
              <Button variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {user.stripeCustomerId ? (
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-600">Expires 12/2025</p>
                    </div>
                  </div>
                  <Badge>Default</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No payment method on file</p>
                <Button variant="link" className="mt-2">
                  Add a payment method
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
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
            <div className="space-y-3">
              {/* Placeholder invoices */}
              {[
                { date: "2025-01-01", amount: "$29.00", status: "paid" },
                { date: "2024-12-01", amount: "$29.00", status: "paid" },
                { date: "2024-11-01", amount: "$29.00", status: "paid" },
              ].map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        Invoice for {new Date(invoice.date).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{invoice.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                      {invoice.status === "paid" ? "Paid" : "Pending"}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {user.stripeCustomerId ? (
              <Button variant="link" className="mt-4 w-full">
                View All Invoices
              </Button>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No billing history available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Note Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Payment processing is handled securely by Stripe.
              Full Stripe integration with checkout, webhooks, and invoice management will be completed in the next phase.
              All subscription data is stored securely and encrypted.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

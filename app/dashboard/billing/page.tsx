/**
 * Billing & Subscription Management Page
 *
 * Manage subscription with Stripe integration
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
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
} from "lucide-react"
import { UpgradeButton, ManageSubscriptionButton } from "@/components/billing-actions"

export const dynamic = 'force-dynamic'

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
              <CardDescription>Your active subscription details</CardDescription>
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
                  <p className="text-lg font-semibold capitalize">{user.subscriptionStatus}</p>
                  <Badge variant={user.subscriptionStatus === "active" ? "default" : "destructive"}>
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

          <div className="mt-6 flex gap-3">
            {currentTier === "free" && (
              <UpgradeButton tier="pro">
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Upgrade Plan
              </UpgradeButton>
            )}
            {currentTier !== "free" && user.subscriptionStatus === "active" && (
              <ManageSubscriptionButton />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Plans Section */}
      {currentTier === "free" && (
        <div id="upgrade">
          <h2 className="text-2xl font-bold mb-4">Upgrade Your Plan</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">{PRICING_TIERS.pro.name}</CardTitle>
                <CardDescription>Perfect for professionals and small businesses</CardDescription>
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
                <UpgradeButton tier="pro">Upgrade to Pro</UpgradeButton>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-blue-500">
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-semibold rounded-bl rounded-tr">
                MOST POPULAR
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">{PRICING_TIERS.agency.name}</CardTitle>
                <CardDescription>For agencies and large organizations</CardDescription>
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
                <UpgradeButton tier="agency">Upgrade to Agency</UpgradeButton>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Billing Portal for paid users */}
      {currentTier !== "free" && (
        <Card>
          <CardHeader>
            <CardTitle>Payment & Invoices</CardTitle>
            <CardDescription>
              Manage your payment methods, view invoices, and update billing information through Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ManageSubscriptionButton />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

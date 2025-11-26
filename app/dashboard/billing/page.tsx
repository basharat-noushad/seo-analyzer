/**
 * Billing & Subscription Management Page
 *
 * Manage subscription, payment methods, and view invoices
 */

import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BillingPageClient } from "@/components/billing/billing-page-client"

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <BillingPageClient user={user} />
}

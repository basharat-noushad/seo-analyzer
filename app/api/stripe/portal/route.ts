import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createBillingPortalSession } from "@/lib/stripe"

export async function POST() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const url = await createBillingPortalSession(
      user.id,
      `${baseUrl}/dashboard/billing`
    )

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Billing portal error:", error)
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    )
  }
}

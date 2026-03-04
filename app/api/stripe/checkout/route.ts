import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createCheckoutSession } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { priceId } = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const url = await createCheckoutSession(
      user.id,
      user.email,
      user.name || null,
      priceId,
      `${baseUrl}/dashboard/billing?success=true`,
      `${baseUrl}/dashboard/billing?canceled=true`
    )

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Checkout session error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}

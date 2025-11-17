"use client"

/**
 * Forgot Password Page
 *
 * Allows users to request a password reset link.
 * Note: Email functionality will be implemented in a later phase.
 */

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // TODO: Implement password reset email in Phase 4 (Monitoring & Alerts)
      // For now, just show success message
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitted(true)
    } catch (error) {
      setError("Failed to send reset email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            If an account exists with {email}, you will receive a password reset link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              Password reset instructions have been sent to your email.
            </p>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Didn't receive the email? Check your spam folder or try again in a few minutes.
          </p>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm text-primary hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="p-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
            <p className="font-medium">Note:</p>
            <p className="mt-1">
              Email functionality will be added in Phase 4. For now, please contact support for password resets.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  )
}

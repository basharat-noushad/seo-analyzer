/**
 * User Profile Page
 *
 * Display and edit user profile information
 */

import { getCurrentUser } from "@/lib/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Calendar, Crown } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your personal details and account status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.name || ""} />
              <AvatarFallback className="text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Name</span>
                </div>
                <p className="font-medium text-lg mt-1">{user.name || "Not set"}</p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Email</span>
                </div>
                <p className="font-medium mt-1">{user.email}</p>
                {user.emailVerified ? (
                  <Badge variant="default" className="mt-1">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="mt-1">
                    Not Verified
                  </Badge>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Plan</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-medium capitalize">{user.tier}</span>
                  <Badge
                    variant={
                      user.tier === "agency"
                        ? "default"
                        : user.tier === "pro"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {user.tier === "agency"
                      ? "Premium"
                      : user.tier === "pro"
                      ? "Professional"
                      : "Free"}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Member since</span>
                </div>
                <p className="font-medium mt-1">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      {user.tier !== "free" && user.subscriptionStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              Your current subscription details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-gray-600 mb-1">Status</div>
                <Badge
                  variant={
                    user.subscriptionStatus === "active"
                      ? "default"
                      : "destructive"
                  }
                  className="capitalize"
                >
                  {user.subscriptionStatus}
                </Badge>
              </div>
              {user.subscriptionEndsAt && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    {user.subscriptionStatus === "active" ? "Renews on" : "Ends on"}
                  </div>
                  <p className="font-medium">
                    {new Date(user.subscriptionEndsAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Note Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Profile editing functionality will be added in a future update.
              For now, you can view your account information here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

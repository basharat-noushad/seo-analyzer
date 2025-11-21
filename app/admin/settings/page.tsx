/**
 * Admin Settings
 *
 * System configuration and settings
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Settings,
  Database,
  Mail,
  Shield,
  Zap,
  Bell,
  Save
} from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin" className="text-sm text-primary-600 hover:underline mb-2 inline-block">
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure platform settings and integrations
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>General Settings</CardTitle>
          </div>
          <CardDescription>
            Platform-wide configuration options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="site-name">Site Name</Label>
            <Input id="site-name" defaultValue="SEO Analyzer Pro" />
          </div>

          <div>
            <Label htmlFor="support-email">Support Email</Label>
            <Input id="support-email" type="email" defaultValue="support@seo-analyzer.com" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-gray-600">
                Temporarily disable access for maintenance
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New User Registrations</p>
              <p className="text-sm text-gray-600">
                Allow new users to sign up
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* API & Integration Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <CardTitle>API & Integrations</CardTitle>
          </div>
          <CardDescription>
            Configure external service integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="stripe-key">Stripe Secret Key</Label>
            <Input id="stripe-key" type="password" defaultValue="sk_test_..." />
          </div>

          <div>
            <Label htmlFor="resend-key">Resend API Key</Label>
            <Input id="resend-key" type="password" defaultValue="re_..." />
          </div>

          <div>
            <Label htmlFor="google-api">Google API Key</Label>
            <Input id="google-api" type="password" placeholder="Enter Google API key" />
          </div>

          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save API Keys
          </Button>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Settings</CardTitle>
          </div>
          <CardDescription>
            Configure email notifications and SMTP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="from-email">From Email</Label>
            <Input id="from-email" type="email" defaultValue="noreply@seo-analyzer.com" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Welcome Emails</p>
              <p className="text-sm text-gray-600">
                Send welcome email to new users
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Analysis Complete Emails</p>
              <p className="text-sm text-gray-600">
                Notify users when analysis is complete
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Reports</p>
              <p className="text-sm text-gray-600">
                Send automated weekly reports
              </p>
            </div>
            <Switch />
          </div>

          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Email Settings
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>
            Platform security configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">
                Require 2FA for all admin accounts
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Session Timeout</p>
              <p className="text-sm text-gray-600">
                Automatically log out inactive users
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div>
            <Label htmlFor="session-duration">Session Duration (hours)</Label>
            <Input id="session-duration" type="number" defaultValue="24" min="1" max="720" />
          </div>

          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Security Settings
          </Button>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting</CardTitle>
          <CardDescription>
            API and analysis rate limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="free-limit">Free Tier Monthly Limit</Label>
            <Input id="free-limit" type="number" defaultValue="10" />
          </div>

          <div>
            <Label htmlFor="pro-limit">Pro Tier Monthly Limit</Label>
            <Input id="pro-limit" type="number" defaultValue="500" />
          </div>

          <div>
            <Label htmlFor="api-rate">API Rate Limit (requests per minute)</Label>
            <Input id="api-rate" type="number" defaultValue="60" />
          </div>

          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Limits
          </Button>
        </CardContent>
      </Card>

      {/* Note */}
      <Card>
        <CardContent className="pt-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These are system settings that affect the entire platform.
              Full functionality with actual integration updates, validation, and testing will be implemented
              in the next phase. Always test changes in a staging environment first.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

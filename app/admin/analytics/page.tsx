/**
 * Admin Analytics
 *
 * System-wide analytics and metrics
 */

import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Users,
  FileText,
  Activity,
  DollarSign,
  Target
} from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch analytics data
  const [
    totalUsers,
    totalAnalyses,
    analysesThisMonth,
    newUsersThisMonth
  ] = await Promise.all([
    prisma.user.count(),
    prisma.analysis.count(),
    prisma.analysis.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })
  ])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin" className="text-sm text-primary-600 hover:underline mb-2 inline-block">
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          System-wide metrics and performance data
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                <p className="text-3xl font-bold">{totalAnalyses.toLocaleString()}</p>
              </div>
              <FileText className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold">{analysesThisMonth.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Users</p>
                <p className="text-3xl font-bold">{newUsersThisMonth}</p>
              </div>
              <Users className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg per User</p>
                <p className="text-3xl font-bold">{(totalAnalyses / totalUsers).toFixed(1)}</p>
              </div>
              <Activity className="h-10 w-10 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
          <CardDescription>
            Analysis volume over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Chart Visualization</p>
              <p className="text-sm text-gray-500 mt-1">
                Real-time charts will be implemented with a charting library
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* More Analytics Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Features</CardTitle>
            <CardDescription>Most used tools and features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Page Analyzer", uses: 15420, color: "bg-blue-500" },
                { name: "Competitor Analysis", uses: 8930, color: "bg-purple-500" },
                { name: "Site Audit", uses: 6215, color: "bg-green-500" },
                { name: "Rank Tracker", uses: 4830, color: "bg-orange-500" },
                { name: "Keyword Research", uses: 3120, color: "bg-pink-500" }
              ].map((feature, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{feature.name}</span>
                    <span className="text-sm text-gray-600">{feature.uses.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${feature.color} h-2 rounded-full`}
                      style={{ width: `${(feature.uses / 15420) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New registrations by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Growth Chart</p>
                <p className="text-sm text-gray-500 mt-1">
                  Monthly growth visualization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note */}
      <Card>
        <CardContent className="pt-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a preview of the analytics dashboard. Full implementation with
              interactive charts (using Recharts or Chart.js), real-time data, and advanced filtering will be
              added in the next phase.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

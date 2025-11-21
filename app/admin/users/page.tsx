/**
 * Admin Users Management
 *
 * View, edit, and manage user accounts
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  Crown,
  Shield
} from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch users with pagination
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tier: true,
      emailVerified: true,
      subscriptionStatus: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          projects: true,
          analyses: true
        }
      }
    }
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-primary-600 hover:underline mb-2 inline-block">
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            View and manage all user accounts
          </p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          {users.length} Users
        </Badge>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users by name or email..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Showing {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Tier</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Projects</th>
                  <th className="pb-3 font-medium">Analyses</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="text-sm">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {u.name || "No name"}
                        </p>
                        <p className="text-gray-600 text-xs">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      {u.role === "admin" ? (
                        <Badge variant="default" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </td>
                    <td className="py-4">
                      <Badge
                        variant={
                          u.tier === "agency" ? "default" :
                          u.tier === "pro" ? "secondary" :
                          "outline"
                        }
                        className="capitalize gap-1"
                      >
                        {u.tier === "agency" && <Crown className="h-3 w-3" />}
                        {u.tier}
                      </Badge>
                    </td>
                    <td className="py-4">
                      {u.emailVerified ? (
                        <Badge variant="default" className="bg-green-500">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Unverified
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 text-gray-900">
                      {u._count.projects}
                    </td>
                    <td className="py-4 text-gray-900">
                      {u._count.analyses}
                    </td>
                    <td className="py-4 text-gray-600">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing 1-{users.length} of {users.length} users
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> User management features including editing roles, deleting users,
              and advanced filtering will be fully functional in the next phase. Currently showing read-only data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

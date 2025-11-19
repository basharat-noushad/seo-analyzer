"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Users,
  FolderKanban,
  Activity,
  Plus,
  Mail,
  Trash2,
  Crown,
  Shield,
  User as UserIcon,
  Eye,
  X,
  Settings,
  ArrowLeft,
} from "lucide-react"

interface TeamMember {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  createdAt: string
}

interface TeamProject {
  id: string
  project: {
    id: string
    name: string
    domain: string
    seoScore: number | null
    lastScanAt: string | null
    _count: {
      analyses: number
      issues: number
      keywords: number
    }
  }
  createdAt: string
}

interface ActivityLog {
  id: string
  action: string
  entityType: string | null
  user: {
    name: string | null
    email: string
  }
  createdAt: string
  metadata: any
}

interface Team {
  id: string
  name: string
  slug: string
  description: string | null
  plan: string
  userRole: string
  owner: {
    id: string
    name: string | null
    email: string
  }
  members: TeamMember[]
  projects: TeamProject[]
  invitations: any[]
  _count: {
    projects: number
    members: number
    activityLogs: number
  }
}

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string

  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"members" | "projects" | "activity">(
    "members"
  )
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetchTeam()
  }, [teamId])

  useEffect(() => {
    if (activeTab === "activity") {
      fetchActivityLogs()
    }
  }, [activeTab])

  const fetchTeam = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}`)
      if (response.ok) {
        const data = await response.json()
        setTeam(data.team)
      } else {
        router.push("/dashboard/teams")
      }
    } catch (error) {
      console.error("Error fetching team:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/activity?limit=50`)
      if (response.ok) {
        const data = await response.json()
        setActivityLogs(data.activityLogs)
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)

    try {
      const response = await fetch(`/api/teams/${teamId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })

      if (response.ok) {
        alert("Invitation sent successfully!")
        setShowInviteModal(false)
        setInviteEmail("")
        setInviteRole("member")
        fetchTeam()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to send invitation")
      }
    } catch (error) {
      console.error("Error inviting member:", error)
      alert("Failed to send invitation")
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      const response = await fetch(
        `/api/teams/${teamId}/members?memberId=${memberId}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        fetchTeam()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to remove member")
      }
    } catch (error) {
      console.error("Error removing member:", error)
      alert("Failed to remove member")
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />
      case "member":
        return <UserIcon className="h-4 w-4 text-green-500" />
      case "viewer":
        return <Eye className="h-4 w-4 text-gray-500" />
      default:
        return <UserIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatActivityAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team...</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Team not found</p>
      </div>
    )
  }

  const canInvite = ["owner", "admin"].includes(team.userRole)
  const canManageMembers = ["owner", "admin"].includes(team.userRole)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/dashboard/teams")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            {team.description && (
              <p className="text-gray-600 mt-2">{team.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <span className="text-sm text-gray-500">
                {team._count.members} members
              </span>
              <span className="text-sm text-gray-500">
                {team._count.projects} projects
              </span>
              <span className="text-sm text-gray-500">
                Owner: {team.owner.name || team.owner.email}
              </span>
            </div>
          </div>
          {team.userRole === "owner" && (
            <button
              onClick={() => router.push(`/dashboard/teams/${teamId}/settings`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Settings className="h-5 w-5" />
              Settings
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("members")}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === "members"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({team._count.members})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === "projects"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Projects ({team._count.projects})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === "activity"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "members" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
            {canInvite && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Mail className="h-5 w-5" />
                Invite Member
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            {team.members.map((member, index) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-4 ${
                  index !== team.members.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">
                      {(member.user.name || member.user.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(member.role)}
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {member.role}
                    </span>
                  </div>
                  {canManageMembers &&
                    member.role !== "owner" &&
                    member.user.id !== team.owner.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* Pending Invitations */}
          {team.invitations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Pending Invitations
              </h3>
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                {team.invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{invitation.email}</p>
                      <p className="text-sm text-gray-500">
                        Invited as {invitation.role} by {invitation.inviter.name}
                      </p>
                    </div>
                    <span className="text-sm text-yellow-600">Pending</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "projects" && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Team Projects
          </h2>
          {team.projects.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <FolderKanban className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600">
                Add projects to this team to collaborate
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {team.projects.map((tp) => (
                <div
                  key={tp.id}
                  onClick={() => router.push(`/dashboard/projects/${tp.project.id}`)}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {tp.project.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{tp.project.domain}</p>
                  {tp.project.seoScore && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">SEO Score</span>
                        <span className="font-semibold text-gray-900">
                          {tp.project.seoScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${tp.project.seoScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{tp.project._count.analyses} analyses</span>
                    <span>{tp.project._count.issues} issues</span>
                    <span>{tp.project._count.keywords} keywords</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Activity Log
          </h2>
          <div className="bg-white rounded-lg border border-gray-200">
            {activityLogs.length === 0 ? (
              <div className="p-12 text-center">
                <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No activity yet</p>
              </div>
            ) : (
              activityLogs.map((log, index) => (
                <div
                  key={log.id}
                  className={`p-4 ${
                    index !== activityLogs.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Activity className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">
                        <span className="font-medium">
                          {log.user.name || log.user.email}
                        </span>{" "}
                        {formatActivityAction(log.action).toLowerCase()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Invite Member</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleInviteMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="colleague@company.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="viewer">Viewer - Can view team resources</option>
                  <option value="member">Member - Can add and manage projects</option>
                  <option value="admin">Admin - Can manage team and members</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={inviting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  disabled={inviting}
                >
                  {inviting ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

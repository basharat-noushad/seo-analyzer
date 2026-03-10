import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/db"

/**
 * POST /api/notifications/email
 * Send email notification (simulated - logs to database)
 *
 * In production, this would integrate with an email service like Resend, SendGrid, etc.
 * For now, we just mark alerts as "sent" and log the event
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { alertId, alertIds } = body

    // Get user email for logging
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let updatedCount = 0

    if (alertId) {
      // Send email for single alert
      const alert = await prisma.alert.findUnique({
        where: { id: alertId },
        include: { project: true },
      })

      if (alert && alert.userId === session.user.id) {
        // Send alert email
        await sendAlertEmail(user.email, alert)

        // Mark alert as email sent
        await prisma.alert.update({
          where: { id: alertId },
          data: { sentEmail: true },
        })

        updatedCount = 1
      }
    } else if (alertIds && Array.isArray(alertIds)) {
      // Send emails for multiple alerts
      const alerts = await prisma.alert.findMany({
        where: {
          id: { in: alertIds },
          userId: session.user.id,
        },
        include: { project: true },
      })

      // Send alert emails
      for (const alert of alerts) {
        await sendAlertEmail(user.email, alert)
      }

      // Mark alerts as email sent
      const result = await prisma.alert.updateMany({
        where: {
          id: { in: alertIds },
          userId: session.user.id,
        },
        data: { sentEmail: true },
      })

      updatedCount = result.count
    }

    return NextResponse.json({
      message: `Email notification(s) sent successfully`,
      count: updatedCount,
    })
  } catch (error) {
    console.error("Error sending email notification:", error)
    return NextResponse.json(
      { error: "Failed to send email notification" },
      { status: 500 }
    )
  }
}

/**
 * Send alert notification email using the centralized email service
 */
async function sendAlertEmail(userEmail: string, alert: any) {
  try {
    const { sendAlertNotificationEmail } = await import("@/lib/email")
    await sendAlertNotificationEmail(userEmail, "", [
      {
        title: alert.title,
        severity: alert.severity,
        message: alert.message,
        projectName: alert.project?.name,
      },
    ])
  } catch (error) {
    console.error("Failed to send alert email:", error)
  }
}

/**
 * GET /api/notifications/email/stats
 * Get email notification statistics
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Count emails sent
    const totalEmailsSent = await prisma.alert.count({
      where: {
        userId: session.user.id,
        sentEmail: true,
      },
    })

    // Count pending emails (unread alerts that haven't been emailed)
    const pendingEmails = await prisma.alert.count({
      where: {
        userId: session.user.id,
        sentEmail: false,
        read: false,
      },
    })

    // Get recent email activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentEmails = await prisma.alert.count({
      where: {
        userId: session.user.id,
        sentEmail: true,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    return NextResponse.json({
      stats: {
        total: totalEmailsSent,
        pending: pendingEmails,
        last30Days: recentEmails,
      },
    })
  } catch (error) {
    console.error("Error fetching email stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch email statistics" },
      { status: 500 }
    )
  }
}

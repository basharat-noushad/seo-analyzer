import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const maxDuration = 300

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const now = new Date()

    // Find all active monitoring jobs that are due to run
    const jobs = await prisma.monitoringJob.findMany({
      where: {
        status: "active",
        nextRunAt: { lte: now },
      },
      include: {
        project: true,
        page: true,
      },
    })

    const results = {
      processed: 0,
      alerts: 0,
      errors: 0,
    }

    for (const job of jobs) {
      try {
        const project = job.project
        if (!project) continue

        const url = job.page?.url ?? project.domain

        // Get the previous analysis for comparison
        const previousAnalysis = await prisma.analysis.findFirst({
          where: {
            projectId: project.id,
            pageId: job.pageId,
            status: "completed",
          },
          orderBy: { createdAt: "desc" },
        })

        // Create a pending analysis and process it
        const analysis = await prisma.analysis.create({
          data: {
            userId: project.userId,
            projectId: project.id,
            pageId: job.pageId,
            url,
            type: "page",
            status: "pending",
          },
        })

        // Process the analysis using our analysis processor
        const { processAnalysis } = await import("@/lib/analysis-processor")
        await processAnalysis(analysis.id)

        // Reload the analysis after processing
        const completedAnalysis = await prisma.analysis.findUnique({
          where: { id: analysis.id },
        })

        // Detect score changes and create alerts
        if (
          previousAnalysis?.seoScore != null &&
          completedAnalysis?.seoScore != null &&
          completedAnalysis.seoScore < previousAnalysis.seoScore
        ) {
          const scoreDrop = previousAnalysis.seoScore - completedAnalysis.seoScore

          const alert = await prisma.alert.create({
            data: {
              userId: project.userId,
              projectId: project.id,
              type: "rank_drop",
              severity: scoreDrop >= 20 ? "critical" : scoreDrop >= 10 ? "high" : "medium",
              title: `SEO score dropped by ${scoreDrop} points`,
              message: `The SEO score for ${url} dropped from ${previousAnalysis.seoScore} to ${completedAnalysis.seoScore}.`,
            },
          })

          // Send alert email
          try {
            const user = await prisma.user.findUnique({
              where: { id: project.userId },
              select: { email: true, name: true },
            })
            if (user) {
              const { sendAlertNotificationEmail } = await import("@/lib/email")
              await sendAlertNotificationEmail(user.email, user.name || "", [
                {
                  title: alert.title,
                  severity: alert.severity,
                  message: alert.message ?? "",
                  projectName: project.name,
                },
              ])

              await prisma.alert.update({
                where: { id: alert.id },
                data: { sentEmail: true },
              })
            }
          } catch (emailError) {
            console.error("Failed to send alert email:", emailError)
          }

          results.alerts++
        }

        // Update project's latest score
        if (completedAnalysis?.seoScore != null) {
          await prisma.project.update({
            where: { id: project.id },
            data: {
              seoScore: completedAnalysis.seoScore,
              lastScanAt: now,
            },
          })
        }

        // Calculate next run time based on frequency
        const nextRunAt = calculateNextRun(job.frequency, now)

        await prisma.monitoringJob.update({
          where: { id: job.id },
          data: {
            lastRunAt: now,
            nextRunAt,
          },
        })

        results.processed++
      } catch (jobError) {
        console.error(`Error processing monitoring job ${job.id}:`, jobError)
        results.errors++
      }
    }

    return NextResponse.json({
      message: "Monitoring cron completed",
      totalJobs: jobs.length,
      ...results,
    })
  } catch (error) {
    console.error("Monitoring cron error:", error)
    return NextResponse.json(
      { error: "Monitoring cron failed" },
      { status: 500 }
    )
  }
}

function calculateNextRun(frequency: string, from: Date): Date {
  const next = new Date(from)
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1)
      break
    case "weekly":
      next.setDate(next.getDate() + 7)
      break
    case "monthly":
      next.setMonth(next.getMonth() + 1)
      break
    default:
      next.setDate(next.getDate() + 1)
  }
  return next
}

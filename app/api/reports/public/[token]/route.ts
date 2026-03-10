import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET /api/reports/public/[token]
 * Get a public report by token (no authentication required)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const report = await prisma.report.findUnique({
      where: {
        publicToken: params.token,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
        creator: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    if (!report.isPublic) {
      return NextResponse.json(
        { error: "This report is not public" },
        { status: 403 }
      )
    }

    // Return report without sensitive information
    const publicReport = {
      id: report.id,
      name: report.name,
      type: report.type,
      createdAt: report.createdAt,
      dateRangeStart: report.dateRangeStart,
      dateRangeEnd: report.dateRangeEnd,
      reportData: report.reportData,
      project: {
        name: report.project.name,
        domain: report.project.domain,
      },
      creator: {
        name: report.creator?.name || "Anonymous",
      },
    }

    return NextResponse.json({ report: publicReport })
  } catch (error) {
    console.error("Error fetching public report:", error)
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-config"
import { prisma } from "@/lib/db"

/**
 * POST /api/reports/[id]/export
 * Export report as PDF using Puppeteer, with HTML fallback.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get report with related data
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            domain: true,
            userId: true,
            seoScore: true,
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    if (report.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get user tier for white-label check
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true },
    })

    // Get issues for the report
    const issues = await prisma.issue.findMany({
      where: { projectId: report.projectId },
      orderBy: { severity: "asc" },
      take: 100,
    })

    // Generate HTML report
    const { generateReportHTML } = await import("@/lib/report-templates")
    const reportData = {
      name: report.name,
      url: report.project.domain,
      score: report.project.seoScore || 0,
      date: report.createdAt.toISOString(),
      issues: issues.map((issue) => ({
        category: issue.category,
        severity: issue.severity,
        title: issue.title,
        description: issue.description || "",
        recommendation: issue.recommendation || "",
      })),
      whiteLabel: user?.tier === "agency" ? { companyName: "Agency Report" } : undefined,
    }

    const html = generateReportHTML(reportData)

    // Try Puppeteer for real PDF generation
    let pdfBuffer: Buffer
    try {
      const puppeteer = await import("puppeteer")
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: "networkidle0" })
      const pdf = await page.pdf({ format: "A4", printBackground: true })
      await browser.close()
      pdfBuffer = Buffer.from(pdf)
    } catch (puppeteerError) {
      console.error("Puppeteer PDF generation failed, returning HTML:", puppeteerError)
      // Fallback: return the HTML report directly
      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
          "Content-Disposition": `attachment; filename="${report.name}.html"`,
        },
      })
    }

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${report.name}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error exporting report:", error)
    return NextResponse.json(
      { error: "Failed to export report" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/reports/[id]/export
 * Download the generated report
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: { userId: true },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    if (report.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (!report.pdfUrl) {
      return NextResponse.json(
        { error: "PDF not generated yet. Please export the report first." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      pdfUrl: report.pdfUrl,
      reportName: report.name,
    })
  } catch (error) {
    console.error("Error downloading report:", error)
    return NextResponse.json(
      { error: "Failed to download report" },
      { status: 500 }
    )
  }
}

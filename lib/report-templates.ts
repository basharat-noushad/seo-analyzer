/**
 * HTML Report Templates
 *
 * Generates full HTML pages for PDF report generation.
 * Supports white-label branding for Agency tier users.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReportIssue {
  category: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string;
}

export interface WhiteLabelConfig {
  companyName: string;
  logoUrl?: string;
  primaryColor?: string;
}

export interface ReportData {
  name: string;
  url: string;
  score: number;
  date: string;
  issues: ReportIssue[];
  whiteLabel?: WhiteLabelConfig;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function severityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "#dc2626";
    case "high":
      return "#ea580c";
    case "medium":
      return "#d97706";
    case "low":
      return "#2563eb";
    default:
      return "#6b7280";
  }
}

function severityBgColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "#fef2f2";
    case "high":
      return "#fff7ed";
    case "medium":
      return "#fffbeb";
    case "low":
      return "#eff6ff";
    default:
      return "#f9fafb";
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#d97706";
  if (score >= 40) return "#ea580c";
  return "#dc2626";
}

function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    seo: "SEO",
    technical: "Technical",
    content: "Content",
    performance: "Performance",
    links: "Links",
  };
  return labels[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function generateReportHTML(report: ReportData): string {
  const primaryColor = report.whiteLabel?.primaryColor || "#1a56db";
  const companyName = report.whiteLabel?.companyName || "SEO Analyzer";
  const logoUrl = report.whiteLabel?.logoUrl;

  const issuesBySeverity = {
    critical: report.issues.filter((i) => i.severity === "critical"),
    high: report.issues.filter((i) => i.severity === "high"),
    medium: report.issues.filter((i) => i.severity === "medium"),
    low: report.issues.filter((i) => i.severity === "low"),
  };

  const issuesByCategory: Record<string, ReportIssue[]> = {};
  for (const issue of report.issues) {
    if (!issuesByCategory[issue.category]) {
      issuesByCategory[issue.category] = [];
    }
    issuesByCategory[issue.category].push(issue);
  }

  const headerContent = logoUrl
    ? `<img src="${logoUrl}" alt="${companyName}" style="max-height:40px;max-width:200px;" />`
    : `<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">${companyName}</h1>`;

  const issueRows = report.issues
    .map(
      (issue) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;vertical-align:top;">
          <span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;color:#ffffff;background-color:${severityColor(issue.severity)};text-transform:uppercase;letter-spacing:0.5px;">
            ${issue.severity}
          </span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;vertical-align:top;">
          <span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:500;color:#374151;background-color:#f3f4f6;">
            ${categoryLabel(issue.category)}
          </span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;vertical-align:top;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#111827;">${issue.title}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#6b7280;line-height:1.5;">${issue.description}</p>
          <div style="padding:8px 12px;background-color:${severityBgColor(issue.severity)};border-radius:4px;border-left:3px solid ${severityColor(issue.severity)};">
            <p style="margin:0;font-size:12px;color:#374151;line-height:1.5;">
              <strong>Recommendation:</strong> ${issue.recommendation}
            </p>
          </div>
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SEO Report - ${report.name}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background-color: #ffffff;
      font-size: 14px;
      line-height: 1.6;
    }
    @media print {
      body { background: #ffffff; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div style="background-color:${primaryColor};padding:32px 48px;color:#ffffff;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>${headerContent}</td>
        <td style="text-align:right;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.8);">SEO Audit Report</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.8);">${report.date}</p>
        </td>
      </tr>
    </table>
  </div>

  <!-- Report Meta -->
  <div style="padding:32px 48px;border-bottom:1px solid #e5e7eb;">
    <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">${report.name}</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">${report.url}</p>

    <!-- Score Card -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:160px;vertical-align:top;">
          <div style="width:120px;height:120px;border-radius:50%;border:8px solid ${scoreColor(report.score)};display:flex;align-items:center;justify-content:center;text-align:center;line-height:120px;">
            <span style="font-size:36px;font-weight:700;color:${scoreColor(report.score)};">${report.score}</span>
          </div>
          <p style="margin:8px 0 0;font-size:13px;color:#6b7280;text-align:center;">Overall Score</p>
        </td>
        <td style="vertical-align:top;padding-left:32px;">
          <h3 style="margin:0 0 12px;font-size:16px;color:#111827;">Issues Summary</h3>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 16px 4px 0;">
                <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background-color:#dc2626;vertical-align:middle;"></span>
                <span style="margin-left:6px;font-size:13px;color:#374151;">Critical: <strong>${issuesBySeverity.critical.length}</strong></span>
              </td>
              <td style="padding:4px 16px 4px 0;">
                <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background-color:#ea580c;vertical-align:middle;"></span>
                <span style="margin-left:6px;font-size:13px;color:#374151;">High: <strong>${issuesBySeverity.high.length}</strong></span>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 16px 4px 0;">
                <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background-color:#d97706;vertical-align:middle;"></span>
                <span style="margin-left:6px;font-size:13px;color:#374151;">Medium: <strong>${issuesBySeverity.medium.length}</strong></span>
              </td>
              <td style="padding:4px 16px 4px 0;">
                <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background-color:#2563eb;vertical-align:middle;"></span>
                <span style="margin-left:6px;font-size:13px;color:#374151;">Low: <strong>${issuesBySeverity.low.length}</strong></span>
              </td>
            </tr>
          </table>

          <h3 style="margin:20px 0 12px;font-size:16px;color:#111827;">Issues by Category</h3>
          <table cellpadding="0" cellspacing="0">
            ${Object.entries(issuesByCategory)
              .map(
                ([cat, items]) => `
            <tr>
              <td style="padding:2px 12px 2px 0;font-size:13px;color:#374151;">${categoryLabel(cat)}</td>
              <td style="padding:2px 0;font-size:13px;font-weight:600;color:#111827;">${items.length}</td>
            </tr>`
              )
              .join("")}
          </table>
        </td>
      </tr>
    </table>
  </div>

  <!-- Issues Detail -->
  <div style="padding:32px 48px;" class="page-break">
    <h2 style="margin:0 0 20px;font-size:20px;color:#111827;">Detailed Issues</h2>

    ${report.issues.length === 0
      ? `<p style="color:#16a34a;font-size:15px;font-weight:500;">No issues found. Your site is in excellent shape!</p>`
      : `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <tr style="background-color:#f9fafb;">
        <th style="padding:10px 16px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;width:100px;">Severity</th>
        <th style="padding:10px 16px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;width:100px;">Category</th>
        <th style="padding:10px 16px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;">Details</th>
      </tr>
      ${issueRows}
    </table>`
    }
  </div>

  <!-- Footer -->
  <div style="padding:24px 48px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      Generated by ${companyName} &middot; ${report.date}
    </p>
  </div>

</body>
</html>`;
}

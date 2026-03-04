/**
 * Centralized Email Service
 *
 * Uses Resend SDK for sending branded transactional emails.
 * Falls back to console logging when RESEND_API_KEY is not configured.
 */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "SEO Analyzer <noreply@seoanalyzer.com>";
const APP_NAME = "SEO Analyzer";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a56db;padding:24px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${APP_NAME}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">
                &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buttonHtml(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:#1a56db;border-radius:6px;">
      <a href="${url}" target="_blank" style="display:inline-block;padding:12px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

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

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!resend) {
    console.log("=== EMAIL (console fallback) ===");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML length: ${html.length} chars`);
    console.log("================================");
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<void> {
  const subject = `Reset your ${APP_NAME} password`;
  const body = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Password Reset Request</h2>
    <p style="margin:0 0 8px;color:#374151;font-size:15px;line-height:1.6;">
      Hi ${name || "there"},
    </p>
    <p style="margin:0 0 8px;color:#374151;font-size:15px;line-height:1.6;">
      We received a request to reset your password. Click the button below to choose a new password:
    </p>
    ${buttonHtml("Reset Password", resetUrl)}
    <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
      This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.
    </p>
    <p style="margin:16px 0 0;color:#6b7280;font-size:13px;line-height:1.6;word-break:break-all;">
      ${resetUrl}
    </p>`;

  await sendEmail(email, subject, baseLayout(subject, body));
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string
): Promise<void> {
  const subject = `Verify your ${APP_NAME} email address`;
  const body = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Email Verification</h2>
    <p style="margin:0 0 8px;color:#374151;font-size:15px;line-height:1.6;">
      Hi ${name || "there"},
    </p>
    <p style="margin:0 0 8px;color:#374151;font-size:15px;line-height:1.6;">
      Thank you for signing up! Please verify your email address by clicking the button below:
    </p>
    ${buttonHtml("Verify Email", verificationUrl)}
    <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
      This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.
    </p>
    <p style="margin:16px 0 0;color:#6b7280;font-size:13px;line-height:1.6;word-break:break-all;">
      ${verificationUrl}
    </p>`;

  await sendEmail(email, subject, baseLayout(subject, body));
}

export async function sendTeamInvitationEmail(
  email: string,
  inviterName: string,
  teamName: string,
  inviteUrl: string
): Promise<void> {
  const subject = `You've been invited to join ${teamName} on ${APP_NAME}`;
  const body = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Team Invitation</h2>
    <p style="margin:0 0 8px;color:#374151;font-size:15px;line-height:1.6;">
      Hi there,
    </p>
    <p style="margin:0 0 8px;color:#374151;font-size:15px;line-height:1.6;">
      <strong>${inviterName}</strong> has invited you to join the team <strong>${teamName}</strong> on ${APP_NAME}.
    </p>
    <p style="margin:0 0 8px;color:#374151;font-size:15px;line-height:1.6;">
      Click the button below to accept the invitation and get started:
    </p>
    ${buttonHtml("Accept Invitation", inviteUrl)}
    <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6;">
      This invitation will expire in 7 days. If you were not expecting this invitation, you can safely ignore this email.
    </p>
    <p style="margin:16px 0 0;color:#6b7280;font-size:13px;line-height:1.6;word-break:break-all;">
      ${inviteUrl}
    </p>`;

  await sendEmail(email, subject, baseLayout(subject, body));
}

export async function sendAlertNotificationEmail(
  email: string,
  name: string,
  alerts: { type?: string; severity: string; title: string; message?: string; projectName?: string }[]
): Promise<void> {
  const subject = `[${APP_NAME}] ${alerts.length} new alert${alerts.length > 1 ? "s" : ""} detected`;

  const alertRows = alerts
    .map(
      (alert) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
        <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;color:#ffffff;background-color:${severityColor(alert.severity)};text-transform:uppercase;">
          ${alert.severity}
        </span>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${alert.title}</p>
        ${alert.message ? `<p style="margin:4px 0 0;font-size:13px;color:#6b7280;">${alert.message}</p>` : ""}
      </td>
    </tr>`
    )
    .join("");

  const body = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Alert Notification</h2>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      Hi ${name || "there"}, we detected the following alert${alerts.length > 1 ? "s" : ""} for your projects:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
      <tr style="background-color:#f9fafb;">
        <th style="padding:10px 16px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Severity</th>
        <th style="padding:10px 16px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Details</th>
      </tr>
      ${alertRows}
    </table>
    <p style="margin:24px 0 0;color:#374151;font-size:14px;">
      Log in to your dashboard to review and resolve these alerts.
    </p>`;

  await sendEmail(email, subject, baseLayout(subject, body));
}

export async function sendSubscriptionEmail(
  email: string,
  name: string,
  type: "activated" | "canceled" | "payment_failed"
): Promise<void> {
  const configs: Record<string, { subject: string; heading: string; message: string }> = {
    activated: {
      subject: `Your ${APP_NAME} subscription is active!`,
      heading: "Subscription Activated",
      message: `Your subscription is now active. You have access to all premium features. Thank you for choosing ${APP_NAME}!`,
    },
    canceled: {
      subject: `Your ${APP_NAME} subscription has been canceled`,
      heading: "Subscription Canceled",
      message:
        "Your subscription has been canceled. You will continue to have access to premium features until the end of your current billing period. After that, your account will revert to the free tier.",
    },
    payment_failed: {
      subject: `[Action Required] Payment failed for your ${APP_NAME} subscription`,
      heading: "Payment Failed",
      message:
        "We were unable to process your latest payment. Please update your payment method to avoid any interruption in service. Your subscription will be paused if the issue is not resolved within 7 days.",
    },
  };

  const config = configs[type];
  const body = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">${config.heading}</h2>
    <p style="margin:0 0 8px;color:#374151;font-size:15px;line-height:1.6;">
      Hi ${name || "there"},
    </p>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      ${config.message}
    </p>
    <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
      If you have any questions, please contact our support team.
    </p>`;

  await sendEmail(email, config.subject, baseLayout(config.subject, body));
}

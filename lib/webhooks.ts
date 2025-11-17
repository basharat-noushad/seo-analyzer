/**
 * Webhook Delivery System
 * Triggers and delivers webhook events to registered endpoints
 */

import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export type WebhookEvent =
  | "analysis_completed"
  | "analysis_failed"
  | "rank_changed"
  | "issue_detected"
  | "issue_resolved"
  | "monitoring_triggered"
  | "project_created"
  | "project_updated"

export interface WebhookPayload {
  event: WebhookEvent
  timestamp: string
  data: any
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

/**
 * Deliver webhook to endpoint
 */
async function deliverWebhook(
  webhookId: string,
  url: string,
  secret: string,
  payload: WebhookPayload
): Promise<{
  success: boolean
  statusCode?: number
  response?: string
  error?: string
}> {
  try {
    const payloadString = JSON.stringify(payload)
    const signature = generateSignature(payloadString, secret)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": payload.event,
        "User-Agent": "SEO-Analyzer-Webhook/1.0",
      },
      body: payloadString,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    const responseText = await response.text()

    return {
      success: response.ok,
      statusCode: response.status,
      response: responseText.substring(0, 1000), // Limit response storage
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to deliver webhook",
    }
  }
}

/**
 * Trigger webhook for an event
 */
export async function triggerWebhook(
  event: WebhookEvent,
  data: any,
  options?: {
    userId?: string
    projectId?: string
  }
) {
  try {
    // Find all webhooks that should receive this event
    const where: any = {
      isActive: true,
      events: {
        has: event,
      },
    }

    if (options?.userId) {
      where.userId = options.userId
    }

    if (options?.projectId) {
      where.OR = [
        { projectId: options.projectId },
        { projectId: null }, // Global webhooks
      ]
    }

    const webhooks = await prisma.webhook.findMany({
      where,
    })

    if (webhooks.length === 0) {
      return // No webhooks to trigger
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    }

    // Deliver to all webhooks (in parallel)
    const deliveries = await Promise.all(
      webhooks.map(async (webhook) => {
        const result = await deliverWebhook(
          webhook.id,
          webhook.url,
          webhook.secret,
          payload
        )

        // Log delivery
        await prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            event,
            payload: payload as any, // Cast to satisfy Prisma Json type
            statusCode: result.statusCode,
            response: result.response,
            error: result.error,
            attempts: 1,
            deliveredAt: result.success ? new Date() : null,
          },
        })

        // Update webhook stats
        if (result.success) {
          await prisma.webhook.update({
            where: { id: webhook.id },
            data: {
              lastTriggeredAt: new Date(),
              failureCount: 0,
            },
          })
        } else {
          // Increment failure count
          const updatedWebhook = await prisma.webhook.update({
            where: { id: webhook.id },
            data: {
              failureCount: { increment: 1 },
            },
          })

          // Disable webhook after 10 consecutive failures
          if (updatedWebhook.failureCount >= 10) {
            await prisma.webhook.update({
              where: { id: webhook.id },
              data: { isActive: false },
            })
          }
        }

        return result
      })
    )

    return {
      triggered: webhooks.length,
      successful: deliveries.filter((d) => d.success).length,
      failed: deliveries.filter((d) => !d.success).length,
    }
  } catch (error) {
    console.error("Error triggering webhooks:", error)
    return null
  }
}

/**
 * Retry failed webhook delivery
 */
export async function retryWebhookDelivery(deliveryId: string) {
  try {
    const delivery = await prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: {
        webhook: true,
      },
    })

    if (!delivery || delivery.deliveredAt) {
      return { success: false, error: "Delivery not found or already delivered" }
    }

    if (delivery.attempts >= 5) {
      return { success: false, error: "Maximum retry attempts exceeded" }
    }

    const result = await deliverWebhook(
      delivery.webhook.id,
      delivery.webhook.url,
      delivery.webhook.secret,
      delivery.payload as unknown as WebhookPayload
    )

    // Update delivery record
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        attempts: { increment: 1 },
        statusCode: result.statusCode,
        response: result.response,
        error: result.error,
        deliveredAt: result.success ? new Date() : null,
      },
    })

    return result
  } catch (error: any) {
    console.error("Error retrying webhook delivery:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Verify webhook signature (for receiving webhooks from external services)
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * Available webhook events with descriptions
 */
export const WEBHOOK_EVENTS = {
  analysis_completed: "Triggered when an SEO analysis completes successfully",
  analysis_failed: "Triggered when an SEO analysis fails",
  rank_changed: "Triggered when a keyword ranking changes significantly",
  issue_detected: "Triggered when a new SEO issue is detected",
  issue_resolved: "Triggered when an SEO issue is marked as resolved",
  monitoring_triggered: "Triggered when scheduled monitoring runs",
  project_created: "Triggered when a new project is created",
  project_updated: "Triggered when a project is updated",
} as const

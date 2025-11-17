"use client"

import { Code, Key, Webhook, Book, ExternalLink } from "lucide-react"
import Link from "next/link"

export const dynamic = \'force-dynamic\'

export default function DevelopersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Code className="h-8 w-8 text-purple-600" />
          Developer Portal
        </h1>
        <p className="text-gray-600 mt-2">
          Integrate SEO Analyzer into your workflow with our API
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/dashboard/api-keys"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all"
        >
          <Key className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">API Keys</h3>
          <p className="text-sm text-gray-600">
            Generate and manage your API keys for authentication
          </p>
        </Link>

        <Link
          href="/dashboard/webhooks"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all"
        >
          <Webhook className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Webhooks</h3>
          <p className="text-sm text-gray-600">
            Receive real-time notifications about events
          </p>
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Book className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
          <p className="text-sm text-gray-600">
            Learn how to integrate with our API
          </p>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              1. Generate an API Key
            </h3>
            <p className="text-gray-600 mb-2">
              Create an API key from the{" "}
              <Link href="/dashboard/api-keys" className="text-purple-600 hover:underline">
                API Keys page
              </Link>
              . Keep it secure - you won't be able to see it again.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              2. Make Your First Request
            </h3>
            <p className="text-gray-600 mb-3">
              All API requests require authentication using your API key in the
              Authorization header:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`curl https://api.yoursite.com/v1/projects \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY"`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">3. Handle Responses</h3>
            <p className="text-gray-600 mb-3">
              All responses are returned in JSON format with a timestamp:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "projects": [...],
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  },
  "timestamp": "2024-01-15T10:30:00Z"
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">API Reference</h2>

        <div className="space-y-6">
          {/* Projects */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Projects</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-mono rounded">
                    GET
                  </span>
                  <code className="text-sm text-gray-700">/v1/projects</code>
                </div>
                <p className="text-sm text-gray-600">List all projects</p>
                <p className="text-xs text-gray-500 mt-1">
                  Query params: limit, offset
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-mono rounded">
                    GET
                  </span>
                  <code className="text-sm text-gray-700">/v1/projects/:id</code>
                </div>
                <p className="text-sm text-gray-600">Get a specific project</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded">
                    POST
                  </span>
                  <code className="text-sm text-gray-700">/v1/projects</code>
                </div>
                <p className="text-sm text-gray-600">Create a new project</p>
                <pre className="text-xs bg-gray-50 p-2 rounded mt-2 text-gray-700">
{`{
  "name": "My Website",
  "domain": "example.com",
  "description": "Main website"
}`}
                </pre>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-mono rounded">
                    PATCH
                  </span>
                  <code className="text-sm text-gray-700">/v1/projects/:id</code>
                </div>
                <p className="text-sm text-gray-600">Update a project</p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-mono rounded">
                    DELETE
                  </span>
                  <code className="text-sm text-gray-700">/v1/projects/:id</code>
                </div>
                <p className="text-sm text-gray-600">Delete a project</p>
              </div>
            </div>
          </div>

          {/* Analyses */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Analyses</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-mono rounded">
                    GET
                  </span>
                  <code className="text-sm text-gray-700">/v1/analyses</code>
                </div>
                <p className="text-sm text-gray-600">List all analyses</p>
                <p className="text-xs text-gray-500 mt-1">
                  Query params: limit, offset, projectId, type
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded">
                    POST
                  </span>
                  <code className="text-sm text-gray-700">/v1/analyses</code>
                </div>
                <p className="text-sm text-gray-600">Trigger a new analysis</p>
                <pre className="text-xs bg-gray-50 p-2 rounded mt-2 text-gray-700">
{`{
  "url": "https://example.com",
  "projectId": "project_123",
  "type": "page"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limits */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limits</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-2 pr-4 font-semibold text-gray-900">Plan</th>
                <th className="pb-2 pr-4 font-semibold text-gray-900">Requests</th>
                <th className="pb-2 font-semibold text-gray-900">Window</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-700">Free</td>
                <td className="py-2 pr-4 text-gray-700">100 requests</td>
                <td className="py-2 text-gray-700">per hour</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-700">Pro</td>
                <td className="py-2 pr-4 text-gray-700">1,000 requests</td>
                <td className="py-2 text-gray-700">per hour</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-gray-700">Agency</td>
                <td className="py-2 pr-4 text-gray-700">10,000 requests</td>
                <td className="py-2 text-gray-700">per hour</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          When rate limit is exceeded, you'll receive a 429 status code.
        </p>
      </div>

      {/* Webhook Events */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Webhook Events</h2>
        <p className="text-gray-600 mb-4">
          Subscribe to these events to receive real-time notifications:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { event: "analysis_completed", desc: "Analysis finished successfully" },
            { event: "analysis_failed", desc: "Analysis encountered an error" },
            { event: "rank_changed", desc: "Keyword ranking changed significantly" },
            { event: "issue_detected", desc: "New SEO issue found" },
            { event: "issue_resolved", desc: "SEO issue marked as resolved" },
            { event: "monitoring_triggered", desc: "Scheduled monitoring ran" },
            { event: "project_created", desc: "New project created" },
            { event: "project_updated", desc: "Project settings updated" },
          ].map((item) => (
            <div
              key={item.event}
              className="border border-gray-200 rounded-lg p-3"
            >
              <code className="text-sm font-mono text-purple-600">
                {item.event}
              </code>
              <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            Verifying Webhook Signatures
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Each webhook request includes an X-Webhook-Signature header containing a
            HMAC SHA256 signature:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}

import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { Mail, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 mb-12">
          Have questions? We're here to help. Reach out to our team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Email Support */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Support</h2>
            <p className="text-gray-600 mb-4">
              Get help with technical issues, billing, or general inquiries.
            </p>
            <a
              href="mailto:support@seoanalyzerpro.com"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              support@seoanalyzerpro.com
            </a>
          </div>

          {/* General Inquiries */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">General Inquiries</h2>
            <p className="text-gray-600 mb-4">
              Questions about our platform, features, or partnerships?
            </p>
            <a
              href="mailto:info@seoanalyzerpro.com"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              info@seoanalyzerpro.com
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How long does it take to get a response?
              </h3>
              <p className="text-gray-700">
                We typically respond to all inquiries within 24 hours during business days.
                For urgent issues, please mark your email as "Urgent" in the subject line.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer phone support?
              </h3>
              <p className="text-gray-700">
                Currently, we provide support via email. Agency plan subscribers have access to
                priority support with faster response times.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I schedule a demo?
              </h3>
              <p className="text-gray-700">
                Yes! For Agency tier inquiries, email us at sales@seoanalyzerpro.com to schedule
                a personalized demo of our platform.
              </p>
            </div>

            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Where can I find documentation?
              </h3>
              <p className="text-gray-700">
                Our comprehensive documentation is available in the dashboard after you sign up.
                You can also access basic guides on our{' '}
                <a href="/docs" className="text-primary-600 hover:underline">
                  documentation page
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}

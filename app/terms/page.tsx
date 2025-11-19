import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700">
              By accessing and using SEO Analyzer Pro, you accept and agree to be bound by the terms and provision of this agreement.
              If you do not agree to these Terms of Service, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily access and use SEO Analyzer Pro for personal and commercial purposes.
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose without proper subscription</li>
              <li>Attempt to decompile or reverse engineer any software contained on our website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Terms</h2>
            <p className="text-gray-700 mb-4">When creating an account with us, you must:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide accurate, complete, and current information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and accept all risks of unauthorized access</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Not use the service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment and Billing</h2>
            <p className="text-gray-700 mb-4">
              Paid subscriptions are available on monthly or annual basis. By purchasing a subscription, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide current, complete, and accurate purchase and account information</li>
              <li>Update information to keep your account and payment information current and complete</li>
              <li>Pay all charges at the prices in effect when the charges are incurred</li>
              <li>Pay applicable taxes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cancellation and Refunds</h2>
            <p className="text-gray-700">
              You may cancel your subscription at any time through your account settings. Upon cancellation,
              you will retain access to paid features until the end of your current billing period.
              Refunds are provided on a case-by-case basis within 14 days of purchase.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Service Limitations</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Modify or discontinue the service with or without notice</li>
              <li>Refuse service to anyone for any reason at any time</li>
              <li>Limit the number of requests you can make within a given time period</li>
              <li>Suspend or terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimer</h2>
            <p className="text-gray-700">
              The service is provided "as is" without any warranties, expressed or implied. We do not warrant that
              the service will be uninterrupted, secure, or error-free. Your use of the service is at your sole risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700">
              In no event shall SEO Analyzer Pro be liable for any indirect, incidental, special, consequential or
              punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. We will notify users of any material changes
              via email or through the service. Your continued use of the service after such modifications constitutes
              your acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="text-gray-700">
              For questions about these Terms of Service, please contact us at:{' '}
              <a href="mailto:support@seoanalyzerpro.com" className="text-primary-600 hover:underline">
                support@seoanalyzerpro.com
              </a>
            </p>
          </section>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}

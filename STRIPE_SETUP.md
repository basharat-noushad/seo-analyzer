# Stripe Payment Integration Setup Guide

Complete guide for setting up Stripe payment processing for the SEO Analyzer platform.

## 📋 Prerequisites

- Stripe account (sign up at https://stripe.com)
- Access to Stripe Dashboard
- Environment variables configured

## 🚀 Quick Setup (5 Steps)

### Step 1: Create Stripe Account & Get API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)
4. Add to your `.env.local`:

```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Step 2: Create Subscription Products & Prices

1. Go to https://dashboard.stripe.com/products
2. Click **"+ Add product"**

**Create Pro Plan:**
- **Name:** Professional Plan
- **Description:** Perfect for professionals and small businesses
- **Pricing:**
  - Type: Recurring
  - Price: $49.00 USD
  - Billing period: Monthly
- Click **Save product**
- Copy the **Price ID** (starts with `price_...`)

**Create Agency Plan:**
- **Name:** Agency Plan
- **Description:** For agencies and large organizations
- **Pricing:**
  - Type: Recurring
  - Price: $199.00 USD
  - Billing period: Monthly
- Click **Save product**
- Copy the **Price ID** (starts with `price_...`)

3. Add Price IDs to `.env.local`:

```env
STRIPE_PRICE_PRO_MONTHLY="price_..."
STRIPE_PRICE_AGENCY_MONTHLY="price_..."
```

### Step 3: Set Up Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. **Endpoint URL:** `https://yourdomain.com/api/stripe/webhook`
   - For local testing: Use ngrok or Stripe CLI (see below)
4. **Events to send:** Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Step 4: Configure Customer Portal

1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Configure these settings:
   - **Subscription cancellation:** Allow customers to cancel subscriptions
   - **Subscription pausing:** Optional
   - **Invoice history:** Show invoice history
   - **Payment method update:** Allow customers to update payment methods
3. Click **Save changes**

### Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/dashboard/billing`
3. Click **"Upgrade to Pro"** or **"Upgrade to Agency"**
4. Use Stripe test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete checkout
6. Verify subscription appears in your Stripe Dashboard

---

## 🧪 Local Development Setup

For local development, you need to forward webhooks to your localhost.

### Option 1: Stripe CLI (Recommended)

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe

   # Linux
   wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
   tar -xvf stripe_linux_amd64.tar.gz
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to localhost:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. The CLI will output a webhook signing secret:
   ```
   > Ready! Your webhook signing secret is whsec_... (^C to quit)
   ```

5. Add this to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

6. Keep the CLI running while testing

### Option 2: ngrok

1. Install ngrok: https://ngrok.com/download
2. Start ngrok:
   ```bash
   ngrok http 3000
   ```
3. Use the HTTPS URL (e.g., `https://abc123.ngrok.io`) as your webhook endpoint in Stripe Dashboard
4. Update `.env.local`:
   ```env
   NEXTAUTH_URL="https://abc123.ngrok.io"
   NEXT_PUBLIC_APP_URL="https://abc123.ngrok.io"
   ```

---

## 🔒 Production Deployment

### Environment Variables

Set these in your production environment (Vercel, Railway, etc.):

```env
# Stripe API Keys (use LIVE keys for production!)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Stripe Price IDs (from production products)
STRIPE_PRICE_PRO_MONTHLY="price_..."
STRIPE_PRICE_AGENCY_MONTHLY="price_..."

# Stripe Webhook Secret (from production webhook)
STRIPE_WEBHOOK_SECRET="whsec_..."

# App URLs
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Webhook Configuration

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select the same events as in Step 3
4. Copy the signing secret and add to production environment

### Switch to Live Mode

1. In Stripe Dashboard, toggle from **Test mode** to **Live mode** (top right)
2. Create new products and prices for live mode
3. Update environment variables with live keys
4. Test with real payment methods (small amounts first!)

---

## 🧪 Testing Guide

### Test Cards

Stripe provides test cards for different scenarios:

| Scenario | Card Number | Behavior |
|----------|-------------|----------|
| Successful payment | 4242 4242 4242 4242 | Payment succeeds |
| Payment requires authentication | 4000 0025 0000 3155 | 3D Secure required |
| Card declined | 4000 0000 0000 9995 | Generic decline |
| Insufficient funds | 4000 0000 0000 9995 | Card declined |
| Expired card | 4000 0000 0000 0069 | Expired card |

### Test Scenarios

**1. Successful Subscription:**
```bash
# 1. Click "Upgrade to Pro"
# 2. Use card 4242 4242 4242 4242
# 3. Complete checkout
# 4. Verify in Stripe Dashboard → Customers
# 5. Verify user.tier updated to "pro" in database
```

**2. Subscription Update:**
```bash
# 1. Subscribe to Pro plan
# 2. Click "Manage Subscription"
# 3. In Customer Portal, click "Update payment method"
# 4. Add new card
# 5. Verify in Stripe Dashboard
```

**3. Subscription Cancellation:**
```bash
# 1. Subscribe to Pro plan
# 2. Click "Cancel Subscription"
# 3. Confirm cancellation
# 4. Verify subscription.cancel_at_period_end = true
# 5. Verify user still has access until period end
```

**4. Failed Payment:**
```bash
# Use Stripe CLI to simulate:
stripe trigger invoice.payment_failed
# Verify user.subscriptionStatus → "past_due"
```

**5. Webhook Events:**
```bash
# Monitor webhook events:
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger specific events:
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
```

---

## 📊 Monitoring & Debugging

### Check Webhook Deliveries

1. Go to https://dashboard.stripe.com/webhooks
2. Click your webhook endpoint
3. View **Recent deliveries**
4. Check for failures and retry

### View Application Logs

```bash
# Development
npm run dev

# Check console for:
# - "Received Stripe webhook event: ..."
# - "Processing checkout.session.completed ..."
# - "User XYZ subscription activated: ..."
```

### Database Verification

```sql
-- Check user subscription status
SELECT id, email, tier, subscription_status, subscription_ends_at, stripe_customer_id
FROM users
WHERE stripe_customer_id IS NOT NULL;

-- Check usage logs
SELECT * FROM usage_logs
WHERE user_id = 'user-id-here'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔧 Troubleshooting

### "No Stripe version detected" Error

**Solution:** Make sure Stripe is installed:
```bash
npm install stripe
```

### Webhook signature verification failed

**Causes:**
- Incorrect `STRIPE_WEBHOOK_SECRET`
- Using test secret in production (or vice versa)
- Multiple webhook endpoints with different secrets

**Solution:**
1. Go to Stripe Dashboard → Webhooks
2. Find your endpoint
3. Click "Reveal" on the Signing secret
4. Update `STRIPE_WEBHOOK_SECRET` in environment variables
5. Restart your application

### Checkout session not completing

**Check:**
1. `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` are correct
2. Success/cancel URLs are accessible
3. Stripe webhook is receiving events
4. No console errors during checkout

### User tier not updating after payment

**Check:**
1. Webhook is configured correctly
2. Webhook secret is correct
3. Check webhook delivery logs in Stripe Dashboard
4. Verify `checkout.session.completed` event is enabled
5. Check application logs for errors

### Customer Portal not working

**Solution:**
1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Ensure portal is activated
3. Save configuration
4. Verify user has `stripeCustomerId` in database

---

## 💡 Best Practices

### Security

- ✅ **Never commit Stripe keys** to version control
- ✅ Use environment variables for all secrets
- ✅ Verify webhook signatures (already implemented)
- ✅ Use HTTPS in production (required by Stripe)
- ✅ Implement CSRF protection (already using NextAuth)

### Error Handling

- ✅ Log all Stripe errors
- ✅ Show user-friendly error messages
- ✅ Implement retry logic for failed webhooks
- ✅ Monitor webhook delivery failures
- ✅ Set up alerts for payment failures

### User Experience

- ✅ Show clear pricing information
- ✅ Explain what happens after subscription
- ✅ Send confirmation emails (TODO: implement Resend)
- ✅ Allow easy subscription management
- ✅ Provide access until period end after cancellation

### Testing

- ✅ Test all payment scenarios before launch
- ✅ Use test mode extensively
- ✅ Verify webhook events
- ✅ Test on different devices/browsers
- ✅ Simulate failures and edge cases

---

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)

---

## ✅ Implementation Checklist

- [ ] Create Stripe account
- [ ] Add API keys to environment variables
- [ ] Create Pro and Agency products in Stripe
- [ ] Add Price IDs to environment variables
- [ ] Set up webhook endpoint
- [ ] Add webhook secret to environment variables
- [ ] Configure Customer Portal settings
- [ ] Test subscription flow with test cards
- [ ] Test subscription management (update/cancel)
- [ ] Test webhook events
- [ ] Verify database updates
- [ ] Switch to live mode for production
- [ ] Update environment variables with live keys
- [ ] Create production products and prices
- [ ] Set up production webhook endpoint
- [ ] Test with real payment (small amount)
- [ ] Monitor webhook deliveries
- [ ] Set up error monitoring (Sentry recommended)
- [ ] Implement email notifications (Resend - Phase 2)

---

## 🎉 You're All Set!

Your Stripe integration is now complete! Users can:

- ✅ Upgrade from Free → Pro → Agency
- ✅ Manage subscriptions via Customer Portal
- ✅ Cancel subscriptions (access until period end)
- ✅ Reactivate canceled subscriptions
- ✅ View billing history and invoices
- ✅ Update payment methods

**Next Steps:**
1. Complete email integration (Resend) for payment notifications
2. Set up Redis for production-ready rate limiting
3. Implement background jobs (Inngest) for monitoring
4. Add analytics tracking for conversion optimization

**Questions?** Check the troubleshooting section or consult Stripe documentation.

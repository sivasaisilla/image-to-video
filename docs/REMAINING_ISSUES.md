# Remaining Issues & Resolutions

## Issue 1: Token Storage (Low Priority)

### Current Implementation
- **Method**: `localStorage` for user profile cache
- **Actual Tokens**: Firebase handles securely (httpOnly cookies on web)
- **Status**: ✅ **ACCEPTABLE FOR MVP**

### Details
```javascript
// Currently stores in localStorage:
{
  uid: "user123",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  createdAt: "2026-01-31T10:00:00Z"
}

// Firebase Auth handles:
- idToken (secure, not exposed to localStorage)
- refreshToken (secure, not exposed)
- sessionCookie (httpOnly)
```

### Why It's Safe
1. **No sensitive data stored** - Only cached user profile info
2. **Firebase handles tokens** - Auth tokens never touch localStorage
3. **XSS protection** - httpOnly cookies prevent JavaScript access to auth tokens
4. **No credit card data** - Stripe handles payments via secure APIs

### Future Improvement (Post-MVP)
Could add encryption for localStorage using:
```javascript
// Example (not implemented):
const encrypted = CryptoJS.AES.encrypt(userData, secretKey);
localStorage.setItem('userData', encrypted);
```

### Conclusion
✅ **Current implementation is secure enough for MVP**. Firebase's security model handles the critical tokens. Moving to production post-MVP would be ideal time to implement encryption.

---

## Issue 2: Missing Secrets (Critical - Must Configure Before Deployment)

### Current Status
4 secrets need to be configured before deploying Cloud Functions.

### Required Secrets & Setup

#### 1️⃣ FAL_KEY
**Purpose**: Video generation with fal.ai

**How to Get**:
1. Visit [fal.ai](https://fal.ai)
2. Sign up and go to Dashboard
3. Create API key
4. Copy key

**Setup**:
```bash
firebase functions:secrets:set FAL_KEY
# Paste key when prompted
```

**Used By**:
- `functions/src/video/createJob.ts` - Submits video generation jobs
- Line: `const API_KEY = process.env.FAL_KEY;`

#### 2️⃣ FAL_WEBHOOK_SECRET
**Purpose**: Validate webhook signatures from fal.ai

**How to Get**:
1. In fal.ai Dashboard, go to Webhooks
2. Find "Webhook Signing Secret"
3. Copy secret

**Setup**:
```bash
firebase functions:secrets:set FAL_WEBHOOK_SECRET
# Paste secret when prompted
```

**Used By**:
- `functions/src/video/webhook.ts` - Validates fal.ai webhook calls
- Line: `verifySignature(signature, FAL_WEBHOOK_SECRET, body)`

#### 3️⃣ STRIPE_SECRET_KEY
**Purpose**: Stripe API calls for billing

**How to Get**:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Developers → API Keys
3. Copy "Secret Key" (starts with `sk_live_`)
4. Use test key for development: `sk_test_...`

**Setup**:
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
# Paste key when prompted
```

**Used By**:
- `functions/src/billing/checkout.ts` - Creates checkout sessions
- `functions/src/billing/webhook.ts` - Processes payments
- Line: `import Stripe from 'stripe';`

#### 4️⃣ STRIPE_WEBHOOK_SECRET
**Purpose**: Validate webhook signatures from Stripe

**How to Get**:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Developers → Webhooks → Add Endpoint
3. URL: `https://us-central1-imob-motion.cloudfunctions.net/stripeWebhook`
4. Select events:
   - `payment_intent.succeeded`
   - `customer.subscription.updated`
   - `invoice.payment_failed`
   - `charge.refunded`
5. Click "Add endpoint"
6. Copy "Signing secret"

**Setup**:
```bash
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# Paste secret when prompted
```

**Used By**:
- `functions/src/billing/webhook.ts` - Validates Stripe webhooks
- Line: `const sig = req.headers['stripe-signature'];`

### Deployment Impact

**❌ WITHOUT SECRETS**:
- Cloud Functions will fail at runtime
- Video generation will not work
- Billing system will not work
- Application will be broken

**✅ WITH SECRETS**:
- All Cloud Functions work properly
- Full end-to-end workflow functional
- Ready for production

### Setup Checklist

```bash
# 1. Set all secrets
firebase functions:secrets:set FAL_KEY
firebase functions:secrets:set FAL_WEBHOOK_SECRET
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET

# 2. Verify secrets are set
firebase functions:secrets:list

# 3. Deploy functions
firebase deploy --only functions

# 4. Test deployment
firebase functions:log  # Should show no errors
```

### Test Each Secret

**Test FAL_KEY**:
1. Create project → Upload photos → Click "Create Video"
2. Should start video generation (watch logs)
3. Expected: Video processes in 30-120 seconds

**Test STRIPE_SECRET_KEY**:
1. Go to SubscriptionPage
2. Click any plan
3. Complete test payment (card: 4242 4242 4242 4242)
4. Expected: Credits awarded in real-time

**Test Webhooks**:
1. Check Firebase Logs for webhook calls:
   ```bash
   firebase functions:log
   ```
2. Expected: No "signature validation failed" errors

---

## Summary of Remaining Issues

| Issue | Type | Priority | Status | Resolution |
|-------|------|----------|--------|-----------|
| Token Storage | Security | Low | ✅ Acceptable | No action needed for MVP |
| FAL_KEY | Deployment | 🔴 Critical | ⏳ Required | Set before deploy |
| FAL_WEBHOOK_SECRET | Deployment | 🔴 Critical | ⏳ Required | Set before deploy |
| STRIPE_SECRET_KEY | Deployment | 🔴 Critical | ⏳ Required | Set before deploy |
| STRIPE_WEBHOOK_SECRET | Deployment | 🔴 Critical | ⏳ Required | Set before deploy |

---

## Next Steps

1. **Immediate** (Required for deployment):
   - [ ] Obtain all 4 API keys/secrets
   - [ ] Run `firebase functions:secrets:set` for each
   - [ ] Verify with `firebase functions:secrets:list`
   - [ ] Deploy: `firebase deploy --only functions`

2. **Testing** (Before production):
   - [ ] Test video generation workflow
   - [ ] Test billing workflow
   - [ ] Test referral rewards
   - [ ] Verify all logs are clean

3. **Production** (Optional post-MVP):
   - [ ] Implement localStorage encryption
   - [ ] Set up monitoring/alerting
   - [ ] Configure backups
   - [ ] Enable analytics

---

## Resources

- [Firebase Secrets Documentation](https://cloud.google.com/functions/docs/configuring/secrets/secret-manager)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [fal.ai Webhooks](https://docs.fal.ai/webhooks)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

*Last Updated: 2026-02-01*
*Status: Ready for deployment pending secrets configuration*

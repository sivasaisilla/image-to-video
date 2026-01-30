# Implementation Status: Current vs Required

---

## Executive Summary

| Category | Implemented | Required | Gap |
|----------|-------------|----------|-----|
| Auth & User | 70% | 100% | 2FA, session management |
| Project Wizard | 20% | 100% | Steps 2-5 are UI only |
| Video Generation | 0% | 100% | No fal.ai integration |
| Billing & Credits | 0% | 100% | No Stripe integration |
| Referral System | 0% | 100% | UI mockup only |
| Settings | 30% | 100% | Missing most features |

---

## Detailed Breakdown

### Phase 0 — Infrastructure & Security

| Requirement | Status | Notes |
|-------------|--------|-------|
| Firebase project | ✅ Done | Config exists in `src/config/firebase.ts` |
| Firebase Auth enabled | ✅ Done | Working |
| Firestore enabled | ✅ Done | Used for users, OTPs |
| Firebase Storage enabled | ⚠️ Partial | Config exists, not fully utilized |
| Cloud Functions | ❌ Missing | Using Express server instead |
| Firestore security rules | ❌ Missing | No `firestore.rules` file |
| Storage rules | ❌ Missing | No `storage.rules` file |
| Secret Manager | ❌ Missing | Keys in `.env` files |
| FAL_KEY secret | ❌ Missing | No fal.ai integration |
| STRIPE secrets | ❌ Missing | No Stripe integration |

---

### Phase 1 — Authentication & User Bootstrap

| Requirement | Status | Notes |
|-------------|--------|-------|
| Email/password auth | ✅ Done | `firebaseAuth.ts` |
| Google OAuth | ✅ Done | Implemented |
| Apple OAuth | ✅ Done | Implemented |
| Auth guards/protected routes | ⚠️ Partial | Basic check, no proper guards |
| onAuthCreate Cloud Function | ❌ Missing | User doc created client-side |
| User document structure | ⚠️ Partial | Missing: stats, settings, credits, referral |
| Referral code generation | ❌ Missing | Mock only in UI |

**Current User Document:**
```json
{
  "uid": "",
  "email": "",
  "createdAt": "",
  "lastLoginAt": "",
  "emailVerified": false,
  "isActive": true
}
```

**Required User Document:**
```json
{
  "email": "",
  "displayName": "",
  "createdAt": "",
  "stats": { "videosCreated": 0, "photosUploaded": 0, "totalVideoSeconds": 0 },
  "settings": { "notifications": {}, "video": {} },
  "subscription": { "planId": "", "status": "", "stripeCustomerId": "" },
  "credits": { "availableSeconds": 0, "usedSeconds": 0 },
  "referral": { "code": "", "totalReferrals": 0 }
}
```

---

### Phase 2 — Project Lifecycle

| Requirement | Status | Notes |
|-------------|--------|-------|
| createProject | ⚠️ Partial | Uploads work, no project doc |
| updateProject | ❌ Missing | - |
| deleteProject | ✅ Done | Working in ProjectsPage |
| Ownership enforcement | ❌ Missing | No security rules |
| Projects list with filters | ✅ Done | Working |
| Realtime updates | ❌ Missing | Uses polling/manual refresh |

**Current:** Projects fetched from custom Express API (`localhost:3003` / `localhost:5000`)

**Required:** Projects in Firestore `projects/{projectId}` with realtime listeners

---

### Phase 3 — Asset Uploads

| Requirement | Status | Notes |
|-------------|--------|-------|
| Photo upload (drag/drop) | ✅ Done | Working in DashboardPage |
| Photo upload (browse) | ✅ Done | Working |
| Store in Firebase Storage | ⚠️ Partial | Uploads to custom backend |
| Photo ordering | ❌ Missing | UI exists, no persistence |
| Thumbnail generation | ❌ Missing | - |
| Google Drive import | ❌ Missing | UI mockup only |
| Dropbox import | ❌ Missing | UI mockup only |
| URL import | ❌ Missing | Simulated with setTimeout |
| Logo upload & reuse | ❌ Missing | Local state only |

---

### Phase 4 — Video Generation Pipeline

| Requirement | Status | Notes |
|-------------|--------|-------|
| Firestore jobs collection | ❌ Missing | - |
| createVideoJob function | ❌ Missing | No fal.ai integration |
| fal.ai Queue API integration | ❌ Missing | - |
| falWebhook handler | ❌ Missing | - |
| Signed URL generation | ❌ Missing | - |
| Video processing status | ❌ Missing | Mocked with 3s timeout |
| Error handling | ❌ Missing | - |

**Current:** Video creation is a UI simulation (3-second setTimeout)

**Required:** Full pipeline with fal.ai `fal-ai/kling-video/v2.5-turbo/pro/image-to-video`

---

### Phase 5 — Playback

| Requirement | Status | Notes |
|-------------|--------|-------|
| Signed video URL generation | ❌ Missing | - |
| Video player component | ⚠️ Partial | Basic player exists |
| URL expiry handling | ❌ Missing | - |

---

### Phase 6 — Billing & Credits

| Requirement | Status | Notes |
|-------------|--------|-------|
| Plans configuration | ❌ Missing | Firestore `plans` collection needed |
| Stripe Checkout | ❌ Missing | - |
| Stripe webhooks | ❌ Missing | - |
| Credit ledger | ❌ Missing | - |
| Free credit toggle | ❌ Missing | UI exists, no logic |
| Payment status tracking | ❌ Missing | - |

**Current:** SubscriptionPage has 3 plans displayed but no payment flow

**Required:** Full Stripe integration with webhooks and credit system

---

### Phase 7 — Create Wizard

| Requirement | Status | Notes |
|-------------|--------|-------|
| Step 1: Photos | ✅ Done | Upload works |
| Step 2: Branding | ❌ Missing | UI only, no persistence |
| Step 3: Music | ❌ Missing | 15 mock songs, no backend |
| Step 4: Address | ❌ Missing | Mock autocomplete, no Google Maps |
| Step 5: Summary | ❌ Missing | UI only |
| Cost calculation | ❌ Missing | - |
| Music catalog | ❌ Missing | Need Firestore collection |
| Google Maps Places | ❌ Missing | API not integrated |

---

### Phase 8 — Referral Program

| Requirement | Status | Notes |
|-------------|--------|-------|
| Referral code generation | ❌ Missing | Random client-side code |
| Apply referral at signup | ❌ Missing | - |
| Referral state tracking | ❌ Missing | - |
| Credit reward on payment | ❌ Missing | - |
| Earnings history | ❌ Missing | Mock data only |

**Current:** ReferralPage shows mock data (Sarah, Michael, Emma)

**Required:** Full referral system with Firestore `referrals` collection

---

### Phase 9 — Settings & Account

| Requirement | Status | Notes |
|-------------|--------|-------|
| Profile edit | ✅ Done | Working |
| Email update | ⚠️ Partial | Editable but may not sync to Auth |
| Password update | ❌ Missing | - |
| Notification preferences | ❌ Missing | - |
| Video defaults | ❌ Missing | - |
| Storage usage | ❌ Missing | - |
| Session revoke | ❌ Missing | - |
| 2FA | ❌ Missing | - |
| Data export | ❌ Missing | - |
| Account deletion | ❌ Missing | - |

---

## Architecture Issues

### Current Problems

1. **Multiple API Endpoints**
   - `localhost:3003` - Auth, some content
   - `localhost:5000` - Content manager, location
   - Should be unified Firebase Cloud Functions

2. **Server-Side Code in Frontend**
   - `emailService.ts` uses `nodemailer` (Node.js only)
   - Won't work in browser

3. **No Security Rules**
   - Missing `firestore.rules`
   - Missing `storage.rules`
   - Data not protected

4. **Token Storage**
   - Uses `localStorage` (XSS vulnerable)
   - Should use HTTP-only cookies or Firebase Auth tokens

5. **No Cloud Functions**
   - Running separate Express servers
   - Should use Firebase Cloud Functions

---

## What Needs To Be Built

### Backend (Cloud Functions)

```
functions/
├── auth/
│   └── onUserCreate.ts       # Create user doc with full schema
├── projects/
│   └── createVideoJob.ts     # Submit to fal.ai
├── webhooks/
│   ├── falWebhook.ts         # Receive fal.ai callback
│   └── stripeWebhook.ts      # Handle payments
├── billing/
│   └── createCheckout.ts     # Stripe checkout session
└── referrals/
    └── applyReferral.ts      # Apply referral code
```

### Firestore Collections

| Collection | Status |
|------------|--------|
| `users/{uid}` | ⚠️ Needs schema update |
| `projects/{projectId}` | ❌ Create |
| `projects/{projectId}/photos/{photoId}` | ❌ Create |
| `jobs/{jobId}` | ❌ Create |
| `assets/{assetId}` | ❌ Create |
| `plans/{planId}` | ❌ Create |
| `credit_ledger/{entryId}` | ❌ Create |
| `referrals/{referralId}` | ❌ Create |
| `payments/{paymentId}` | ❌ Create |

### Frontend Updates

| Component | Change Needed |
|-----------|---------------|
| DashboardPage | Wire steps 2-5 to Firestore |
| ProjectsPage | Switch to Firestore realtime |
| ReferralPage | Connect to backend |
| SubscriptionPage | Add Stripe Checkout |
| SettingsPage | Add missing features |
| ForgotPasswordPage | Implement password reset |

---

## Priority Order

### P0 - Critical (MVP)
1. Set up Cloud Functions structure
2. Create Firestore security rules
3. Implement video generation pipeline (fal.ai)
4. Wire project wizard to Firestore

### P1 - Important
5. Stripe billing integration
6. Credit system
7. Realtime project status updates

### P2 - Nice to Have
8. Referral program
9. Google Drive / Dropbox import
10. Advanced settings (2FA, sessions)

---

## Estimated Effort

| Area | Effort |
|------|--------|
| Cloud Functions setup | Medium |
| fal.ai integration | High |
| Stripe integration | High |
| Firestore migration | Medium |
| Security rules | Low |
| Frontend wiring | Medium |
| Referral system | Medium |
| Settings features | Low |

---

*Generated: 2026-01-29*

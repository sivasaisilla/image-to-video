# Implementation Status: Current vs Required

---

## Executive Summary

| Category | Implemented | Required | Gap |
|----------|-------------|----------|-----|
| Auth & User | 85% | 100% | 2FA, session management |
| Project Wizard | 20% | 100% | Steps 2-5 are UI only |
| Video Generation | 10% | 100% | Cloud Function created, fal.ai pending |
| Billing & Credits | 0% | 100% | No Stripe integration |
| Referral System | 30% | 100% | Backend logic in place, UI needs wiring |
| Settings | 30% | 100% | Missing most features |
| Routing | 100% | 100% | ✅ React Router implemented |

---

## Recent Updates (2026-01-30)

### ✅ Completed

1. **React Router Integration**
   - Added `react-router-dom` for proper URL-based navigation
   - Created route configuration in `src/router.tsx`
   - All pages now have proper URLs (`/login`, `/signup`, `/dashboard`, `/projects`, `/profile`, `/settings`, `/plans`, `/referral`)
   - Browser back/forward buttons work correctly
   - Bookmarkable URLs supported
   - Protected routes with auth guards (`AppLayout`)
   - Auth redirect for logged-in users (`AuthLayout`)

2. **Firebase Cloud Functions Setup**
   - Created `functions/` directory with TypeScript configuration
   - Deployed `onUserCreate` auth trigger to Firebase
   - User documents now created automatically on signup with full schema
   - Uses named Firestore database `imob-motion`

3. **Firebase Configuration**
   - Connected to correct Firebase project `imob-motion`
   - Configured named Firestore database
   - Deployed Firestore security rules
   - Environment variables properly configured with `VITE_` prefix

4. **User Document Schema**
   - Full schema implemented with stats, settings, subscription, credits, referral
   - Referral code auto-generated on signup
   - 60 seconds free credits for new users

---

## Detailed Breakdown

### Phase 0 — Infrastructure & Security

| Requirement | Status | Notes |
|-------------|--------|-------|
| Firebase project | ✅ Done | `imob-motion` project configured |
| Firebase Auth enabled | ✅ Done | Working |
| Firestore enabled | ✅ Done | Named database `imob-motion` |
| Firebase Storage enabled | ⚠️ Partial | Needs setup in console |
| Cloud Functions | ✅ Done | `onUserCreate` deployed |
| Firestore security rules | ✅ Done | `firestore.rules` deployed |
| Storage rules | ✅ Done | `storage.rules` exists |
| Secret Manager | ⚠️ Partial | FAL_KEY, STRIPE secrets pending |
| FAL_KEY secret | ❌ Missing | Need fal.ai API key |
| STRIPE secrets | ❌ Missing | No Stripe integration |

---

### Phase 1 — Authentication & User Bootstrap

| Requirement | Status | Notes |
|-------------|--------|-------|
| Email/password auth | ✅ Done | Firebase Auth |
| Google OAuth | ✅ Done | Implemented |
| Apple OAuth | ✅ Done | Implemented |
| Auth guards/protected routes | ✅ Done | React Router + AppLayout |
| onAuthCreate Cloud Function | ✅ Done | `functions/src/auth/onUserCreate.ts` |
| User document structure | ✅ Done | Full schema with all fields |
| Referral code generation | ✅ Done | Auto-generated 8-char code |
| Password reset | ✅ Done | Firebase sendPasswordResetEmail |

**Current User Document (Implemented):**
```json
{
  "uid": "",
  "email": "",
  "displayName": "",
  "photoURL": "",
  "createdAt": "",
  "updatedAt": "",
  "stats": { "videosCreated": 0, "photosUploaded": 0, "totalVideoSeconds": 0 },
  "settings": {
    "notifications": { "email": true, "projectUpdates": true, "marketing": false },
    "video": { "defaultQuality": "1080p", "defaultDurationSeconds": 30, "autosave": true }
  },
  "subscription": { "planId": "free", "status": "active", "stripeCustomerId": null, "storageQuotaBytes": 1073741824 },
  "credits": { "availableSeconds": 60, "usedSeconds": 0 },
  "referral": { "code": "ABC12345", "referredBy": null, "totalReferrals": 0 }
}
```

---

### Phase 2 — Project Lifecycle

| Requirement | Status | Notes |
|-------------|--------|-------|
| createProject | ✅ Done | `projectService.create()` |
| updateProject | ✅ Done | `projectService.update()` |
| deleteProject | ✅ Done | `projectService.delete()` |
| Ownership enforcement | ✅ Done | Security rules enforce uid match |
| Projects list with filters | ✅ Done | Working with Firestore |
| Realtime updates | ✅ Done | `onSnapshot` listeners |

**Current:** Projects stored in Firestore `projects/{projectId}` with realtime listeners

---

### Phase 3 — Asset Uploads

| Requirement | Status | Notes |
|-------------|--------|-------|
| Photo upload (drag/drop) | ✅ Done | Working in DashboardPage |
| Photo upload (browse) | ✅ Done | Working |
| Store in Firebase Storage | ✅ Done | `storageService.uploadFile()` |
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
| Firestore jobs collection | ✅ Done | Schema defined |
| createVideoJob function | ⚠️ Partial | Code exists, needs fal.ai key |
| fal.ai Queue API integration | ❌ Missing | Needs FAL_KEY secret |
| falWebhook handler | ⚠️ Partial | Code exists, needs deployment |
| Signed URL generation | ❌ Missing | - |
| Video processing status | ❌ Missing | Mocked with 3s timeout |
| Error handling | ❌ Missing | - |

**Current:** Video generation Cloud Function code exists but disabled pending fal.ai API key

**Required:** Configure `FAL_KEY` and `FAL_WEBHOOK_SECRET` in Firebase secrets

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
| Step 1: Photos | ✅ Done | Upload works with Firebase Storage |
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
| Referral code generation | ✅ Done | Generated in onUserCreate |
| Apply referral at signup | ✅ Done | Logic in Cloud Function |
| Referral state tracking | ✅ Done | `referrals` collection |
| Credit reward on payment | ❌ Missing | Needs Stripe webhook |
| Earnings history | ❌ Missing | Mock data only |

**Current:** Backend referral logic implemented, UI shows mock data

**Required:** Wire ReferralPage to Firestore data

---

### Phase 9 — Settings & Account

| Requirement | Status | Notes |
|-------------|--------|-------|
| Profile edit | ✅ Done | Working with Firestore |
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

## Architecture Status

### ✅ Resolved Issues

1. **Unified Backend**
   - Using Firebase Cloud Functions (no more Express servers)
   - Single Firebase project `imob-motion`

2. **Proper Security Rules**
   - `firestore.rules` deployed
   - `storage.rules` configured
   - User data protected by uid checks

3. **Client-Side Routing**
   - React Router implemented
   - Proper URL structure
   - Protected routes with auth guards

4. **Firebase SDK**
   - Direct Firestore access from client
   - Realtime listeners for updates
   - Proper auth state management

### Remaining Issues

1. **Token Storage**
   - Uses `localStorage` for user info cache
   - Firebase handles actual auth tokens securely

2. **Missing Secrets**
   - `FAL_KEY` - fal.ai API key
   - `FAL_WEBHOOK_SECRET` - Webhook validation
   - `STRIPE_SECRET_KEY` - Stripe API
   - `STRIPE_WEBHOOK_SECRET` - Stripe webhooks

---

## File Structure

```
src/
├── router.tsx                    # ✅ NEW - Route configuration
├── main.tsx                      # ✅ Updated - Uses RouterProvider
├── services/
│   └── firebase.ts               # ✅ Updated - Named database
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx         # ✅ NEW - Protected route wrapper
│   │   └── AuthLayout.tsx        # ✅ NEW - Auth page wrapper
│   └── pages/
│       ├── LandingPage.tsx       # ✅ NEW - Extracted from App.tsx
│       └── [All pages]           # ✅ Updated - useNavigate()

functions/
├── src/
│   ├── index.ts                  # ✅ Function exports
│   └── auth/
│       └── onUserCreate.ts       # ✅ User document creation
├── package.json                  # ✅ Dependencies
└── tsconfig.json                 # ✅ TypeScript config
```

---

## What Needs To Be Built

### Backend (Cloud Functions) - Pending

```
functions/
├── video/
│   ├── createJob.ts              # ⏳ Needs FAL_KEY
│   └── webhook.ts                # ⏳ Needs FAL_WEBHOOK_SECRET
├── billing/
│   ├── createCheckout.ts         # ❌ Needs Stripe
│   └── stripeWebhook.ts          # ❌ Needs Stripe
└── scheduled/
    └── creditExpiry.ts           # ❌ Future
```

### Firestore Collections Status

| Collection | Status |
|------------|--------|
| `users/{uid}` | ✅ Implemented |
| `projects/{projectId}` | ✅ Implemented |
| `projects/{projectId}/photos/{photoId}` | ⚠️ Schema ready |
| `jobs/{jobId}` | ⚠️ Schema ready |
| `assets/{assetId}` | ⚠️ Schema ready |
| `plans/{planId}` | ❌ Create |
| `credit_ledger/{entryId}` | ❌ Create |
| `referrals/{referralId}` | ✅ Implemented |
| `payments/{paymentId}` | ❌ Create |

---

## Priority Order

### P0 - Critical (MVP)
1. ~~Set up Cloud Functions structure~~ ✅
2. ~~Create Firestore security rules~~ ✅
3. ~~Implement React Router~~ ✅
4. Configure fal.ai secrets and deploy video functions
5. Wire project wizard to Firestore

### P1 - Important
6. Stripe billing integration
7. Credit system
8. Realtime project status updates

### P2 - Nice to Have
9. Referral program UI wiring
10. Google Drive / Dropbox import
11. Advanced settings (2FA, sessions)

---

## Next Steps

1. **Set up Firebase Storage** in console
2. **Configure fal.ai secrets:**
   ```bash
   firebase functions:secrets:set FAL_KEY
   firebase functions:secrets:set FAL_WEBHOOK_SECRET
   ```
3. **Enable video generation functions** in `functions/src/index.ts`
4. **Test complete signup → create project → generate video flow**

---

*Last Updated: 2026-01-30*

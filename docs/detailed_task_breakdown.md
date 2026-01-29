# Detailed Task-by-Task Execution Breakdown

---

## Phase 0 — Infrastructure & Security
- Create Firebase project
- Enable Authentication
- Enable Firestore (Native mode)
- Enable Firebase Storage
- Enable Cloud Functions (Node.js 18+)
- Define Firestore security rules
- Define Storage rules (`users/{uid}/**`)
- Create secrets:
  - FAL_KEY
  - FAL_WEBHOOK_SECRET
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
- Grant Cloud Functions access to secrets
- Verify Cloud Logging

---

## Phase 1 — Authentication & User Bootstrap
- Implement Firebase Auth (email + OAuth)
- Protect routes with auth guards
- Cloud Function: onAuthCreate
  - Create users/{uid}
  - Generate referral code
  - Initialize credits, stats, settings

---

## Phase 2 — Project Lifecycle
- createProject
- updateProject
- deleteProject
- Enforce ownership
- Projects list with status filters
- Realtime updates

---

## Phase 3 — Asset Uploads
- Photo upload (drag/drop + browse)
- Store photos in Storage
- Create projects/{projectId}/photos
- Photo ordering + thumbnail
- Google Drive import
- Dropbox import
- URL import (backend fetch)
- Logo upload + reuse

---

## Phase 4 — Video Generation Pipeline
- Firestore jobs collection
- createVideoJob(projectId)
  - Verify auth
  - Validate inputs
  - Generate signed URLs
  - Submit fal queue with webhook
- falWebhook handler
  - Validate secret
  - Idempotency
  - Download video
  - Store MP4
  - Update job + project
- Error handling

---

## Phase 5 — Playback
- Signed video URL generation
- Frontend video player
- Handle expiry

---

## Phase 6 — Billing & Credits
- Plans configuration
- Stripe Checkout
- Stripe webhooks
- Credit ledger
- Free credit toggle
- Unpaid project handling

---

## Phase 7 — Create Wizard Enhancements
- Branding toggle + logo
- Music catalog + preview
- Address autocomplete + map
- Summary + cost calculation

---

## Phase 8 — Referral Program
- Referral code generation
- Apply referral at signup
- Referral state tracking
- Credit reward
- Earnings history

---

## Phase 9 — Settings & Account
- Profile edit
- Email/password update
- Notification preferences
- Video defaults
- Storage usage
- Session revoke
- 2FA
- Data export
- Account deletion

---

## Phase 10 — Stability
- Structured logging
- Webhook retry safety
- Validation and graceful failure

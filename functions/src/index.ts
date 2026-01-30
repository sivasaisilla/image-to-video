/**
 * iMob Motion Cloud Functions
 *
 * This file exports all Cloud Functions for the application.
 */

// Auth triggers
export { onUserCreate } from "./auth/onUserCreate";

// Video generation (disabled until fal.ai secrets are configured)
// To enable: Add FAL_KEY and FAL_WEBHOOK_SECRET to Google Secret Manager
// export { createVideoJob } from "./video/createJob";
// export { falWebhook } from "./video/webhook";

// Note: Billing functions will be added later
// export { createCheckoutSession } from "./billing/checkout";
// export { stripeWebhook } from "./billing/webhook";

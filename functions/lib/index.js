"use strict";
/**
 * iMob Motion Cloud Functions
 *
 * This file exports all Cloud Functions for the application.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserCreate = void 0;
// Auth triggers
var onUserCreate_1 = require("./auth/onUserCreate");
Object.defineProperty(exports, "onUserCreate", { enumerable: true, get: function () { return onUserCreate_1.onUserCreate; } });
// Video generation (disabled until fal.ai secrets are configured)
// To enable: Add FAL_KEY and FAL_WEBHOOK_SECRET to Google Secret Manager
// export { createVideoJob } from "./video/createJob";
// export { falWebhook } from "./video/webhook";
// Note: Billing functions will be added later
// export { createCheckoutSession } from "./billing/checkout";
// export { stripeWebhook } from "./billing/webhook";
//# sourceMappingURL=index.js.map
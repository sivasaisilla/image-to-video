/**
 * falWebhook - HTTP Cloud Function
 *
 * Receives webhook callbacks from fal.ai when video generation completes.
 * Downloads the video, stores it in Firebase Storage, and updates Firestore.
 */
import * as functions from "firebase-functions/v1";
/**
 * fal.ai Webhook Handler
 */
export declare const falWebhook: functions.HttpsFunction;
//# sourceMappingURL=webhook.d.ts.map
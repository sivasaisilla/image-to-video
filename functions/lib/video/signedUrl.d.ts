/**
 * getSignedVideoUrl - HTTP Cloud Function
 *
 * Generates a temporary signed URL for video playback.
 * Called by frontend to get a URL with expiry for viewing videos.
 */
import * as functions from "firebase-functions/v1";
/**
 * Get Signed Video URL - Callable Function
 */
export declare const getSignedVideoUrl: functions.HttpsFunction & functions.Runnable<any>;
//# sourceMappingURL=signedUrl.d.ts.map
/**
 * getSignedVideoUrl - HTTP Cloud Function
 *
 * Generates a temporary signed URL for video playback.
 * Called by frontend to get a URL with expiry for viewing videos.
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Initialize Firebase Admin (only once)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const storage = admin.storage();

interface GetSignedUrlRequest {
  storagePath: string;
  expirationMinutes?: number;
}

interface GetSignedUrlResponse {
  url: string;
  expiresAt: number;
}

/**
 * Get Signed Video URL - Callable Function
 */
export const getSignedVideoUrl = functions.https.onCall(
  async (data: GetSignedUrlRequest, context): Promise<GetSignedUrlResponse> => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const uid = context.auth.uid;
    const { storagePath, expirationMinutes = 60 } = data;

    // Validate input
    if (!storagePath) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "storagePath is required"
      );
    }

    // Security: Verify user owns the video (must be in their user folder)
    if (!storagePath.startsWith(`users/${uid}/`)) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You don't have access to this video"
      );
    }

    try {
      const bucket = storage.bucket();
      const file = bucket.file(storagePath);

      // Check file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new functions.https.HttpsError("not-found", "Video file not found");
      }

      // Generate signed URL
      const expiresAt = Date.now() + expirationMinutes * 60 * 1000;
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: expiresAt,
      });

      console.log(`Generated signed URL for: ${storagePath}, expires in ${expirationMinutes}m`);

      return {
        url,
        expiresAt,
      };
    } catch (error) {
      console.error(`Error generating signed URL for ${storagePath}:`, error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to generate signed URL"
      );
    }
  }
);

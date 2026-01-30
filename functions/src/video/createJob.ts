/**
 * createVideoJob - HTTP Cloud Function
 *
 * Submits a video generation job to fal.ai queue.
 * Called by the frontend when user clicks "Generate Video".
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Initialize Firebase Admin (only once)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

// fal.ai API endpoint
const FAL_QUEUE_URL =
  "https://queue.fal.run/fal-ai/kling-video/v2.5-turbo/pro/image-to-video";

interface VideoJobRequest {
  projectId: string;
  photos: string[]; // Storage paths
  config: {
    duration: number; // seconds
    aspectRatio: string; // "16:9", "9:16", "1:1"
    prompt?: string;
  };
}

interface VideoJobResponse {
  jobId: string;
  status: string;
}

/**
 * Generate signed URLs for photos stored in Firebase Storage
 */
async function generateSignedUrls(storagePaths: string[]): Promise<string[]> {
  const bucket = storage.bucket();
  const urls: string[] = [];

  for (const path of storagePaths) {
    const file = bucket.file(path);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });
    urls.push(url);
  }

  return urls;
}

/**
 * Submit job to fal.ai queue
 */
async function submitToFal(
  imageUrls: string[],
  config: VideoJobRequest["config"],
  webhookUrl: string,
  apiKey: string
): Promise<{ requestId: string }> {
  const response = await fetch(FAL_QUEUE_URL, {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageUrls[0], // fal.ai takes single image for this model
      prompt: config.prompt || "Smooth cinematic camera movement",
      duration: config.duration.toString(),
      aspect_ratio: config.aspectRatio,
      webhook_url: webhookUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`fal.ai API error: ${error}`);
  }

  const data = (await response.json()) as { request_id: string };
  return { requestId: data.request_id };
}

/**
 * Create Video Job - Callable Function
 */
export const createVideoJob = functions
  .runWith({
    secrets: ["FAL_KEY", "FAL_WEBHOOK_SECRET"],
  })
  .https.onCall(async (data: VideoJobRequest, context): Promise<VideoJobResponse> => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const uid = context.auth.uid;

    // Validate input
    if (!data.projectId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Project ID is required"
      );
    }
    if (!data.photos || data.photos.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "At least one photo is required"
      );
    }

    console.log(`Creating video job for project: ${data.projectId}`);

    try {
      // Verify project ownership
      const projectRef = db.collection("projects").doc(data.projectId);
      const projectDoc = await projectRef.get();

      if (!projectDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Project not found");
      }

      const projectData = projectDoc.data();
      if (projectData?.uid !== uid) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You don't own this project"
        );
      }

      // Check user credits
      const userRef = db.collection("users").doc(uid);
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      const requiredSeconds = data.config.duration || 10;
      const availableSeconds = userData?.credits?.availableSeconds || 0;

      if (availableSeconds < requiredSeconds) {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          `Not enough credits. Need ${requiredSeconds}s, have ${availableSeconds}s`
        );
      }

      // Generate signed URLs for images
      const imageUrls = await generateSignedUrls(data.photos);

      // Create job document
      const jobRef = db.collection("jobs").doc();
      const jobId = jobRef.id;

      // Get secrets
      const falApiKey = process.env.FAL_KEY;
      const falWebhookSecret = process.env.FAL_WEBHOOK_SECRET;

      if (!falApiKey || !falWebhookSecret) {
        throw new functions.https.HttpsError(
          "internal",
          "API keys not configured"
        );
      }

      // Get webhook URL (your Cloud Function URL)
      const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
      const webhookUrl = `https://us-central1-${projectId}.cloudfunctions.net/falWebhook?jobId=${jobId}&secret=${falWebhookSecret}`;

      // Submit to fal.ai
      const falResponse = await submitToFal(
        imageUrls,
        data.config,
        webhookUrl,
        falApiKey
      );

      // Save job to Firestore
      await jobRef.set({
        uid,
        projectId: data.projectId,
        status: "processing",
        falModel: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
        falRequestId: falResponse.requestId,
        input: {
          prompt: data.config.prompt || "",
          imageUrls,
          aspectRatio: data.config.aspectRatio,
          duration: data.config.duration,
        },
        output: {
          videoAssetId: null,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update project status
      await projectRef.update({
        status: "generating",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Deduct credits (hold them)
      await userRef.update({
        "credits.availableSeconds":
          admin.firestore.FieldValue.increment(-requiredSeconds),
      });

      console.log(
        `Job created: ${jobId}, fal request: ${falResponse.requestId}`
      );

      return {
        jobId,
        status: "processing",
      };
    } catch (error) {
      console.error("Error creating video job:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to create video job"
      );
    }
  });

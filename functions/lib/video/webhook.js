"use strict";
/**
 * falWebhook - HTTP Cloud Function
 *
 * Receives webhook callbacks from fal.ai when video generation completes.
 * Downloads the video, stores it in Firebase Storage, and updates Firestore.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.falWebhook = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin (only once)
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
const storage = admin.storage();
/**
 * Download video from URL and upload to Firebase Storage
 */
async function downloadAndStoreVideo(videoUrl, uid, projectId) {
    console.log(`Downloading video from: ${videoUrl}`);
    // Download video
    const response = await fetch(videoUrl);
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }
    const videoBuffer = Buffer.from(await response.arrayBuffer());
    // Generate storage path
    const timestamp = Date.now();
    const storagePath = `users/${uid}/videos/${projectId}_${timestamp}.mp4`;
    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const file = bucket.file(storagePath);
    await file.save(videoBuffer, {
        metadata: {
            contentType: "video/mp4",
        },
    });
    console.log(`Video stored at: ${storagePath}`);
    return storagePath;
}
/**
 * fal.ai Webhook Handler
 */
exports.falWebhook = functions
    .runWith({
    secrets: ["FAL_WEBHOOK_SECRET"],
})
    .https.onRequest(async (req, res) => {
    // Only accept POST
    if (req.method !== "POST") {
        res.status(405).send("Method not allowed");
        return;
    }
    // Validate webhook secret
    const falWebhookSecret = process.env.FAL_WEBHOOK_SECRET;
    const providedSecret = req.query.secret;
    if (!falWebhookSecret || providedSecret !== falWebhookSecret) {
        console.error("Invalid webhook secret");
        res.status(401).send("Unauthorized");
        return;
    }
    const jobId = req.query.jobId;
    if (!jobId) {
        console.error("Missing jobId in webhook");
        res.status(400).send("Missing jobId");
        return;
    }
    const payload = req.body;
    console.log(`Webhook received for job: ${jobId}, status: ${payload.status}`);
    try {
        // Get job document
        const jobRef = db.collection("jobs").doc(jobId);
        const jobDoc = await jobRef.get();
        if (!jobDoc.exists) {
            console.error(`Job not found: ${jobId}`);
            res.status(404).send("Job not found");
            return;
        }
        const jobData = jobDoc.data();
        // Idempotency check - don't process completed jobs again
        if (jobData.status === "completed" || jobData.status === "failed") {
            console.log(`Job ${jobId} already processed, skipping`);
            res.status(200).send("Already processed");
            return;
        }
        // Verify request ID matches
        if (jobData.falRequestId !== payload.request_id) {
            console.error(`Request ID mismatch for job ${jobId}`);
            res.status(400).send("Request ID mismatch");
            return;
        }
        if (payload.status === "COMPLETED" && payload.output?.video?.url) {
            // Download and store video
            const videoPath = await downloadAndStoreVideo(payload.output.video.url, jobData.uid, jobData.projectId);
            // Create asset record
            const assetRef = db.collection("assets").doc();
            await assetRef.set({
                uid: jobData.uid,
                type: "video",
                storagePath: videoPath,
                projectId: jobData.projectId,
                jobId: jobId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                meta: {
                    duration: jobData.input.duration,
                    aspectRatio: jobData.input.aspectRatio,
                },
            });
            // Update job
            await jobRef.update({
                status: "completed",
                "output.videoAssetId": assetRef.id,
                completedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Update project
            const projectRef = db.collection("projects").doc(jobData.projectId);
            await projectRef.update({
                status: "completed",
                "output.videoAssetId": assetRef.id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Update user stats
            const userRef = db.collection("users").doc(jobData.uid);
            await userRef.update({
                "stats.videosCreated": admin.firestore.FieldValue.increment(1),
                "stats.totalVideoSeconds": admin.firestore.FieldValue.increment(jobData.input.duration),
                "credits.usedSeconds": admin.firestore.FieldValue.increment(jobData.input.duration),
            });
            console.log(`Job ${jobId} completed successfully`);
        }
        else if (payload.status === "FAILED") {
            // Handle failure
            await jobRef.update({
                status: "failed",
                error: payload.error || "Unknown error",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Update project
            const projectRef = db.collection("projects").doc(jobData.projectId);
            await projectRef.update({
                status: "failed",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Refund credits
            const userRef = db.collection("users").doc(jobData.uid);
            await userRef.update({
                "credits.availableSeconds": admin.firestore.FieldValue.increment(jobData.input.duration),
            });
            console.error(`Job ${jobId} failed: ${payload.error}`);
        }
        res.status(200).send("OK");
    }
    catch (error) {
        console.error(`Error processing webhook for job ${jobId}:`, error);
        res.status(500).send("Internal error");
    }
});
//# sourceMappingURL=webhook.js.map
"use strict";
/**
 * getSignedVideoUrl - HTTP Cloud Function
 *
 * Generates a temporary signed URL for video playback.
 * Called by frontend to get a URL with expiry for viewing videos.
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
exports.getSignedVideoUrl = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin (only once)
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const storage = admin.storage();
/**
 * Get Signed Video URL - Callable Function
 */
exports.getSignedVideoUrl = functions.https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const uid = context.auth.uid;
    const { storagePath, expirationMinutes = 60 } = data;
    // Validate input
    if (!storagePath) {
        throw new functions.https.HttpsError("invalid-argument", "storagePath is required");
    }
    // Security: Verify user owns the video (must be in their user folder)
    if (!storagePath.startsWith(`users/${uid}/`)) {
        throw new functions.https.HttpsError("permission-denied", "You don't have access to this video");
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
    }
    catch (error) {
        console.error(`Error generating signed URL for ${storagePath}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to generate signed URL");
    }
});
//# sourceMappingURL=signedUrl.js.map
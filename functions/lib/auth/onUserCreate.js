"use strict";
/**
 * onUserCreate - Firebase Auth Trigger
 *
 * Fires when a new user signs up via Firebase Auth.
 * Creates the user document in Firestore with full schema.
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
exports.onUserCreate = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
// Initialize Firebase Admin (only once)
if (admin.apps.length === 0) {
    admin.initializeApp();
}
// Use the named database 'imob-motion'
const db = (0, firestore_1.getFirestore)(admin.app(), "imob-motion");
/**
 * Generate a unique referral code
 */
function generateReferralCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
/**
 * Auth trigger: Create user document when user signs up
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    const { uid, email, displayName, photoURL } = user;
    console.log(`Creating user document for: ${email} (${uid})`);
    // Check if referral code was passed in custom claims
    const customClaims = user.customClaims;
    const referredBy = customClaims?.referredBy || null;
    const userData = {
        uid,
        email: email || "",
        displayName: displayName || "",
        photoURL: photoURL || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Stats
        stats: {
            videosCreated: 0,
            photosUploaded: 0,
            totalVideoSeconds: 0,
        },
        // Settings
        settings: {
            notifications: {
                email: true,
                projectUpdates: true,
                marketing: false,
            },
            video: {
                defaultQuality: "1080p",
                defaultDurationSeconds: 30,
                autosave: true,
            },
        },
        // Subscription
        subscription: {
            planId: "free",
            status: "active",
            stripeCustomerId: null,
            storageQuotaBytes: 1073741824, // 1GB default
        },
        // Credits
        credits: {
            availableSeconds: 60, // 60 seconds free for new users
            usedSeconds: 0,
        },
        // Referral
        referral: {
            code: generateReferralCode(),
            referredBy: referredBy,
            totalReferrals: 0,
        },
    };
    try {
        // Create user document
        await db.collection("users").doc(uid).set(userData);
        console.log(`User document created for: ${uid}`);
        // If referred by someone, create referral record
        if (referredBy) {
            await processReferral(uid, referredBy);
        }
        return { success: true };
    }
    catch (error) {
        console.error(`Error creating user document for ${uid}:`, error);
        throw error;
    }
});
/**
 * Process referral when new user signs up with referral code
 */
async function processReferral(newUserId, referralCode) {
    try {
        // Find referrer by code
        const referrerQuery = await db
            .collection("users")
            .where("referral.code", "==", referralCode)
            .limit(1)
            .get();
        if (referrerQuery.empty) {
            console.log(`Invalid referral code: ${referralCode}`);
            return;
        }
        const referrerDoc = referrerQuery.docs[0];
        const referrerId = referrerDoc.id;
        // Create referral record
        await db.collection("referrals").add({
            referrerUid: referrerId,
            refereeUid: newUserId,
            status: "pending", // Becomes 'completed' when referee makes first payment
            earnedSeconds: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Update referrer's count
        await db
            .collection("users")
            .doc(referrerId)
            .update({
            "referral.totalReferrals": admin.firestore.FieldValue.increment(1),
        });
        console.log(`Referral processed: ${referrerId} -> ${newUserId}`);
    }
    catch (error) {
        console.error("Error processing referral:", error);
    }
}
//# sourceMappingURL=onUserCreate.js.map
/**
 * onUserCreate - Firebase Auth Trigger
 *
 * Fires when a new user signs up via Firebase Auth.
 * Creates the user document in Firestore with full schema.
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin (only once)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Use the named database 'imob-motion'
const db = getFirestore(admin.app(), "imob-motion");

/**
 * Generate a unique referral code
 */
function generateReferralCode(): string {
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
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;

  console.log(`Creating user document for: ${email} (${uid})`);

  // Check if referral code was passed in custom claims
  const customClaims = user.customClaims as Record<string, unknown> | undefined;
  const referredBy = (customClaims?.referredBy as string) || null;

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
  } catch (error) {
    console.error(`Error creating user document for ${uid}:`, error);
    throw error;
  }
});

/**
 * Process referral when new user signs up with referral code
 */
async function processReferral(
  newUserId: string,
  referralCode: string
): Promise<void> {
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
  } catch (error) {
    console.error("Error processing referral:", error);
  }
}

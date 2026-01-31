/**
 * Stripe Webhook Handler
 *
 * Handles Stripe events:
 * - payment_intent.succeeded: Add credits to user account
 * - customer.subscription.updated: Update subscription status
 * - invoice.payment_failed: Handle failed payments
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import Stripe from "stripe";

// Initialize Firebase Admin (only once)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export const stripeWebhook = functions.https.onRequest(
  async (req, res): Promise<void> => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      console.error("Missing signature or webhook secret");
      res.status(400).send("Missing signature or webhook secret");
      return;
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody || Buffer.from(JSON.stringify(req.body)),
        sig as string,
        webhookSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err);
      res.status(400).send(`Webhook Error: ${err}`);
      return;
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentSucceeded(paymentIntent);
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdated(subscription);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentFailed(invoice);
          break;
        }

        case "charge.refunded": {
          const charge = event.data.object as Stripe.Charge;
          await handleChargeRefunded(charge);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error(`Error processing webhook: ${error}`);
      res.status(500).send("Internal Server Error");
    }
  }
);

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata || {};
  const uid = metadata.uid;
  const planId = metadata.planId;
  const creditsAmount = parseInt(metadata.creditsAmount || "0", 10);

  if (!uid) {
    console.error("Payment intent missing uid in metadata");
    return;
  }

  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    console.error(`User ${uid} not found`);
    return;
  }

  const userData = userDoc.data() as any;
  const currentCredits = userData.credits?.availableSeconds || 0;

  // Add credits to user
  await userRef.update({
    "credits.availableSeconds": currentCredits + creditsAmount,
    "subscription.planId": planId || userData.subscription.planId,
    "subscription.status": "active",
    "subscription.renewalDate": admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ), // 30 days
  });

  // Log transaction to credit ledger
  await db.collection("users").doc(uid).collection("credit_ledger").add({
    type: "purchase",
    amount: creditsAmount,
    planId: planId || null,
    paymentIntentId: paymentIntent.id,
    description: `Purchased ${creditsAmount} seconds of video credits`,
    createdAt: admin.firestore.Timestamp.now(),
    status: "completed",
  });

  // Update referral rewards if applicable
  const referredByRef = userData.referral?.referredBy;
  if (referredByRef) {
    const referrerRef = db.collection("users").doc(referredByRef);
    const referrerDoc = await referrerRef.get();

    if (referrerDoc.exists) {
      const referrerData = referrerDoc.data() as any;
      const referralReward = 300; // 5 minutes of free credits

      await referrerRef.update({
        "credits.availableSeconds":
          (referrerData.credits?.availableSeconds || 0) + referralReward,
        "referral.totalReferrals": (referrerData.referral?.totalReferrals || 0) + 1,
      });

      // Log referral reward
      await referrerRef.collection("credit_ledger").add({
        type: "referral_reward",
        amount: referralReward,
        referredUser: uid,
        description: `Referral reward for ${uid}`,
        createdAt: admin.firestore.Timestamp.now(),
        status: "completed",
      });
    }
  }

  console.log(
    `Payment succeeded for user ${uid}: +${creditsAmount} credits, Plan: ${planId}`
  );
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const usersSnapshot = await db
    .collection("users")
    .where("subscription.stripeCustomerId", "==", stripeCustomerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error(`User not found for Stripe customer ${stripeCustomerId}`);
    return;
  }

  const uid = usersSnapshot.docs[0].id;
  const userRef = db.collection("users").doc(uid);

  const planId = subscription.items.data[0]?.plan.metadata?.planId || "pro";
  const status =
    subscription.status === "active" ? "active" : "inactive";

  await userRef.update({
    "subscription.planId": planId,
    "subscription.status": status,
    "subscription.currentPeriodEnd": admin.firestore.Timestamp.fromDate(
      new Date(subscription.current_period_end * 1000)
    ),
    "subscription.renewalDate": admin.firestore.Timestamp.fromDate(
      new Date(subscription.current_period_end * 1000)
    ),
  });

  console.log(`Subscription updated for user ${uid}: status=${status}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const stripeCustomerId = invoice.customer as string;

  // Find user by Stripe customer ID
  const usersSnapshot = await db
    .collection("users")
    .where("subscription.stripeCustomerId", "==", stripeCustomerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error(`User not found for failed payment`);
    return;
  }

  const uid = usersSnapshot.docs[0].id;
  const userRef = db.collection("users").doc(uid);

  // Log failed payment
  await userRef.collection("credit_ledger").add({
    type: "payment_failed",
    amount: 0,
    description: `Payment failed for invoice ${invoice.id}`,
    createdAt: admin.firestore.Timestamp.now(),
    status: "failed",
  });

  console.log(`Payment failed for user ${uid}`);
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  if (!charge.metadata?.uid) {
    console.error("Refund charge missing uid in metadata");
    return;
  }

  const uid = charge.metadata.uid;
  const refundAmount = charge.amount_refunded / 100; // Convert cents to dollars
  const creditsToRefund = parseInt(charge.metadata.creditsAmount || "0", 10);

  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) return;

  const userData = userDoc.data() as any;

  // Add refund to credits
  await userRef.update({
    "credits.availableSeconds":
      (userData.credits?.availableSeconds || 0) + creditsToRefund,
  });

  // Log refund
  await userRef.collection("credit_ledger").add({
    type: "refund",
    amount: creditsToRefund,
    refundAmount: refundAmount,
    chargeId: charge.id,
    description: `Refund: ${creditsToRefund} seconds`,
    createdAt: admin.firestore.Timestamp.now(),
    status: "completed",
  });

  console.log(`Refund processed for user ${uid}: +${creditsToRefund} credits`);
}

/**
 * createCheckoutSession - Callable Cloud Function
 *
 * Creates a Stripe checkout session for purchasing credits.
 * Called by frontend SubscriptionPage and TopUpPage.
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

interface CreateCheckoutSessionRequest {
  planId: string;
  planName: string;
  priceInCents: number;
  creditsAmount: number;
  successUrl: string;
  cancelUrl: string;
}

interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export const createCheckoutSession = functions.https.onCall(
  async (
    data: CreateCheckoutSessionRequest,
    context
  ): Promise<CreateCheckoutSessionResponse> => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const uid = context.auth.uid;
    const { planId, planName, priceInCents, creditsAmount, successUrl, cancelUrl } = data;

    // Validate input
    if (!planId || !planName || !priceInCents || !creditsAmount) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
    }

    try {
      const userRef = db.collection("users").doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "User document not found"
        );
      }

      const userData = userDoc.data() as any;
      let stripeCustomerId = userData.subscription?.stripeCustomerId;

      // Create or retrieve Stripe customer
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: userData.email,
          name: userData.displayName || "User",
          metadata: { uid },
        });
        stripeCustomerId = customer.id;

        // Save Stripe customer ID
        await userRef.update({
          "subscription.stripeCustomerId": stripeCustomerId,
        });
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: planName,
                description: `${creditsAmount} seconds of video creation credits`,
                metadata: {
                  planId,
                },
              },
              unit_amount: priceInCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          uid,
          planId,
          creditsAmount: creditsAmount.toString(),
        },
      });

      if (!session.url) {
        throw new functions.https.HttpsError(
          "internal",
          "Failed to create checkout session URL"
        );
      }

      console.log(`Checkout session created for user ${uid}: ${session.id}`);

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error(`Error creating checkout session: ${error}`);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError(
        "internal",
        "Failed to create checkout session"
      );
    }
  }
);

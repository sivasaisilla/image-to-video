/**
 * Credit Ledger Service
 * 
 * Client-side service for managing credit transactions and ledger
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  Unsubscribe,
  Query,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

export interface CreditTransaction {
  id: string;
  type: "purchase" | "usage" | "refund" | "referral_reward" | "payment_failed";
  amount: number;
  description: string;
  planId?: string;
  paymentIntentId?: string;
  createdAt: Date;
  status: "pending" | "completed" | "failed";
}

export interface CreditBalance {
  availableSeconds: number;
  usedSeconds: number;
  totalEarned: number;
}

/**
 * Get recent credit transactions for current user
 */
export async function getCreditLedger(
  uid: string,
  limitCount: number = 50
): Promise<CreditTransaction[]> {
  const q = query(
    collection(db, "users", uid, "credit_ledger"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      type: data.type,
      amount: data.amount,
      description: data.description,
      planId: data.planId,
      paymentIntentId: data.paymentIntentId,
      createdAt: data.createdAt?.toDate() || new Date(),
      status: data.status,
    };
  });
}

/**
 * Listen to credit ledger changes in real-time
 */
export function onCreditLedgerChange(
  uid: string,
  callback: (transactions: CreditTransaction[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "users", uid, "credit_ledger"),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const transactions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        amount: data.amount,
        description: data.description,
        planId: data.planId,
        paymentIntentId: data.paymentIntentId,
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status,
      } as CreditTransaction;
    });
    callback(transactions);
  });
}

/**
 * Format seconds to readable time
 */
export function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Calculate cost in cents based on video duration
 * Pricing: $0.10 per second of video (~$6/minute)
 */
export function calculateVideoCost(durationSeconds: number): number {
  return Math.ceil(durationSeconds * 10); // 10 cents per second
}

/**
 * Get available plans
 */
export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    priceUSD: 9.99,
    creditsSeconds: 300, // 5 minutes
    pricePerSecond: 0.0333,
  },
  {
    id: "pro",
    name: "Pro",
    priceUSD: 24.99,
    creditsSeconds: 900, // 15 minutes
    pricePerSecond: 0.0278,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceUSD: 99.99,
    creditsSeconds: 3600, // 60 minutes
    pricePerSecond: 0.0278,
  },
];

/**
 * Get plan by ID
 */
export function getPlanById(planId: string) {
  return PLANS.find((p) => p.id === planId);
}

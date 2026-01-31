import { 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, getCurrentUserId } from './firebase';

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredEmail: string;
  referredName?: string;
  referralCode: string;
  status: 'pending' | 'completed'; // pending = user signed up, completed = made payment
  createdAt: any;
  completedAt?: any;
  rewardSeconds: number; // 300 seconds = 5 minutes for Phase 6 (was 60s)
}

export const referralService = {
  /**
   * Get current user's referral code
   */
  async getReferralCode(): Promise<string | null> {
    try {
      const uid = getCurrentUserId();
      if (!uid) return null;

      // The referral code is stored in the user document
      // This would be fetched via userService or directly from Firestore
      // For now, we'll generate it from the UID
      return `REF-${uid.substring(0, 8).toUpperCase()}`;
    } catch (error) {
      console.error('Error getting referral code:', error);
      return null;
    }
  },

  /**
   * Get all referrals where current user is the referrer
   */
  async getMyReferrals(): Promise<Referral[]> {
    try {
      const uid = getCurrentUserId();
      if (!uid) return [];

      const q = query(collection(db, 'referrals'), where('referrerId', '==', uid));
      const docs = await getDocs(q);
      
      return docs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Referral));
    } catch (error) {
      console.error('Error fetching referrals:', error);
      return [];
    }
  },

  /**
   * Listen to referrals in real-time
   */
  onMyReferralsChange(callback: (referrals: Referral[]) => void): Unsubscribe {
    const uid = getCurrentUserId();
    if (!uid) {
      console.error('User not authenticated');
      return () => {};
    }

    const q = query(collection(db, 'referrals'), where('referrerId', '==', uid));
    
    return onSnapshot(q, (snapshot) => {
      const referrals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Referral));
      
      callback(referrals);
    });
  },

  /**
   * Get referral statistics for dashboard
   */
  async getReferralStats(): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalEarnedSeconds: number;
    totalUsedSeconds: number;
  }> {
    try {
      const referrals = await this.getMyReferrals();

      const completed = referrals.filter(r => r.status === 'completed');
      const pending = referrals.filter(r => r.status === 'pending');

      return {
        totalReferrals: referrals.length,
        completedReferrals: completed.length,
        pendingReferrals: pending.length,
        totalEarnedSeconds: completed.reduce((sum, r) => sum + r.rewardSeconds, 0),
        totalUsedSeconds: 0, // Will be calculated from credit ledger in future
      };
    } catch (error) {
      console.error('Error calculating referral stats:', error);
      return {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalEarnedSeconds: 0,
        totalUsedSeconds: 0,
      };
    }
  },

  /**
   * Get referral info for a referred user (who referred them)
   */
  async getReferredByInfo(): Promise<{ referrerId: string; referralCode: string } | null> {
    try {
      const uid = getCurrentUserId();
      if (!uid) return null;

      // The referral info would be stored in the user document
      // This is set during signup when a referral code is used
      // For now, return null as this is handled in auth service
      return null;
    } catch (error) {
      console.error('Error fetching referred by info:', error);
      return null;
    }
  },

  /**
   * Calculate reward for a referral
   * Phase 6: 300 seconds (5 minutes) per referral on payment
   * This is the free credit amount the referrer gets when referred user makes payment
   */
  calculateReward(): number {
    return 300; // 5 minutes in seconds
  }
};

import { getFirestore, doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../config/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// OTP Service using Firestore
export const otpService = {
  // Generate 6-digit OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Store OTP in Firestore with expiration
  async storeOTP(email: string, otp: string, expirationMinutes: number = 10): Promise<boolean> {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

      await setDoc(doc(db, 'otps', email), {
        email: email,
        otp: otp,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt,
        attempts: 0,
        isUsed: false
      });

      return true;
    } catch (error) {
      console.error('Error storing OTP:', error);
      return false;
    }
  },

  // Verify OTP
  async verifyOTP(email: string, inputOTP: string): Promise<{ success: boolean; error?: string }> {
    try {
      const otpDoc = await getDoc(doc(db, 'otps', email));
      
      if (!otpDoc.exists()) {
        return { success: false, error: 'OTP not found or expired' };
      }

      const otpData = otpDoc.data();
      
      // Check if OTP is expired
      if (new Date() > otpData.expiresAt.toDate()) {
        await deleteDoc(doc(db, 'otps', email));
        return { success: false, error: 'OTP has expired' };
      }

      // Check if OTP is already used
      if (otpData.isUsed) {
        return { success: false, error: 'OTP has already been used' };
      }

      // Check attempts limit
      if (otpData.attempts >= 3) {
        await deleteDoc(doc(db, 'otps', email));
        return { success: false, error: 'Too many attempts. Please request a new OTP' };
      }

      // Increment attempts
      await setDoc(doc(db, 'otps', email), {
        ...otpData,
        attempts: otpData.attempts + 1
      }, { merge: true });

      // Verify OTP
      if (otpData.otp === inputOTP) {
        // Mark as used
        await setDoc(doc(db, 'otps', email), {
          ...otpData,
          isUsed: true
        }, { merge: true });
        
        return { success: true };
      } else {
        return { success: false, error: 'Invalid OTP' };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, error: 'Failed to verify OTP' };
    }
  },

  // Clean up expired OTPs
  async cleanupExpiredOTPs(): Promise<void> {
    try {
      // This would typically be run as a scheduled function
      // For now, manual cleanup can be implemented
      console.log('OTP cleanup service initialized');
    } catch (error) {
      console.error('Error cleaning up OTPs:', error);
    }
  }
};

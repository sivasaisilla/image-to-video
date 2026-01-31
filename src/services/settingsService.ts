import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  deleteUser as deleteFirebaseUser,
  User as FirebaseUser
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  deleteField
} from "firebase/firestore";
import { auth, db, getCurrentUserId } from "./firebase";

export interface UserSettings {
  notifications: {
    email: boolean;
    projectUpdates: boolean;
    marketing: boolean;
  };
  video: {
    defaultQuality: '720p' | '1080p' | '4k';
    defaultDurationSeconds: number;
    autosave: boolean;
  };
  theme: 'light' | 'dark';
  language: string;
}

export interface StorageUsage {
  usedBytes: number;
  quotaBytes: number;
  percentageUsed: number;
}

export const settingsService = {
  // Get user settings
  async getUserSettings(uid: string): Promise<UserSettings | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return null;
      
      const data = userDoc.data();
      return {
        notifications: data.settings?.notifications || {
          email: true,
          projectUpdates: true,
          marketing: false
        },
        video: data.settings?.video || {
          defaultQuality: '1080p',
          defaultDurationSeconds: 30,
          autosave: true
        },
        theme: data.settings?.theme || 'dark',
        language: data.settings?.language || 'en'
      };
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  },

  // Update user settings
  async updateUserSettings(uid: string, settings: Partial<UserSettings>): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, 'users', uid);
      
      // Preserve existing settings and merge new ones
      const existingSettings = await settingsService.getUserSettings(uid);
      const mergedSettings = {
        notifications: { ...existingSettings?.notifications, ...settings.notifications },
        video: { ...existingSettings?.video, ...settings.video },
        theme: settings.theme || existingSettings?.theme || 'dark',
        language: settings.language || existingSettings?.language || 'en'
      };
      
      await setDoc(userRef, { settings: mergedSettings }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: 'Failed to update settings' };
    }
  },

  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        return { success: false, error: 'No user logged in' };
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      if (error.code === 'auth/wrong-password') {
        return { success: false, error: 'Current password is incorrect' };
      } else if (error.code === 'auth/weak-password') {
        return { success: false, error: 'New password is too weak' };
      }
      
      return { success: false, error: 'Failed to update password' };
    }
  },

  // Calculate storage usage
  async getStorageUsage(uid: string): Promise<StorageUsage> {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      const usedBytes = userDoc.data()?.subscription?.storageUsedBytes || 0;
      const quotaBytes = userDoc.data()?.subscription?.storageQuotaBytes || 1073741824; // 1GB default
      
      return {
        usedBytes,
        quotaBytes,
        percentageUsed: Math.round((usedBytes / quotaBytes) * 100)
      };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return {
        usedBytes: 0,
        quotaBytes: 1073741824,
        percentageUsed: 0
      };
    }
  },

  // Get active sessions count (simplified - just count user's devices)
  async getActiveSessions(): Promise<number> {
    try {
      const uid = getCurrentUserId();
      if (!uid) return 0;
      
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      return userDoc.data()?.activeSessions || 1;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return 1;
    }
  },

  // Delete account - comprehensive cleanup
  async deleteAccount(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        return { success: false, error: 'No user logged in' };
      }

      const uid = currentUser.uid;

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      // Delete all user data from Firestore
      // 1. Delete projects and their subcollections
      const projectsRef = collection(db, 'projects');
      const projectsQuery = query(projectsRef, where('ownerId', '==', uid));
      const projectsSnap = await getDocs(projectsQuery);
      
      for (const projectDoc of projectsSnap.docs) {
        const projectId = projectDoc.id;
        
        // Delete photos subcollection
        const photosRef = collection(db, 'projects', projectId, 'photos');
        const photosSnap = await getDocs(photosRef);
        for (const photoDoc of photosSnap.docs) {
          await deleteDoc(photoDoc.ref);
        }
        
        // Delete project
        await deleteDoc(projectDoc.ref);
      }

      // 2. Delete user document
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);

      // 3. Delete jobs
      const jobsRef = collection(db, 'jobs');
      const jobsQuery = query(jobsRef, where('userId', '==', uid));
      const jobsSnap = await getDocs(jobsQuery);
      for (const jobDoc of jobsSnap.docs) {
        await deleteDoc(jobDoc.ref);
      }

      // 4. Delete assets
      const assetsRef = collection(db, 'assets');
      const assetsQuery = query(assetsRef, where('ownerId', '==', uid));
      const assetsSnap = await getDocs(assetsQuery);
      for (const assetDoc of assetsSnap.docs) {
        await deleteDoc(assetDoc.ref);
      }

      // 5. Delete referrals where user is referrer
      const referralsRef = collection(db, 'referrals');
      const referralsQuery = query(referralsRef, where('referrerId', '==', uid));
      const referralsSnap = await getDocs(referralsQuery);
      for (const referralDoc of referralsSnap.docs) {
        await deleteDoc(referralDoc.ref);
      }

      // 6. Delete Firebase Auth user
      await deleteFirebaseUser(currentUser);

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting account:', error);
      
      if (error.code === 'auth/wrong-password') {
        return { success: false, error: 'Password is incorrect' };
      }
      
      return { success: false, error: 'Failed to delete account' };
    }
  },

  // Export user data
  async exportUserData(uid: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const userData: any = {
        user: null,
        projects: [],
        jobs: [],
        referrals: []
      };

      // Get user document
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        userData.user = { id: userDoc.id, ...userDoc.data() };
      }

      // Get projects
      const projectsRef = collection(db, 'projects');
      const projectsQuery = query(projectsRef, where('ownerId', '==', uid));
      const projectsSnap = await getDocs(projectsQuery);
      userData.projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get jobs
      const jobsRef = collection(db, 'jobs');
      const jobsQuery = query(jobsRef, where('userId', '==', uid));
      const jobsSnap = await getDocs(jobsQuery);
      userData.jobs = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get referrals
      const referralsRef = collection(db, 'referrals');
      const referralsQuery = query(referralsRef, where('referrerId', '==', uid));
      const referralsSnap = await getDocs(referralsQuery);
      userData.referrals = referralsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { success: true, data: userData };
    } catch (error) {
      console.error('Error exporting user data:', error);
      return { success: false, error: 'Failed to export data' };
    }
  }
};

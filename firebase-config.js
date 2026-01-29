// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcdkJl_niHJyqBDtbCtEEFEGkOnukHmYE",
  authDomain: "imob-motion-4b2f1.firebaseapp.com",
  projectId: "imob-motion-4b2f1",
  storageBucket: "imob-motion-4b2f1.firebasestorage.app",
  messagingSenderId: "1036615610685",
  appId: "1:1036615610685:web:fdcc8decdf5ee233c59554",
  measurementId: "G-HJ94PJTD96"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  }).catch(() => {
    console.log('Analytics not available in this environment');
  });
}

export { auth, db, storage, analytics };

// Authentication Functions
export const firebaseAuth = {
  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Register new user
  signUp: async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: userData.fullName || 'New User',
        phone: userData.phone || '',
        company: userData.company || '',
        bio: userData.bio || '',
        profileImageUrl: userData.profileImageUrl || '',
        subscriptionPlan: userData.subscriptionPlan || 'free',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stats: {
          videosCreated: 0,
          photosUploaded: 0,
          totalVideoDuration: 0,
          lastVideoCreated: null
        },
        referral: {
          code: generateReferralCode(),
          referredBy: userData.referredBy || null,
          referralsCount: 0,
          rewardsEarned: 0
        }
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete user account
  deleteAccount: async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await deleteUser(user);
        return { success: true };
      }
      return { success: false, error: 'No user logged in' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  }
};

// User Data Management Functions
export const userData = {
  // Get user profile
  getProfile: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { success: true, data: userDoc.data() };
      }
      return { success: false, error: 'User not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update user profile
  updateProfile: async (userId, data) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete user account and all data
  deleteAccount: async (userId) => {
    try {
      // Delete user document
      await deleteDoc(doc(db, 'users', userId));
      
      // Delete user's content
      const contentQuery = query(collection(db, 'content'), where('userId', '==', userId));
      const contentSnapshot = await getDocs(contentQuery);
      
      const deletePromises = contentSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Delete user's referrals
      const referralQuery = query(collection(db, 'referrals'), where('referrerId', '==', userId));
      const referralSnapshot = await getDocs(referralQuery);
      
      const referralDeletePromises = referralSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(referralDeletePromises);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Content Storage Functions
export const contentStorage = {
  // Upload file
  uploadFile: async (file, userId, metadata) => {
    try {
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `content/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Save content metadata to Firestore
      const contentData = {
        userId,
        fileName,
        downloadURL,
        contentType: file.type.startsWith('image/') ? 'image' : 'video',
        size: file.size,
        title: metadata.title || file.name,
        description: metadata.description || '',
        createdAt: serverTimestamp(),
        location: metadata.location || null
      };
      
      await setDoc(doc(db, 'content', `${userId}_${Date.now()}`), contentData);
      
      // Update user stats
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedStats = {
          ...userData.stats,
          photosUploaded: file.type.startsWith('image/') ? userData.stats.photosUploaded + 1 : userData.stats.photosUploaded,
          videosCreated: file.type.startsWith('video/') ? userData.stats.videosCreated + 1 : userData.stats.videosCreated,
          lastVideoCreated: file.type.startsWith('video/') ? serverTimestamp() : userData.stats.lastVideoCreated
        };
        
        await updateDoc(userRef, { stats: updatedStats });
      }
      
      return { success: true, data: contentData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user content
  getUserContent: async (userId) => {
    try {
      const contentQuery = query(
        collection(db, 'content'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const contentSnapshot = await getDocs(contentQuery);
      
      const content = contentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete content
  deleteContent: async (contentId, userId) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'content', contentId));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Referral Management Functions
export const referralManager = {
  // Generate unique referral code
  generateCode: () => {
    return generateReferralCode();
  },

  // Validate referral code
  validateCode: async (code) => {
    try {
      const usersQuery = query(collection(db, 'users'), where('referral.code', '==', code));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (!usersSnapshot.empty) {
        const referrer = usersSnapshot.docs[0].data();
        return { success: true, referrer };
      }
      
      return { success: false, error: 'Invalid referral code' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Apply referral
  applyReferral: async (newUserId, referralCode) => {
    try {
      // Validate referral code
      const validation = await referralManager.validateCode(referralCode);
      if (!validation.success) {
        return validation;
      }
      
      const referrer = validation.referrer;
      
      // Create referral record
      await setDoc(doc(db, 'referrals', `${referrer.uid}_${newUserId}`), {
        referrerId: referrer.uid,
        referredUserId: newUserId,
        referralCode,
        status: 'completed',
        createdAt: serverTimestamp(),
        rewards: {
          referrer: {
            credits: 10,
            type: 'signup_bonus'
          },
          referred: {
            credits: 5,
            type: 'welcome_bonus'
          }
        }
      });
      
      // Update referrer's stats
      await updateDoc(doc(db, 'users', referrer.uid), {
        'referral.referralsCount': referrer.referral.referralsCount + 1,
        'referral.rewardsEarned': referrer.referral.rewardsEarned + 10
      });
      
      // Update new user's profile
      await updateDoc(doc(db, 'users', newUserId), {
        'referral.referredBy': referrer.uid
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get referral stats
  getReferralStats: async (userId) => {
    try {
      const referralsQuery = query(
        collection(db, 'referrals'), 
        where('referrerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const referralsSnapshot = await getDocs(referralsQuery);
      
      const referrals = referralsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: referrals };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Location Data Functions
export const locationService = {
  // Save location data
  saveLocation: async (userId, locationData) => {
    try {
      const locationDoc = {
        userId,
        ...locationData,
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'locations', `${userId}_${Date.now()}`), locationDoc);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user locations
  getUserLocations: async (userId) => {
    try {
      const locationsQuery = query(
        collection(db, 'locations'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const locationsSnapshot = await getDocs(locationsQuery);
      
      const locations = locationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: locations };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Utility Functions
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Session Management
export const sessionManager = {
  // Get current session
  getCurrentSession: () => {
    return auth.currentUser;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return auth.currentUser !== null;
  },

  // Get user ID
  getUserId: () => {
    return auth.currentUser?.uid || null;
  },

  // Get user token
  getToken: async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }
};

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, signOut, GoogleAuthProvider, signInWithPopup, OAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../config/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google Provider
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Firebase Authentication Service
export const firebaseAuthService = {
  // Check if user exists
  async checkUserExists(email: string): Promise<boolean> {
    try {
      // In Firebase, we need to check Firestore for user metadata
      const userDoc = await getDoc(doc(db, 'users', email));
      return userDoc.exists();
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  },

  // Create user with email and password
  async createUser(email: string, password: string): Promise<any> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Store user metadata in Firestore
      await setDoc(doc(db, 'users', email), {
        uid: userCredential.user.uid,
        email: email,
        createdAt: serverTimestamp(),
        emailVerified: false,
        isActive: true
      });

      return {
        success: true,
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          emailVerified: userCredential.user.emailVerified
        }
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Sign in user
  async signInUser(email: string, password: string): Promise<any> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login in Firestore
      await updateDoc(doc(db, 'users', email), {
        lastLoginAt: serverTimestamp()
      });

      return {
        success: true,
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          emailVerified: userCredential.user.emailVerified
        }
      };
    } catch (error: any) {
      console.error('Error signing in user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<any> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Store user metadata in Firestore if not exists
      const userDoc = await getDoc(doc(db, 'users', user.email!));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.email!), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: 'google',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          emailVerified: user.emailVerified,
          isActive: true
        });
      } else {
        // Update last login
        await updateDoc(doc(db, 'users', user.email!), {
          lastLoginAt: serverTimestamp()
        });
      }

      return {
        success: true,
        user: {
          id: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: 'google',
          emailVerified: user.emailVerified
        }
      };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Sign in with Apple
  async signInWithApple(): Promise<any> {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const user = result.user;
      
      // Store user metadata in Firestore if not exists
      const userDoc = await getDoc(doc(db, 'users', user.email!));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.email!), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Apple User',
          photoURL: user.photoURL,
          provider: 'apple',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          emailVerified: user.emailVerified,
          isActive: true
        });
      } else {
        // Update last login
        await updateDoc(doc(db, 'users', user.email!), {
          lastLoginAt: serverTimestamp()
        });
      }

      return {
        success: true,
        user: {
          id: user.uid,
          email: user.email,
          displayName: user.displayName || 'Apple User',
          photoURL: user.photoURL,
          provider: 'apple',
          emailVerified: user.emailVerified
        }
      };
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  async signOutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  // Get current user
  getCurrentUser(): any {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: any) => void) {
    return auth.onAuthStateChanged(callback);
  }
};

export { auth, db };

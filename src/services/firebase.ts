/**
 * Firebase Service - Unified Firebase SDK Integration
 *
 * This module provides all Firebase client-side functionality:
 * - Authentication (Firebase Auth)
 * - Database (Firestore)
 * - Storage (Firebase Storage)
 * - Cloud Functions (callable functions)
 */

import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import firebaseConfig from "../config/firebase";

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
// Use named database 'imob-motion' instead of default
const db = getFirestore(app, "imob-motion");
const storage = getStorage(app);
const functions = getFunctions(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");

// ==================== AUTHENTICATION ====================

export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      let errorMessage = "Login failed";

      switch (firebaseError.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email. Please sign up first.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = firebaseError.message || "Login failed";
      }

      return { success: false, error: errorMessage };
    }
  },

  /**
   * Create new account with email and password
   * Note: User document is created by Cloud Function trigger (onUserCreate)
   */
  async signUp(
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Note: User document is automatically created by onUserCreate Cloud Function
      // We don't need to create it here!

      return { success: true, user: userCredential.user };
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      let errorMessage = "Sign up failed";

      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already registered. Please sign in.";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        default:
          errorMessage = firebaseError.message || "Sign up failed";
      }

      return { success: false, error: errorMessage };
    }
  },

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message || "Google sign in failed" };
    }
  },

  /**
   * Sign in with Apple
   */
  async signInWithApple(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      return { success: true, user: result.user };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message || "Apple sign in failed" };
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    await signOut(auth);
    localStorage.removeItem("user");
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message || "Failed to send reset email" };
    }
  },

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Get ID token for API calls (if needed)
   */
  async getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  },
};

// ==================== USER DATA ====================

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  stats: {
    videosCreated: number;
    photosUploaded: number;
    totalVideoSeconds: number;
  };
  settings: {
    notifications: {
      email: boolean;
      projectUpdates: boolean;
      marketing: boolean;
    };
    video: {
      defaultQuality: string;
      defaultDurationSeconds: number;
      autosave: boolean;
    };
  };
  subscription: {
    planId: string;
    status: string;
    stripeCustomerId: string | null;
    storageQuotaBytes: number;
  };
  credits: {
    availableSeconds: number;
    usedSeconds: number;
  };
  referral: {
    code: string;
    referredBy: string | null;
    totalReferrals: number;
  };
}

export const userService = {
  /**
   * Get user profile
   */
  async getProfile(uid: string): Promise<UserData | null> {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  },

  /**
   * Update user profile
   */
  async updateProfile(
    uid: string,
    data: Partial<UserData>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, "users", uid), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message };
    }
  },

  /**
   * Listen to user profile changes (realtime)
   */
  onProfileChange(uid: string, callback: (data: UserData | null) => void): () => void {
    return onSnapshot(doc(db, "users", uid), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserData);
      } else {
        callback(null);
      }
    });
  },
};

// ==================== PROJECTS ====================

export interface Project {
  id?: string;
  uid: string;
  title: string;
  status: "draft" | "generating" | "completed" | "failed";
  stepState: {
    photos: boolean;
    branding: boolean;
    music: boolean;
    address: boolean;
    summary: boolean;
  };
  branding: {
    enabled: boolean;
    logoAssetId: string | null;
  };
  music: {
    enabled: boolean;
    trackAssetId: string | null;
  };
  address: {
    text: string;
    placeId: string;
    lat: number;
    lng: number;
  };
  videoConfig: {
    durationSeconds: number;
    resolution: string;
    fps: number;
    quality: string;
  };
  billing: {
    useFreeCredit: boolean;
    paymentStatus: string;
  };
  output: {
    videoAssetId: string | null;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const projectService = {
  /**
   * Create a new project
   */
  async create(
    uid: string,
    title: string
  ): Promise<{ success: boolean; projectId?: string; error?: string }> {
    try {
      const projectRef = doc(collection(db, "projects"));
      const project: Omit<Project, "id"> = {
        uid,
        title,
        status: "draft",
        stepState: {
          photos: false,
          branding: false,
          music: false,
          address: false,
          summary: false,
        },
        branding: {
          enabled: false,
          logoAssetId: null,
        },
        music: {
          enabled: false,
          trackAssetId: null,
        },
        address: {
          text: "",
          placeId: "",
          lat: 0,
          lng: 0,
        },
        videoConfig: {
          durationSeconds: 30,
          resolution: "1920x1080",
          fps: 30,
          quality: "high",
        },
        billing: {
          useFreeCredit: false,
          paymentStatus: "not_required",
        },
        output: {
          videoAssetId: null,
        },
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(projectRef, project);
      return { success: true, projectId: projectRef.id };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message };
    }
  },

  /**
   * Get user's projects
   */
  async getUserProjects(uid: string): Promise<Project[]> {
    const q = query(
      collection(db, "projects"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[];
  },

  /**
   * Get single project
   */
  async getProject(projectId: string): Promise<Project | null> {
    const projectDoc = await getDoc(doc(db, "projects", projectId));
    if (projectDoc.exists()) {
      return { id: projectDoc.id, ...projectDoc.data() } as Project;
    }
    return null;
  },

  /**
   * Update project
   */
  async update(
    projectId: string,
    data: Partial<Project>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, "projects", projectId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message };
    }
  },

  /**
   * Delete project
   */
  async delete(projectId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteDoc(doc(db, "projects", projectId));
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message };
    }
  },

  /**
   * Listen to project changes (realtime)
   */
  onProjectChange(projectId: string, callback: (data: Project | null) => void): () => void {
    return onSnapshot(doc(db, "projects", projectId), (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as Project);
      } else {
        callback(null);
      }
    });
  },

  /**
   * Listen to user's projects (realtime)
   */
  onUserProjectsChange(uid: string, callback: (projects: Project[]) => void): () => void {
    const q = query(
      collection(db, "projects"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      callback(projects);
    });
  },
};

// ==================== STORAGE ====================

export const storageService = {
  /**
   * Upload file to user's folder
   */
  async uploadFile(
    uid: string,
    file: File,
    path: string
  ): Promise<{ success: boolean; url?: string; storagePath?: string; error?: string }> {
    try {
      const storagePath = `users/${uid}/${path}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      return { success: true, url, storagePath };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message };
    }
  },

  /**
   * Upload photo for project
   */
  async uploadProjectPhoto(
    uid: string,
    projectId: string,
    file: File
  ): Promise<{ success: boolean; url?: string; storagePath?: string; error?: string }> {
    return this.uploadFile(uid, file, `projects/${projectId}/photos`);
  },

  /**
   * Get download URL for a storage path
   */
  async getDownloadURL(storagePath: string): Promise<string | null> {
    try {
      const storageRef = ref(storage, storagePath);
      return await getDownloadURL(storageRef);
    } catch {
      return null;
    }
  },

  /**
   * Delete file
   */
  async deleteFile(storagePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message };
    }
  },
};

// ==================== CLOUD FUNCTIONS ====================

export const cloudFunctions = {
  /**
   * Create video generation job
   */
  async createVideoJob(
    projectId: string,
    photos: string[],
    config: {
      duration: number;
      aspectRatio: string;
      prompt?: string;
    }
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      const createVideoJobFn = httpsCallable<
        { projectId: string; photos: string[]; config: typeof config },
        { jobId: string; status: string }
      >(functions, "createVideoJob");

      const result = await createVideoJobFn({ projectId, photos, config });
      return { success: true, jobId: result.data.jobId };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message };
    }
  },
};

// ==================== JOBS ====================

export interface Job {
  id?: string;
  uid: string;
  projectId: string;
  status: "processing" | "completed" | "failed";
  falModel: string;
  falRequestId: string;
  input: {
    prompt: string;
    imageUrls: string[];
    aspectRatio: string;
    duration: number;
  };
  output: {
    videoAssetId: string | null;
  };
  error?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export const jobService = {
  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<Job | null> {
    const jobDoc = await getDoc(doc(db, "jobs", jobId));
    if (jobDoc.exists()) {
      return { id: jobDoc.id, ...jobDoc.data() } as Job;
    }
    return null;
  },

  /**
   * Listen to job status (realtime)
   */
  onJobChange(jobId: string, callback: (job: Job | null) => void): () => void {
    return onSnapshot(doc(db, "jobs", jobId), (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as Job);
      } else {
        callback(null);
      }
    });
  },

  /**
   * Get user's jobs
   */
  async getUserJobs(uid: string): Promise<Job[]> {
    const q = query(
      collection(db, "jobs"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Job[];
  },
};

// Export Firebase instances for direct use if needed
export { auth, db, storage, functions };

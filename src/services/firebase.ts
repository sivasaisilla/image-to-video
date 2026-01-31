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
export const auth = getAuth(app);
// Use named database 'imob-motion' because this project uses a named database
// (the console shows a named DB). Revert to default only if you created the default DB.
export const db = getFirestore(app, "imob-motion");
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");

/**
 * Helper function to get current user ID
 * Used by services that need to enforce user ownership
 */
export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid || null;
}

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
   * Backwards-compatible alias used by some components
   */
  async getUserById(uid: string): Promise<UserData | null> {
    return await this.getProfile(uid);
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

// ==================== PHOTOS ====================

export interface ProjectPhoto {
  id?: string;
  projectId: string;
  uid: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  storagePath: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  order: number;
  duration?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const photoService = {
  /**
   * Add photo to project with thumbnail generation
   */
  async addPhoto(
    uid: string,
    projectId: string,
    file: File,
    order: number,
    duration: number = 3
  ): Promise<{ success: boolean; photo?: ProjectPhoto; error?: string }> {
    try {
      // Dynamic import to avoid circular dependencies
      const { generateThumbnail } = await import('./imageService');

      // Upload main file to Storage
      const storagePath = `users/${uid}/projects/${projectId}/photos/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // Generate thumbnail
      let thumbnailPath: string | undefined;
      let thumbnailUrl: string | undefined;
      try {
        const thumbnailBase64 = await generateThumbnail(file, 200, 150, 0.8);
        const thumbResponse = await fetch(thumbnailBase64);
        const thumbBlob = await thumbResponse.blob();
        const thumbFile = new File([thumbBlob], `${Date.now()}_thumb.jpg`, { type: 'image/jpeg' });
        
        thumbnailPath = `users/${uid}/projects/${projectId}/photos/thumbnails/${Date.now()}_thumb.jpg`;
        const thumbRef = ref(storage, thumbnailPath);
        await uploadBytes(thumbRef, thumbFile);
        thumbnailUrl = await getDownloadURL(thumbRef);
      } catch (thumbError) {
        console.warn('Thumbnail generation failed:', thumbError);
        // Continue without thumbnail
      }

      // Create photo document in Firestore
      const photosRef = collection(db, `projects/${projectId}/photos`);
      const docRef = doc(photosRef);
      const photoDoc = {
        projectId,
        uid,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        url,
        storagePath,
        thumbnailPath,
        thumbnailUrl,
        order,
        duration,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(docRef, photoDoc);
      return {
        success: true,
        photo: { id: docRef.id, ...photoDoc } as ProjectPhoto,
      };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message };
    }
  },

  /**
   * Get all photos for a project
   */
  async getProjectPhotos(projectId: string): Promise<ProjectPhoto[]> {
    try {
      const photosRef = collection(db, `projects/${projectId}/photos`);
      const q = query(photosRef, orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProjectPhoto[];
    } catch (error) {
      console.error("Error fetching photos:", error);
      return [];
    }
  },

  /**
   * Reorder photos (bulk update)
   */
  async reorderPhotos(
    projectId: string,
    photoOrders: { id: string; order: number }[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      for (const { id, order } of photoOrders) {
        const photoRef = doc(db, `projects/${projectId}/photos/${id}`);
        await updateDoc(photoRef, {
          order,
          updatedAt: serverTimestamp(),
        });
      }
      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message };
    }
  },

  /**
   * Delete photo
   */
  async deletePhoto(
    projectId: string,
    photoId: string,
    storagePath: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);

      const photoRef = doc(db, `projects/${projectId}/photos/${photoId}`);
      await deleteDoc(photoRef);

      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message };
    }
  },

  /**
   * Listen to photos changes (realtime)
   */
  onPhotosChange(
    projectId: string,
    callback: (photos: ProjectPhoto[]) => void
  ): () => void {
    const photosRef = collection(db, `projects/${projectId}/photos`);
    const q = query(photosRef, orderBy("order", "asc"));
    return onSnapshot(q, (snapshot) => {
      const photos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProjectPhoto[];
      callback(photos);
    });
  },
};

// ==================== ASSETS ====================

export interface Asset {
  id?: string;
  uid: string;
  type: "logo" | "music" | "video";
  name: string;
  url: string;
  storagePath: string;
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const assetService = {
  /**
   * Upload asset
   */
  async uploadAsset(
    uid: string,
    type: "logo" | "music" | "video",
    file: File,
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; asset?: Asset; error?: string }> {
    try {
      const storagePath = `users/${uid}/assets/${type}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const assetsRef = collection(db, "assets");
      const docRef = doc(assetsRef);
      const assetDoc = {
        uid,
        type,
        name: file.name,
        url,
        storagePath,
        ...(metadata && { metadata }),  // Only include if defined
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(docRef, assetDoc);
      return {
        success: true,
        asset: { id: docRef.id, ...assetDoc } as Asset,
      };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message };
    }
  },

  /**
   * Get user assets by type
   */
  async getUserAssets(uid: string, type?: string): Promise<Asset[]> {
    try {
      const assetsRef = collection(db, "assets");
      let q;
      if (type) {
        q = query(
          assetsRef,
          where("uid", "==", uid),
          where("type", "==", type),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(
          assetsRef,
          where("uid", "==", uid),
          orderBy("createdAt", "desc")
        );
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Asset[];
    } catch (error) {
      console.error("Error fetching assets:", error);
      return [];
    }
  },

  /**
   * Delete asset
   */
  async deleteAsset(
    assetId: string,
    storagePath: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);

      await deleteDoc(doc(db, "assets", assetId));

      return { success: true };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message };
    }
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
   * Get signed download URL for a storage path (for videos with expiry)
   */
  async getSignedUrl(
    storagePath: string,
    expirationMinutes: number = 60
  ): Promise<{ success: boolean; url?: string; expiresAt?: number; error?: string }> {
    // Signed URLs must be created server-side (admin SDK). Use cloud function helper.
    try {
      const result = await cloudFunctions.getSignedVideoUrl(storagePath, expirationMinutes);
      return result;
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message };
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

  /**
   * Get signed video URL for playback
   */
  async getSignedVideoUrl(
    storagePath: string,
    expirationMinutes: number = 60
  ): Promise<{ success: boolean; url?: string; expiresAt?: number; error?: string }> {
    try {
      const getSignedVideoUrlFn = httpsCallable<
        { storagePath: string; expirationMinutes?: number },
        { url: string; expiresAt: number }
      >(functions, "getSignedVideoUrl");

      const result = await getSignedVideoUrlFn({ storagePath, expirationMinutes });
      return { success: true, url: result.data.url, expiresAt: result.data.expiresAt };
    } catch (error: unknown) {
      const firebaseError = error as { message?: string };
      return { success: false, error: firebaseError.message };
    }
  },

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(
    planId: string,
    planName: string,
    priceInCents: number,
    creditsAmount: number,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ success: boolean; sessionId?: string; url?: string; error?: string }> {
    try {
      const createCheckoutSessionFn = httpsCallable<
        {
          planId: string;
          planName: string;
          priceInCents: number;
          creditsAmount: number;
          successUrl: string;
          cancelUrl: string;
        },
        { sessionId: string; url: string }
      >(functions, "createCheckoutSession");

      const result = await createCheckoutSessionFn({
        planId,
        planName,
        priceInCents,
        creditsAmount,
        successUrl,
        cancelUrl,
      });

      return { success: true, sessionId: result.data.sessionId, url: result.data.url };
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


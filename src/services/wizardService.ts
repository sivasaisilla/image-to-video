import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, getCurrentUserId } from './firebase';

export interface WizardData {
  projectId: string;
  step1: {
    photosCount: number;
  };
  step2: {
    showLogoOnVideo: boolean;
    logoUrl?: string;
  };
  step3: {
    selectedMusicId?: string;
  };
  step4: {
    address: string;
    city?: string;
    state?: string;
    propertyType?: string;
  };
  step5: {
    // Summary data - read-only
  };
  createdAt?: any;
  updatedAt?: any;
}

export const wizardService = {
  /**
   * Create or update wizard data for a project
   */
  async saveWizardData(projectId: string, data: Partial<WizardData>): Promise<void> {
    try {
      const uid = getCurrentUserId();
      if (!uid) throw new Error('User not authenticated');

      const docRef = doc(db, 'users', uid, 'wizard_sessions', projectId);
      
      await setDoc(docRef, {
        projectId,
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving wizard data:', error);
      throw error;
    }
  },

  /**
   * Get wizard data for a project
   */
  async getWizardData(projectId: string): Promise<WizardData | null> {
    try {
      const uid = getCurrentUserId();
      if (!uid) throw new Error('User not authenticated');

      const docRef = doc(db, 'users', uid, 'wizard_sessions', projectId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as WizardData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching wizard data:', error);
      return null;
    }
  },

  /**
   * Update specific step in wizard
   */
  async updateStep(projectId: string, step: keyof Omit<WizardData, 'projectId' | 'createdAt' | 'updatedAt'>, data: any): Promise<void> {
    try {
      const uid = getCurrentUserId();
      if (!uid) throw new Error('User not authenticated');

      const docRef = doc(db, 'users', uid, 'wizard_sessions', projectId);
      
      await updateDoc(docRef, {
        [step]: data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating step ${step}:`, error);
      throw error;
    }
  },

  /**
   * Delete wizard session
   */
  async deleteWizardSession(projectId: string): Promise<void> {
    try {
      const uid = getCurrentUserId();
      if (!uid) throw new Error('User not authenticated');

      const docRef = doc(db, 'users', uid, 'wizard_sessions', projectId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting wizard session:', error);
      throw error;
    }
  },

  /**
   * Get or create default wizard data
   */
  getDefaultData(projectId: string): WizardData {
    return {
      projectId,
      step1: { photosCount: 0 },
      step2: { showLogoOnVideo: false },
      step3: { selectedMusicId: undefined },
      step4: { address: '', city: '', state: '', propertyType: 'House' },
      step5: {}
    };
  }
};

import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface ImportedMedia {
  id: string;
  url: string;
  fileName: string;
  size: number;
  source: 'google-drive' | 'dropbox' | 'url';
  uploadedAt: Date;
  thumbnailUrl?: string;
}

export interface ImportProgress {
  current: number;
  total: number;
  fileName: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

// Google Drive Integration
export const googleDriveService = {
  // Initialize Google Drive API
  async initGoogleDrive(): Promise<boolean> {
    try {
      // In production, this would use gapi.load and authenticate
      // For now, we'll use a mock implementation
      return true;
    } catch (error) {
      console.error('Error initializing Google Drive:', error);
      return false;
    }
  },

  // Get authorization from user
  async authorize(): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      // In production, this would initiate OAuth flow with Google
      // Using window.open for OAuth redirect
      const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        return { success: false, error: 'Google Client ID not configured' };
      }

      const redirectUri = `${window.location.origin}/auth/google-drive`;
      const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.readonly');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

      // For MVP, we'll just return a placeholder
      return { success: true, token: 'mock-google-token' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // List files from Google Drive
  async listFiles(token: string): Promise<{ files: any[]; error?: string }> {
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files?q=trashed=false&spaces=drive&pageSize=50&fields=files(id,name,mimeType,size,thumbnailLink,webViewLink)', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Google Drive files');
      }

      const data = await response.json();
      return { files: data.files || [] };
    } catch (error: any) {
      return { files: [], error: error.message };
    }
  },

  // Download and upload file from Google Drive
  async importFile(fileId: string, fileName: string, token: string, userId: string, projectId: string, onProgress?: (progress: ImportProgress) => void): Promise<{ success: boolean; importedMedia?: ImportedMedia; error?: string }> {
    try {
      onProgress?.({ current: 0, total: 100, fileName, status: 'uploading' });

      // Get file download URL
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to download file from Google Drive');
      }

      const blob = await response.blob();
      onProgress?.({ current: 50, total: 100, fileName, status: 'uploading' });

      // Upload to Firebase Storage
      const storageRef = ref(storage, `users/${userId}/projects/${projectId}/imports/${Date.now()}-${fileName}`);
      const result = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(result.ref);

      onProgress?.({ current: 100, total: 100, fileName, status: 'completed' });

      return {
        success: true,
        importedMedia: {
          id: result.metadata.name!,
          url: downloadURL,
          fileName,
          size: blob.size,
          source: 'google-drive',
          uploadedAt: new Date()
        }
      };
    } catch (error: any) {
      onProgress?.({ current: 0, total: 100, fileName, status: 'failed', error: error.message });
      return { success: false, error: error.message };
    }
  }
};

// Dropbox Integration
export const dropboxService = {
  // Initialize Dropbox
  async initDropbox(): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      console.error('Error initializing Dropbox:', error);
      return false;
    }
  },

  // Authorize with Dropbox
  async authorize(): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const clientId = (import.meta as any).env.VITE_DROPBOX_CLIENT_ID;
      if (!clientId) {
        return { success: false, error: 'Dropbox Client ID not configured' };
      }

      const redirectUri = `${window.location.origin}/auth/dropbox`;
      const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=files.content.read`;

      // For MVP, return placeholder
      return { success: true, token: 'mock-dropbox-token' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // List files from Dropbox
  async listFiles(token: string): Promise<{ files: any[]; error?: string }> {
    try {
      const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: '' })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Dropbox files');
      }

      const data = await response.json();
      return { files: data.entries || [] };
    } catch (error: any) {
      return { files: [], error: error.message };
    }
  },

  // Download and upload file from Dropbox
  async importFile(filePath: string, fileName: string, token: string, userId: string, projectId: string, onProgress?: (progress: ImportProgress) => void): Promise<{ success: boolean; importedMedia?: ImportedMedia; error?: string }> {
    try {
      onProgress?.({ current: 0, total: 100, fileName, status: 'uploading' });

      // Download from Dropbox
      const response = await fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Dropbox-API-Arg': JSON.stringify({ path: filePath })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file from Dropbox');
      }

      const blob = await response.blob();
      onProgress?.({ current: 50, total: 100, fileName, status: 'uploading' });

      // Upload to Firebase Storage
      const storageRef = ref(storage, `users/${userId}/projects/${projectId}/imports/${Date.now()}-${fileName}`);
      const result = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(result.ref);

      onProgress?.({ current: 100, total: 100, fileName, status: 'completed' });

      return {
        success: true,
        importedMedia: {
          id: result.metadata.name!,
          url: downloadURL,
          fileName,
          size: blob.size,
          source: 'dropbox',
          uploadedAt: new Date()
        }
      };
    } catch (error: any) {
      onProgress?.({ current: 0, total: 100, fileName, status: 'failed', error: error.message });
      return { success: false, error: error.message };
    }
  }
};

// URL Import Service
export const urlImportService = {
  // Validate URL
  isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      const pathname = urlObj.pathname.toLowerCase();
      return validExtensions.some(ext => pathname.endsWith(ext));
    } catch {
      return false;
    }
  },

  // Download and upload from URL
  async importFromUrl(imageUrl: string, userId: string, projectId: string, onProgress?: (progress: ImportProgress) => void): Promise<{ success: boolean; importedMedia?: ImportedMedia; error?: string }> {
    try {
      if (!urlImportService.isValidImageUrl(imageUrl)) {
        return { success: false, error: 'Invalid or unsupported image URL' };
      }

      const fileName = imageUrl.split('/').pop() || 'imported-image.jpg';
      onProgress?.({ current: 0, total: 100, fileName, status: 'uploading' });

      // Fetch image from URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to download image from URL');
      }

      const blob = await response.blob();
      
      // Validate it's an image
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL does not point to an image');
      }

      onProgress?.({ current: 50, total: 100, fileName, status: 'uploading' });

      // Upload to Firebase Storage
      const storageRef = ref(storage, `users/${userId}/projects/${projectId}/imports/${Date.now()}-${fileName}`);
      const result = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(result.ref);

      onProgress?.({ current: 100, total: 100, fileName, status: 'completed' });

      return {
        success: true,
        importedMedia: {
          id: result.metadata.name!,
          url: downloadURL,
          fileName,
          size: blob.size,
          source: 'url',
          uploadedAt: new Date()
        }
      };
    } catch (error: any) {
      onProgress?.({ current: 0, total: 100, fileName: 'import', status: 'failed', error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Import multiple URLs
  async importMultipleUrls(urls: string[], userId: string, projectId: string, onProgress?: (progress: ImportProgress) => void): Promise<{ success: boolean; importedMedia: ImportedMedia[]; errors: string[] }> {
    const importedMedia: ImportedMedia[] = [];
    const errors: string[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      onProgress?.({ current: i, total: urls.length, fileName: url, status: 'uploading' });
      
      const result = await urlImportService.importFromUrl(url, userId, projectId);
      if (result.success && result.importedMedia) {
        importedMedia.push(result.importedMedia);
      } else {
        errors.push(`Failed to import ${url}: ${result.error}`);
      }
    }

    return {
      success: errors.length === 0,
      importedMedia,
      errors
    };
  }
};

// Batch Import Service
export const batchImportService = {
  // Import from multiple sources with progress tracking
  async importBatch(
    items: Array<{ type: 'google-drive' | 'dropbox' | 'url'; data: any; token?: string }>,
    userId: string,
    projectId: string,
    onProgress?: (progress: { current: number; total: number; fileName: string; status: string }) => void
  ): Promise<{ success: boolean; importedMedia: ImportedMedia[]; errors: string[] }> {
    const importedMedia: ImportedMedia[] = [];
    const errors: string[] = [];
    const total = items.length;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      try {
        if (item.type === 'url') {
          const result = await urlImportService.importFromUrl(item.data.url, userId, projectId, (p) => {
            onProgress?.({ ...p, current: i + (p.current / 100) });
          });
          
          if (result.success && result.importedMedia) {
            importedMedia.push(result.importedMedia);
          } else {
            errors.push(result.error || 'Unknown error');
          }
        } else if (item.type === 'google-drive' && item.token) {
          const result = await googleDriveService.importFile(
            item.data.id,
            item.data.name,
            item.token,
            userId,
            projectId,
            (p) => {
              onProgress?.({ ...p, current: i + (p.current / 100) });
            }
          );
          
          if (result.success && result.importedMedia) {
            importedMedia.push(result.importedMedia);
          } else {
            errors.push(result.error || 'Unknown error');
          }
        } else if (item.type === 'dropbox' && item.token) {
          const result = await dropboxService.importFile(
            item.data.path,
            item.data.name,
            item.token,
            userId,
            projectId,
            (p) => {
              onProgress?.({ ...p, current: i + (p.current / 100) });
            }
          );
          
          if (result.success && result.importedMedia) {
            importedMedia.push(result.importedMedia);
          } else {
            errors.push(result.error || 'Unknown error');
          }
        }
      } catch (error: any) {
        errors.push(`Error importing item ${i + 1}: ${error.message}`);
      }

      onProgress?.({ current: i + 1, total, fileName: `Item ${i + 1}/${total}`, status: 'processing' });
    }

    return {
      success: errors.length === 0,
      importedMedia,
      errors
    };
  }
};

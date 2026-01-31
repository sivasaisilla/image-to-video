/**
 * Image Service - Handle image processing utilities
 * 
 * This includes thumbnail generation, image optimization, etc.
 */

/**
 * Generate thumbnail from image file or URL
 * Returns base64 encoded thumbnail
 */
export async function generateThumbnail(
  imageSource: File | string,
  maxWidth: number = 200,
  maxHeight: number = 150,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        // Create canvas and draw thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64
        const thumbnail = canvas.toDataURL('image/jpeg', quality);
        resolve(thumbnail);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Handle both File and URL inputs
    if (imageSource instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(imageSource);
    } else {
      img.src = imageSource;
    }
  });
}

/**
 * Upload thumbnail to Firebase Storage
 */
export async function uploadThumbnail(
  thumbnailBase64: string,
  uid: string,
  projectId: string,
  photoId: string,
  storageService: any
): Promise<{ success: boolean; url?: string; storagePath?: string; error?: string }> {
  try {
    // Convert base64 to blob
    const response = await fetch(thumbnailBase64);
    const blob = await response.blob();
    const file = new File([blob], `${photoId}_thumb.jpg`, { type: 'image/jpeg' });
    
    // Upload using storage service
    const storagePath = `users/${uid}/projects/${projectId}/thumbnails/${Date.now()}_thumb.jpg`;
    return storageService.uploadFile(uid, file, `projects/${projectId}/thumbnails`);
  } catch (error: unknown) {
    const firebaseError = error as { message?: string };
    return { success: false, error: firebaseError.message };
  }
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  imageSource: File | string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    if (imageSource instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(imageSource);
    } else {
      img.src = imageSource;
    }
  });
}

/**
 * Compress image file
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.9
): Promise<File> {
  const thumbnail = await generateThumbnail(file, maxWidth, maxHeight, quality);
  
  return new Promise((resolve) => {
    fetch(thumbnail).then((res) => res.blob()).then((blob) => {
      const compressedFile = new File([blob], file.name, {
        type: 'image/jpeg',
        lastModified: file.lastModified,
      });
      resolve(compressedFile);
    });
  });
}

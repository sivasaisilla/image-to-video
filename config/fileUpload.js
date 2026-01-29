const multer = require('multer');
const path = require('path');
const fs = require('fs');

// File validation settings
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Create user-specific upload directories
function createUserUploadDir(userId) {
  const userDir = path.join(__dirname, '..', 'uploads', `user_${userId}`);
  const imagesDir = path.join(userDir, 'images');
  const videosDir = path.join(userDir, 'videos');
  const thumbnailsDir = path.join(userDir, 'thumbnails');

  // Create directories if they don't exist
  [userDir, imagesDir, videosDir, thumbnailsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  return { userDir, imagesDir, videosDir, thumbnailsDir };
}

// File filter function
function fileFilter(req, file, cb) {
  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
  
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error('Invalid file type');
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }

  if (file.size > MAX_FILE_SIZE) {
    const error = new Error('File too large');
    error.code = 'FILE_TOO_LARGE';
    return cb(error, false);
  }

  cb(null, true);
}

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user.userId; // From authenticateToken middleware
    const { videosDir, imagesDir } = createUserUploadDir(userId);
    
    if (file.mimetype.startsWith('image/')) {
      cb(null, imagesDir);
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, videosDir);
    } else {
      cb(new Error('Invalid file type'), null);
    }
  },
  filename: function (req, file, cb) {
    const userId = req.user.userId;
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const extension = path.extname(originalName);
    
    const filename = `${userId}_${timestamp}_${originalName}${extension}`;
    cb(null, filename);
  }
});

// Multer middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5 // Maximum 5 files per upload
  }
});

// Single file upload middleware
const uploadSingle = upload.single('file');

// Multiple files upload middleware
const uploadMultiple = upload.array('files', 5);

// File utilities
const fileUtils = {
  // Get file info
  getFileInfo(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      return null;
    }
  },

  // Delete file
  deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },

  // Check if file exists
  fileExists(filePath) {
    return fs.existsSync(filePath);
  },

  // Get file URL for serving
  getFileUrl(userId, filename) {
    return `/uploads/user_${userId}/${filename}`;
  },

  // Get file path
  getFilePath(userId, filename) {
    const { userDir } = createUserUploadDir(userId);
    return path.join(userDir, filename);
  },

  // Validate file belongs to user
  validateUserFile(userId, filename) {
    const filePath = getFilePath(userId, filename);
    return fileExists(filePath);
  },

  // Get file type from filename
  getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const videoExts = ['.mp4', '.avi', '.mov', '.wmv', '.webm'];
    
    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    return 'unknown';
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  createUserUploadDir,
  fileUtils,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_FILE_SIZE
};

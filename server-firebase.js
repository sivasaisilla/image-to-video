// Firebase-based Backend Server
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { firebaseAuth, userData, contentStorage, referralManager, locationService, sessionManager } from './firebase-config.js';

const app = express();
const PORT = process.env.PORT || 3003;

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|wmv/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    const user = sessionManager.getCurrentSession();
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = { userId: user.uid, email: user.email };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== AUTHENTICATION ROUTES ====================

// Sign In
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await firebaseAuth.signIn(email, password);
    
    if (result.success) {
      const token = await sessionManager.getToken();
      res.json({
        success: true,
        user: {
          uid: result.user.uid,
          email: result.user.email
        },
        token
      });
    } else {
      res.status(401).json({ error: result.error });
    }
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Sign in failed' });
  }
});

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName, phone, referredBy } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Apply referral if provided
    let referralResult = { success: true };
    if (referredBy) {
      referralResult = await referralManager.validateCode(referredBy);
      if (!referralResult.success) {
        return res.status(400).json({ error: 'Invalid referral code' });
      }
    }

    const result = await firebaseAuth.signUp(email, password, {
      fullName,
      phone,
      referredBy: referralResult.success ? referredBy : null
    });

    if (result.success) {
      // Apply referral after successful signup
      if (referredBy && referralResult.success) {
        await referralManager.applyReferral(result.user.uid, referredBy);
      }

      const token = await sessionManager.getToken();
      res.json({
        success: true,
        user: {
          uid: result.user.uid,
          email: result.user.email
        },
        token
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Sign up failed' });
  }
});

// Sign Out
app.post('/api/auth/signout', async (req, res) => {
  try {
    const result = await firebaseAuth.signOut();
    res.json({ success: result.success });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ error: 'Sign out failed' });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await firebaseAuth.resetPassword(email);
    res.json({ success: result.success });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Reset password failed' });
  }
});

// ==================== USER PROFILE ROUTES ====================

// Get User Profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await userData.getProfile(userId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update User Profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const updates = req.body;
    
    const result = await userData.updateProfile(userId, updates);
    res.json({ success: result.success });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete User Account
app.delete('/api/user/account', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Delete from Firebase
    const authResult = await firebaseAuth.deleteAccount();
    if (!authResult.success) {
      return res.status(400).json({ error: authResult.error });
    }
    
    // Delete user data
    const dataResult = await userData.deleteAccount(userId);
    res.json({ success: dataResult.success });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// ==================== CONTENT ROUTES ====================

// Upload Content
app.post('/api/content/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { userId } = req.user;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const { title, description, location } = req.body;
    
    // Convert buffer to File object for Firebase
    const fileObj = new File([file.buffer], file.originalname, { type: file.mimetype });
    
    const result = await contentStorage.uploadFile(fileObj, userId, {
      title,
      description,
      location: location ? JSON.parse(location) : null
    });
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get User Content
app.get('/api/content/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;
    
    // Users can only access their own content
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await contentStorage.getUserContent(userId);
    
    if (result.success) {
      res.json({
        content: result.data,
        stats: {
          total: result.data.length,
          images: result.data.filter(item => item.contentType === 'image').length,
          videos: result.data.filter(item => item.contentType === 'video').length
        }
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Delete Content
app.delete('/api/content/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    // Verify content belongs to user
    const contentResult = await contentStorage.getUserContent(userId);
    if (contentResult.success) {
      const content = contentResult.data.find(item => item.id === id);
      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }
      
      const result = await contentStorage.deleteContent(id, userId);
      res.json({ success: result.success });
    } else {
      res.status(400).json({ error: 'Failed to verify content' });
    }
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// ==================== REFERRAL ROUTES ====================

// Get Referral Stats
app.get('/api/referral/stats', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const result = await referralManager.getReferralStats(userId);
    
    if (result.success) {
      res.json({
        referrals: result.data,
        totalReferrals: result.data.length,
        totalRewards: result.data.reduce((sum, ref) => sum + (ref.rewards?.referrer?.credits || 0), 0)
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({ error: 'Failed to fetch referral stats' });
  }
});

// Validate Referral Code
app.post('/api/referral/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Referral code is required' });
    }
    
    const result = await referralManager.validateCode(code);
    res.json(result);
  } catch (error) {
    console.error('Validate referral error:', error);
    res.status(500).json({ error: 'Failed to validate referral code' });
  }
});

// ==================== LOCATION ROUTES ====================

// Save Location
app.post('/api/location', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const locationData = req.body;
    
    const result = await locationService.saveLocation(userId, locationData);
    res.json({ success: result.success });
  } catch (error) {
    console.error('Save location error:', error);
    res.status(500).json({ error: 'Failed to save location' });
  }
});

// Get User Locations
app.get('/api/location/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;
    
    // Users can only access their own locations
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await locationService.getUserLocations(userId);
    res.json(result);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'iMOB-MOTION Firebase Backend',
    version: '1.0.0'
  });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 iMOB-MOTION Firebase Backend running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔥 Firebase Integration: Active`);
  console.log(`📊 Features: Auth, User Data, Content Storage, Referrals, Locations`);
});

export default app;

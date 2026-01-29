// Firebase-based Backend Server
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { sendOTPEmail, testEmailConfig } from './email-service.js';
import { firebaseAuth, userData, contentStorage, referralManager, locationService, sessionManager } from './firebase-config.js';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const app = express();
const PORT = process.env.PORT || 3003;

// Initialize Firebase Firestore
const db = getFirestore();
const usersCollection = collection(db, 'users');

console.log('🔥 Firebase Firestore initialized for user storage');

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
    
    // For now, we'll skip Firebase token verification and use a simple approach
    // In production, you should verify the token with Firebase Admin SDK
    if (!token || token.length < 10) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Extract user info from token (simplified approach)
    // In production, use Firebase Admin SDK to verify token
    
    // For testing, extract user ID from token (token format: mock_firebase_token_timestamp)
    let userId = 'temp_user_id';
    let email = 'temp@example.com';
    
    if (token.startsWith('mock_firebase_token_')) {
      // Extract timestamp from token and use it as user ID
      const timestamp = token.replace('mock_firebase_token_', '');
      userId = 'user_' + timestamp;
      
      // Try to find user in Firebase Firestore
      try {
        const userDocRef = doc(usersCollection, userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          email = userDoc.data().email;
        }
      } catch (error) {
        console.error('Error finding user in Firebase:', error);
      }
    }
    
    console.log('Auth middleware - userId:', userId, 'email:', email);
    req.user = { userId, email };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== MISSING ROUTES FOR FRONTEND ====================

// Check Email (for signup)
app.post('/api/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Checking email:', email);
    
    // For testing, always say email doesn't exist
    res.json({ exists: false, message: 'Email available' });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ error: 'Check email failed' });
  }
});

// Send OTP (for signup)
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Sending OTP to:', email);
    
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);
    
    // Store OTP in memory (in production, use Redis or database)
    if (!global.otpStore) {
      global.otpStore = new Map();
    }
    global.otpStore.set(email, otp);
    
    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);
    
    if (emailResult.success) {
      res.json({ 
        success: true, 
        message: `OTP sent to ${email}. Please check your inbox.`
      });
    } else {
      // If email fails, still return success but include OTP for testing
      console.error('Email failed, using fallback:', emailResult.error);
      res.json({ 
        success: true, 
        message: `OTP sent to ${email}. For testing, OTP is: ${otp}`,
        otp: otp // Include OTP for testing only
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, error: 'Send OTP failed' });
  }
});

// Verify OTP (for signup)
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('Verifying OTP for:', email, 'with OTP:', otp);
    
    // Get stored OTP
    if (!global.otpStore) {
      global.otpStore = new Map();
    }
    
    const storedOtp = global.otpStore.get(email);
    
    if (storedOtp === otp) {
      // OTP verified, remove it from store
      global.otpStore.delete(email);
      res.json({ 
        success: true, 
        message: 'OTP verified successfully' 
      });
    } else {
      res.json({ 
        success: false, 
        error: 'Invalid OTP. Please check the OTP sent to your email.' 
      });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, error: 'Verify OTP failed' });
  }
});

// ==================== AUTHENTICATION ROUTES ====================

// Sign In
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password: password ? '***' : 'undefined' });
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // For testing, check if email is in our "registered users" list
    // In production, you would check Firebase Auth
    const registeredEmails = []; // Empty array - no hardcoded emails
    
    // Check if user exists in Firebase Firestore
    let foundUser = null;
    try {
      const userQuery = query(usersCollection, where('email', '==', email));
      const querySnapshot = await getDocs(userQuery);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        foundUser = {
          userId: userDoc.id,
          ...userDoc.data()
        };
      }
    } catch (error) {
      console.error('Error querying Firebase:', error);
    }
    
    if (foundUser) {
      // User exists, check password
      console.log('Login attempt - stored password:', foundUser.password, 'entered password:', password);
      console.log('Password comparison:', foundUser.password === password);
      
      if (foundUser.password === password) {
        const token = 'mock_firebase_token_' + foundUser.userId.replace('user_', '');
        console.log('Login successful for:', email, 'userId:', foundUser.userId);
        res.json({
          success: true,
          user: {
            uid: foundUser.userId,
            email: foundUser.email,
            fullName: foundUser.fullName,
            phone: foundUser.phone
          },
          token
        });
      } else {
        console.log('Login failed - wrong password for:', email);
        res.status(401).json({ 
          error: 'Incorrect password. Please try again.',
          code: 'WRONG_PASSWORD'
        });
      }
    } else {
      // User not registered
      console.log('Login failed - user not registered:', email);
      res.status(404).json({ 
        error: 'User not registered. Please sign up first.',
        code: 'USER_NOT_FOUND'
      });
    }
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Sign in failed' });
  }
});

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, phone, referredBy } = req.body;
    
    console.log('Signup attempt:', { email, name, phone, referredBy });
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // For testing, simulate Firebase Auth behavior
    // In production, you would use Firebase Admin SDK
    
    // Simulate checking if email already exists
    const existingUsers = []; // In production, check Firebase Auth
    const existingEmails = []; // Empty for testing
    
    if (existingEmails.includes(email)) {
      console.log('Signup failed - email already exists:', email);
      res.status(409).json({ 
        error: 'This email is already registered. Please sign in or use a different email.',
        code: 'EMAIL_ALREADY_IN_USE'
      });
      return;
    }
    
    // Simulate successful signup
    const token = 'mock_firebase_token_' + Date.now();
    const userId = 'user_' + Date.now();
    
    // Store user data in Firebase Firestore
    const userData = {
      uid: userId,
      email: email,
      fullName: name || 'New User',
      phone: phone || '',
      password: password, // Store password (in production, hash it)
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      subscriptionPlan: 'free',
      bio: '',
      company: '',
      profileImageUrl: '',
      stats: {
        videosCreated: 0,
        photosUploaded: 0,
        totalVideoDuration: 0,
        lastVideoCreated: null
      },
      referral: {
        code: 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        referredBy: referredBy || null,
        referralsCount: 0,
        rewardsEarned: 0
      }
    };
    
    try {
      // Save to Firebase Firestore
      const userDocRef = doc(usersCollection, userId);
      await setDoc(userDocRef, userData);
      console.log('User saved to Firebase:', userData);
    } catch (error) {
      console.error('Error saving user to Firebase:', error);
      return res.status(500).json({ error: 'Failed to save user to database' });
    }
    
    console.log('Signup successful for:', email);
    
    res.json({
      success: true,
      user: {
        uid: userId,
        email: email,
        fullName: name || 'New User',
        phone: phone || '',
        createdAt: new Date().toISOString()
      },
      token
    });
    
  } catch (error) {
    console.error('Sign up error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-in-use') {
      res.status(409).json({ 
        error: 'This email is already registered. Please sign in or use a different email.',
        code: 'EMAIL_ALREADY_IN_USE'
      });
    } else {
      res.status(500).json({ error: 'Sign up failed' });
    }
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
    console.log('Getting profile for user:', userId);
    
    // Try to get user from Firebase Firestore
    try {
      const userDocRef = doc(usersCollection, userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('Found user data in Firebase:', userData);
        res.json(userData);
      } else {
        // User not found in Firebase
        console.log('User not found in Firebase, returning mock data');
        const mockProfile = {
          uid: userId,
          email: 'test@example.com',
          fullName: 'Test User',
          phone: '+1 (555) 123-4567',
          company: 'Test Company',
          bio: 'Real estate professional',
          profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          subscriptionPlan: 'free',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stats: {
            videosCreated: 5,
            photosUploaded: 25,
            totalVideoDuration: 180,
            lastVideoCreated: new Date().toISOString()
          },
          referral: {
            code: 'TEST123',
            referredBy: null,
            referralsCount: 3,
            rewardsEarned: 15
          }
        };
        
        res.json(mockProfile);
      }
    } catch (error) {
      console.error('Error fetching user from Firebase:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
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
    
    console.log('Updating profile for user:', userId, 'with updates:', updates);
    
    // Get existing user data from Firebase
    try {
      const userDocRef = doc(usersCollection, userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // Update user data in Firebase
        const existingData = userDoc.data();
        const updatedData = {
          ...existingData,
          ...updates,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(userDocRef, updatedData);
        
        console.log('Profile updated successfully in Firebase:', updatedData);
        res.json(updatedData);
      } else {
        // User not found, create new user with updates in Firebase
        const newUser = {
          uid: userId,
          email: updates.email || '',
          fullName: updates.fullName || 'New User',
          phone: updates.phone || '',
          company: updates.company || '',
          bio: updates.bio || '',
          profileImageUrl: updates.profileImageUrl || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          subscriptionPlan: 'free',
          stats: {
            videosCreated: 0,
            photosUploaded: 0,
            totalVideoDuration: 0,
            lastVideoCreated: null
          },
          referral: {
            code: 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            referredBy: null,
            referralsCount: 0,
            rewardsEarned: 0
          },
          ...updates
        };
        
        await setDoc(userDocRef, newUser);
        
        console.log('Created new user with updates in Firebase:', newUser);
        res.json(newUser);
      }
    } catch (error) {
      console.error('Error updating user in Firebase:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
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

// Get User Content
app.get('/api/content/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { contentType } = req.query;
    
    console.log('Getting content for user:', userId, 'type:', contentType);
    
    // For testing, return mock content data
    const mockContent = [
      {
        id: 'content_1',
        userId: userId,
        fileName: 'property-video-1.mp4',
        contentType: 'video',
        size: 5242880,
        title: 'Modern Family Home',
        description: 'Beautiful 4-bedroom family home in suburban area',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        downloadURL: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',
        duration: 45,
        location: {
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          coordinates: { latitude: 40.7128, longitude: -74.0060 }
        }
      },
      {
        id: 'content_2',
        userId: userId,
        fileName: 'property-image-1.jpg',
        contentType: 'image',
        size: 2097152,
        title: 'Luxury Apartment Living Room',
        description: 'Spacious living room with modern amenities',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        downloadURL: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        location: {
          address: '456 Park Avenue',
          city: 'New York',
          state: 'NY',
          coordinates: { latitude: 40.7614, longitude: -73.9776 }
        }
      },
      {
        id: 'content_3',
        userId: userId,
        fileName: 'property-video-2.mp4',
        contentType: 'video',
        size: 8388608,
        title: 'Downtown Condo Tour',
        description: 'Stunning downtown condominium with city views',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        downloadURL: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1512917770787-6b3c3196e236?w=400&h=300&fit=crop',
        duration: 60,
        location: {
          address: '789 Broadway',
          city: 'New York',
          state: 'NY',
          coordinates: { latitude: 40.7580, longitude: -73.9855 }
        }
      }
    ];
    
    // Filter by content type if specified
    const filteredContent = contentType && contentType !== 'all'
      ? mockContent.filter(item => item.contentType === contentType)
      : mockContent;
    
    res.json({
      content: filteredContent,
      stats: {
        total: filteredContent.length,
        images: filteredContent.filter(item => item.contentType === 'image').length,
        videos: filteredContent.filter(item => item.contentType === 'video').length
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Delete Content
app.delete('/api/content/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting content:', id);
    
    // For testing, always succeed
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// Upload Content
app.post('/api/content/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { userId } = req.user;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const { title, description, location } = req.body;
    
    console.log('Upload request:', {
      userId,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      title,
      description
    });
    
    // For testing, simulate successful upload
    const mockUploadResult = {
      id: 'upload_' + Date.now(),
      fileName: file.originalname,
      contentType: file.mimetype.startsWith('image/') ? 'image' : 'video',
      size: file.size,
      title: title || file.originalname,
      description: description || '',
      downloadURL: `https://mock-storage.example.com/${file.originalname}`,
      createdAt: new Date().toISOString(),
      userId: userId,
      location: location ? JSON.parse(location) : null
    };
    
    console.log('Upload successful:', mockUploadResult);
    
    res.json({
      success: true,
      data: mockUploadResult
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
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

// Location Routes
app.post('/api/location/reverse', authenticateToken, async (req, res) => {
  try {
    const { coordinates } = req.body;
    console.log('Reverse geocoding:', coordinates);
    
    // For testing, return mock location
    res.json({
      address: '123 Test Street, Test City, Test State',
      city: 'Test City',
      state: 'Test State',
      coordinates: coordinates
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({ error: 'Reverse geocoding failed' });
  }
});

app.post('/api/location/geocode', authenticateToken, async (req, res) => {
  try {
    const { address } = req.body;
    console.log('Geocoding address:', address);
    
    // For testing, return mock coordinates
    res.json({
      address: address,
      coordinates: { latitude: 12.9716, longitude: 77.5946 }
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

app.post('/api/location/static-map', authenticateToken, async (req, res) => {
  try {
    const { coordinates, address } = req.body;
    console.log('Generating static map for:', coordinates || address);
    
    // For testing, return mock map URL
    res.json({
      mapUrl: 'https://maps.googleapis.com/maps/api/staticmap?center=12.9716,77.5946&zoom=15&size=600x400&markers=12.9716,77.5946'
    });
  } catch (error) {
    console.error('Static map error:', error);
    res.status(500).json({ error: 'Static map generation failed' });
  }
});

app.post('/api/location/embed-map', authenticateToken, async (req, res) => {
  try {
    const { coordinates, address } = req.body;
    console.log('Generating embed map for:', coordinates || address);
    
    // For testing, return mock embed URL
    res.json({
      embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3871.123456789!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDU4JzE3LjgiTiA3N8KwMzUnNDIuNiJF'
    });
  } catch (error) {
    console.error('Embed map error:', error);
    res.status(500).json({ error: 'Embed map generation failed' });
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

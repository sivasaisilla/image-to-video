const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { initializeDatabase, dbOperations } = require('./config/database-sqlite');
const { contentOperations, initializeContentTable } = require('./config/database-content');
const { uploadSingle, uploadMultiple, fileUtils } = require('./config/fileUpload');
const locationService = require('./config/locationService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-memory OTP storage (in production, use Redis or database)
const otpStore = {};

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kranthinalla0@gmail.com',
    pass: 'awyr axos infk rgpn'
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// In-memory storage for enhanced features (in production, use proper tables)
const userProfiles = new Map(); // userId -> profile data
const referrals = new Map(); // userId -> referral data
const userCredits = new Map(); // userId -> credits array
const referralRelationships = new Map(); // referrerId -> referred users array
const userSessions = new Map(); // token -> session data

// Helper functions
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function generateReferralCode() {
  return 'IC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: 'kranthinalla0@gmail.com',
    to: email,
    subject: 'IMOB Motion - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0;">IMOB Motion</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Thank you for signing up! Please use the following OTP to verify your email address:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 14px;">
            This OTP will expire in 10 minutes. Please do not share this code with anyone.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>&copy; 2024 IMOB Motion. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Authentication middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const session = userSessions.get(token);
    
    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    // Update last accessed time
    session.lastAccessedAt = new Date();
    userSessions.set(token, session);
    
    req.user = decoded;
    req.session = session;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// Initialize user profile and referral data
function initializeUserData(userId) {
  if (!userProfiles.has(userId)) {
    userProfiles.set(userId, {
      videosCreated: 0,
      photosUploaded: 0,
      totalVideoDuration: 0,
      lastVideoCreated: null,
      memberSince: new Date().toISOString(),
      accountType: 'individual',
      timezone: 'UTC',
      language: 'en'
    });
  }
  
  if (!referrals.has(userId)) {
    referrals.set(userId, {
      referralCode: generateReferralCode(),
      totalReferrals: 0,
      totalRewardsEarned: 0
    });
  }
  
  if (!userCredits.has(userId)) {
    userCredits.set(userId, []);
  }
  
  if (!referralRelationships.has(userId)) {
    referralRelationships.set(userId, []);
  }
}

// Routes

// Content Management Routes

// Upload single file
app.post('/api/content/upload', authenticateToken, uploadSingle, async (req, res) => {
  try {
    const { title, description, locationName, latitude, longitude, address, city, country } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const userId = req.user.userId;
    const filename = file.filename;
    const contentType = fileUtils.getFileType(filename);
    const fileSize = file.size;
    const duration = contentType === 'video' ? 0 : undefined; // Will be updated later
    
    // Create content record
    const contentData = {
      userId,
      title: title || filename,
      description: description || '',
      contentType,
      fileUrl: fileUtils.getFileUrl(userId, filename),
      thumbnailUrl: '', // Will be generated later
      fileSize,
      duration,
      format: path.extname(filename).substring(1),
      locationName: locationName || '',
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      address: address || '',
      city: city || '',
      country: country || ''
    };

    const content = await contentOperations.createContent(contentData);
    
    // Update user profile stats
    const profile = userProfiles.get(userId);
    if (profile) {
      if (contentType === 'video') {
        profile.videosCreated++;
        profile.totalVideoDuration += duration || 0;
        profile.lastVideoCreated = new Date().toISOString();
      } else if (contentType === 'image') {
        profile.photosUploaded++;
      }
    }

    res.json({
      message: 'File uploaded successfully',
      success: true,
      content: {
        id: content.id,
        title: content.title,
        contentType: content.contentType,
        fileUrl: content.fileUrl,
        fileSize: content.fileSize,
        status: content.status
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload multiple files
app.post('/api/content/upload-multiple', authenticateToken, uploadMultiple, async (req, res) => {
  try {
    const userId = req.user.userId;
    const files = req.files;
    const { title, description } = req.body;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = [];
    
    for (const file of files) {
      const filename = file.filename;
      const contentType = fileUtils.getFileType(filename);
      const fileSize = file.size;
      
      const contentData = {
        userId,
        title: title ? `${title} - ${filename}` : filename,
        description: description || '',
        contentType,
        fileUrl: fileUtils.getFileUrl(userId, filename),
        thumbnailUrl: '',
        fileSize,
        duration: contentType === 'video' ? 0 : undefined,
        format: path.extname(filename).substring(1),
        locationName: '',
        latitude: null,
        longitude: null,
        address: '',
        city: '',
        country: ''
      };

      const content = await contentOperations.createContent(contentData);
      uploadedFiles.push({
        id: content.id,
        title: content.title,
        contentType: content.contentType,
        fileUrl: content.fileUrl,
        fileSize: content.fileSize,
        status: content.status
      });

      // Update user profile stats
      const profile = userProfiles.get(userId);
      if (profile) {
        if (contentType === 'video') {
          profile.videosCreated++;
          profile.lastVideoCreated = new Date().toISOString();
        } else if (contentType === 'image') {
          profile.photosUploaded++;
        }
      }
    }

    res.json({
      message: `${files.length} files uploaded successfully`,
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Get user's content
app.get('/api/content/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { contentType, limit = 50, offset = 0 } = req.query;
    
    // Users can only access their own content
    if (req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const content = await contentOperations.getUserContent(userId, contentType, parseInt(limit), parseInt(offset));
    const stats = await contentOperations.getContentStats(userId);
    
    res.json({
      content,
      stats,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: content.length
      }
    });
  } catch (error) {
    console.error('Error fetching user content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get content details
app.get('/api/content/:contentId', authenticateToken, async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const content = await contentOperations.getContentById(contentId);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Users can only access their own content
    if (req.user.userId !== content.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      content
    });
  } catch (error) {
    console.error('Error fetching content details:', error);
    res.status(500).json({ error: 'Failed to fetch content details' });
  }
});

// Update content
app.put('/api/content/:contentId', authenticateToken, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { title, description, locationName, latitude, longitude, address, city, country } = req.body;
    const userId = req.user.userId;
    
    const existingContent = await contentOperations.getContentById(contentId);
    
    if (!existingContent) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Users can only update their own content
    if (existingContent.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update content in database
    // Note: In a real implementation, you would update the database record
    // For now, we'll just acknowledge the update
    
    res.json({
      message: 'Content updated successfully',
      success: true
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Delete content
app.delete('/api/content/:contentId', authenticateToken, async (req, res) => {
  try {
    const { contentId } = req.params;
    const userId = req.user.userId;
    
    const content = await contentOperations.getContentById(contentId);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Users can only delete their own content
    if (content.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file from filesystem
    const filePath = fileUtils.getFilePath(userId, content.file_url.split('/').pop());
    fileUtils.deleteFile(filePath);

    // Delete from database
    await contentOperations.deleteContent(contentId, userId);
    
    // Update user profile stats
    const profile = userProfiles.get(userId);
    if (profile) {
      if (content.content_type === 'video') {
        profile.videosCreated = Math.max(0, profile.videosCreated - 1);
        profile.totalVideoDuration = Math.max(0, profile.totalVideoDuration - (content.duration || 0));
      } else if (content.content_type === 'image') {
        profile.photosUploaded = Math.max(0, profile.photosUploaded - 1);
      }
    }

    res.json({
      message: 'Content deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// Search content
app.get('/api/content/search/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { q: searchTerm, contentType } = req.query;
    
    // Users can only search their own content
    if (req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const content = await contentOperations.searchContent(userId, searchTerm, contentType);
    
    res.json({
      content,
      searchTerm,
      total: content.length
    });
  } catch (error) {
    console.error('Error searching content:', error);
    res.status(500).json({ error: 'Failed to search content' });
  }
});

// Get content statistics
app.get('/api/content/stats/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only access their own stats
    if (req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await contentOperations.getContentStats(userId);
    
    res.json({
      stats
    });
  } catch (error) {
    console.error('Error fetching content stats:', error);
    res.status(500).json({ error: 'Failed to fetch content stats' });
  }
});

// Location Services Routes

// Get current location (for frontend geolocation)
app.post('/api/location/current', authenticateToken, async (req, res) => {
  try {
    // This endpoint is for the frontend to use browser geolocation
    // The actual location capture happens in the frontend
    res.json({
      message: 'Use browser geolocation API to get current location',
      instructions: {
        method: 'navigator.geolocation.getCurrentPosition',
        parameters: ['latitude', 'longitude', 'accuracy']
      }
    });
  } catch (error) {
    console.error('Error getting location info:', error);
    res.status(500).json({ error: 'Failed to get location information' });
  }
});

// Reverse geocoding - get address from coordinates
app.post('/api/location/reverse', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    // Validate coordinates
    if (!locationService.validateCoordinates(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }
    
    const locationData = await locationService.reverseGeocode(latitude, longitude);
    
    res.json({
      location: locationData,
      coordinates: {
        latitude,
        longitude,
        formatted: locationService.formatCoordinates(latitude, longitude)
      }
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    res.status(500).json({ error: 'Failed to get address from coordinates' });
  }
});

// Forward geocoding - get coordinates from address
app.post('/api/location/geocode', authenticateToken, async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    const locationData = await locationService.geocodeAddress(address);
    
    res.json({
      location: locationData,
      address: locationData.address
    });
  } catch (error) {
    console.error('Error forward geocoding:', error);
    res.status(500).json({ error: 'Failed to get coordinates from address' });
  }
});

// Get static map URL
app.post('/api/location/static-map', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, width = 400, height = 300, zoom = 15 } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const mapUrl = locationService.getStaticMapUrl(latitude, longitude, width, height, zoom);
    
    res.json({
      mapUrl,
      coordinates: { latitude, longitude },
      parameters: { width, height, zoom }
    });
  } catch (error) {
    console.error('Error generating static map URL:', error);
    res.status(500).json({ error: 'Failed to generate map URL' });
  }
});

// Get map embed URL
app.post('/api/location/embed-map', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, zoom = 15 } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const embedUrl = locationService.getMapEmbedUrl(latitude, longitude, zoom);
    
    res.json({
      embedUrl,
      coordinates: { latitude, longitude },
      zoom
    });
  } catch (error) {
    console.error('Error generating embed map URL:', error);
    res.status(500).json({ error: 'Failed to generate embed map URL' });
  }
});

// Calculate distance between two points
app.post('/api/location/distance', authenticateToken, async (req, res) => {
  try {
    const { lat1, lon1, lat2, lon2 } = req.body;
    
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return res.status(400).json({ error: 'All coordinates are required' });
    }
    
    const distance = locationService.calculateDistance(lat1, lon1, lat2, lon2);
    
    res.json({
      distance: {
        kilometers: distance,
        miles: distance * 0.621371,
        meters: distance * 1000
      },
      coordinates: {
        from: { latitude: lat1, longitude: lon1 },
        to: { latitude: lat2, longitude: lon2 }
      }
    });
  } catch (error) {
    console.error('Error calculating distance:', error);
    res.status(500).json({ error: 'Failed to calculate distance' });
  }
});

// Update content with location data
app.put('/api/content/:contentId/location', authenticateToken, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { latitude, longitude, locationName, address, city, country } = req.body;
    const userId = req.user.userId;
    
    const existingContent = await contentOperations.getContentById(contentId);
    
    if (!existingContent) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Users can only update their own content
    if (existingContent.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate coordinates if provided
    if (latitude && longitude && !locationService.validateCoordinates(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Update content with location data
    // Note: In a real implementation, you would update the database record
    // For now, we'll just acknowledge the update
    
    res.json({
      message: 'Location updated successfully',
      success: true,
      location: {
        latitude,
        longitude,
        locationName,
        address,
        city,
        country
      }
    });
  } catch (error) {
    console.error('Error updating content location:', error);
    res.status(500).json({ error: 'Failed to update content location' });
  }
});

// Get content with location data
app.get('/api/content/with-location/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { hasLocation = true } = req.query;
    
    // Users can only access their own content
    if (req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let content = await contentOperations.getUserContent(userId);
    
    // Filter content that has location data
    if (hasLocation === 'true') {
      content = content.filter(item => item.latitude && item.longitude);
    }
    
    res.json({
      content,
      count: content.length,
      hasLocationFilter: hasLocation
    });
  } catch (error) {
    console.error('Error fetching content with location:', error);
    res.status(500).json({ error: 'Failed to fetch content with location' });
  }
});

// Forgot Password
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await dbOperations.findUserByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        message: 'If an account with that email exists, password reset instructions have been sent.',
        success: true 
      });
    }

    // Generate reset token
    const resetToken = generateToken(user.id, email);
    const resetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour expiry
    
    // Store reset token (in production, use database)
    otpStore[email] = {
      resetToken,
      resetExpiry,
      type: 'password_reset'
    };

    // Send reset email
    const resetLink = `http://localhost:3001/reset-password?token=${resetToken}&email=${email}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Instructions',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #666;">Hi there,</p>
          <p style="color: #666;">You requested to reset your password. Click the link below to reset it:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Reset Password
          </a>
          <p style="color: #666;">This link will expire in 1 hour.</p>
          <p style="color: #666;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ 
      message: 'If an account with that email exists, password reset instructions have been sent.',
      success: true 
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ error: 'Failed to process request. Please try again.' });
  }
});

// Check if email exists
app.post('/api/check-email', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await dbOperations.checkEmail(email);
    
    if (user) {
      res.json({ 
        exists: true, 
        message: 'Account already exists. Please sign in.' 
      });
    } else {
      res.json({ 
        exists: false, 
        message: 'Email available for registration.' 
      });
    }
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// Send OTP for signup
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  
  try {
    // Check if email already exists
    const user = await dbOperations.checkEmail(email);
    
    if (user) {
      return res.status(400).json({ 
        error: 'Account already exists with this email.' 
      });
    }
    
    const otp = generateOTP();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    otpStore[email] = { otp, expiry };
    
    const emailSent = await sendOTPEmail(email, otp);
    
    if (emailSent) {
      res.json({ 
        message: 'OTP sent successfully to your email.',
        success: true
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send OTP. Please try again.' 
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// Verify OTP
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  
  const storedOTP = otpStore[email];
  
  if (!storedOTP) {
    return res.status(400).json({ 
      error: 'OTP not found or expired. Please request a new OTP.' 
    });
  }
  
  if (Date.now() > storedOTP.expiry) {
    delete otpStore[email];
    return res.status(400).json({ 
      error: 'OTP expired. Please request a new OTP.' 
    });
  }
  
  if (storedOTP.otp !== otp) {
    return res.status(400).json({ 
      error: 'Invalid OTP. Please try again.' 
    });
  }
  
  // Mark email as verified
  otpStore[email].verified = true;
  
  res.json({ 
    message: 'OTP verified successfully. You can now create your password.',
    success: true
  });
});

// Complete signup
app.post('/api/signup', async (req, res) => {
  const { email, password, name, phone, referralCode } = req.body;
  
  try {
    // Check if OTP was verified
    const storedOTP = otpStore[email];
    if (!storedOTP || !storedOTP.verified) {
      return res.status(400).json({ 
        error: 'Email not verified. Please verify your email first.' 
      });
    }
    
    // Check if user already exists
    const existingUser = await dbOperations.checkEmail(email);
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Account already exists with this email.' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = await dbOperations.createUser(email, hashedPassword, name, phone);
    
    // Initialize user data
    initializeUserData(newUser.id);
    
    // Handle referral code if provided
    if (referralCode) {
      // Find referrer by code
      for (const [referrerId, refData] of referrals.entries()) {
        if (refData.referralCode === referralCode) {
          // Create referral relationship
          const relationship = {
            referredUserId: newUser.id,
            status: 'completed',
            rewardAmount: 60,
            rewardStatus: 'pending',
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
          };
          
          referralRelationships.get(referrerId).push(relationship);
          
          // Update referral count
          refData.totalReferrals++;
          
          // Add credit to referrer
          const credit = {
            id: 'credit-' + Date.now(),
            seconds: 60,
            status: 'available',
            earnedFrom: `Referral: ${email}`,
            earnedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          
          userCredits.get(referrerId).push(credit);
          refData.totalRewardsEarned += 60;
          
          break;
        }
      }
    }
    
    // Create session
    const token = generateToken(newUser.id, newUser.email);
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    
    userSessions.set(token, {
      userId: newUser.id,
      email: newUser.email,
      isActive: true,
      createdAt: new Date(),
      expiresAt: new Date(expiresAt),
      lastAccessedAt: new Date()
    });
    
    // Clean up OTP
    delete otpStore[email];
    
    res.json({
      message: 'Account created successfully!',
      success: true,
      user: { id: newUser.id, email: newUser.email },
      token
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find user
    const user = await dbOperations.findUserByEmail(email);
    
    if (!user) {
      return res.status(400).json({ 
        error: 'No account found with this email.' 
      });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(400).json({ 
        error: 'Invalid password.' 
      });
    }
    
    // Initialize user data if not exists
    initializeUserData(user.id);
    
    // Create session
    const token = generateToken(user.id, user.email);
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    
    userSessions.set(token, {
      userId: user.id,
      email: user.email,
      isActive: true,
      createdAt: new Date(),
      expiresAt: new Date(expiresAt),
      lastAccessedAt: new Date()
    });
    
    res.json({
      message: 'Login successful!',
      success: true,
      user: { id: user.id, email: user.email },
      token
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = userProfiles.get(userId);
    const referral = referrals.get(userId);
    
    // Get user data from database
    const user = await dbOperations.findUserByEmail(req.session.email);
    
    res.json({
      id: userId,
      email: req.session.email,
      fullName: user?.name || '',
      phone: user?.phone || '',
      company: profile?.company || '',
      bio: profile?.bio || '',
      profileImageUrl: profile?.profileImageUrl || '',
      subscriptionPlan: profile?.subscriptionPlan || 'free',
      createdAt: user?.created_at || new Date().toISOString(),
      stats: {
        videosCreated: profile?.videosCreated || 0,
        photosUploaded: profile?.photosUploaded || 0,
        totalVideoDuration: profile?.totalVideoDuration || 0,
        lastVideoCreated: profile?.lastVideoCreated,
        memberSince: profile?.memberSince || user?.created_at || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phone, company, bio } = req.body;
    
    // In production, this would update the users table
    // For now, we'll just acknowledge the update
    
    res.json({
      message: 'Profile updated successfully',
      success: true
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// Get referral information
app.get('/api/user/referral', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const referral = referrals.get(userId);
    const relationships = referralRelationships.get(userId) || [];
    const credits = userCredits.get(userId) || [];
    
    res.json({
      referralCode: referral?.referralCode || '',
      totalReferrals: referral?.totalReferrals || 0,
      totalRewardsEarned: referral?.totalRewardsEarned || 0,
      relationships: relationships,
      credits: credits
    });
  } catch (error) {
    console.error('Error fetching referral info:', error);
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// Logout
app.post('/api/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.session.session_token || Object.keys(userSessions).find(key => 
      userSessions.get(key)?.userId === req.user.userId
    );
    
    if (token) {
      userSessions.delete(token);
    }
    
    res.json({
      message: 'Logout successful',
      success: true
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// Delete account
app.delete('/api/user/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Remove all user data
    userProfiles.delete(userId);
    referrals.delete(userId);
    userCredits.delete(userId);
    referralRelationships.delete(userId);
    
    // Remove sessions
    for (const [token, session] of userSessions.entries()) {
      if (session.userId === userId) {
        userSessions.delete(token);
      }
    }
    
    // In production, you'd also delete from the users table
    
    res.json({
      message: 'Account deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../build')));

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    await initializeContentTable();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Database: Enhanced SQLite`);
      console.log(`Features: User profiles, referrals, credits, sessions, content storage`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

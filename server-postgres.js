const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'imob_motion',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

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
    
    // Check if session exists and is active
    const sessionQuery = `
      SELECT s.*, u.email, u.full_name, u.is_active 
      FROM user_sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.session_token = $1 AND s.is_active = true AND s.expires_at > NOW()
    `;
    
    const sessionResult = await pool.query(sessionQuery, [token]);
    
    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    // Update last accessed time
    await pool.query(
      'UPDATE user_sessions SET last_accessed_at = NOW() WHERE session_token = $1',
      [token]
    );
    
    req.user = decoded;
    req.session = sessionResult.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// Initialize database
async function initializeDatabase() {
  try {
    // Check if database exists and has required tables
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (result.rows.length === 0) {
      console.log('📝 Creating database tables...');
      // You would run the schema.sql file here in production
      console.log('⚠️  Please run database/schema.sql to create tables');
    }
    
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Routes

// Check if email exists
app.post('/api/check-email', async (req, res) => {
  const { email } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length > 0) {
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
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length > 0) {
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
  const { email, password, referralCode } = req.body;
  
  try {
    // Check if OTP was verified
    const storedOTP = otpStore[email];
    if (!storedOTP || !storedOTP.verified) {
      return res.status(400).json({ 
        error: 'Email not verified. Please verify your email first.' 
      });
    }
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Account already exists with this email.' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create user
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash, email_verified) VALUES ($1, $2, $3) RETURNING id, email, created_at',
        [email, hashedPassword, true]
      );
      
      const newUser = userResult.rows[0];
      
      // Handle referral code if provided
      if (referralCode) {
        const referralResult = await client.query(
          'SELECT referrer_id FROM referrals WHERE referral_code = $1 AND is_active = true',
          [referralCode]
        );
        
        if (referralResult.rows.length > 0) {
          const referrerId = referralResult.rows[0].referrer_id;
          
          // Create referral relationship
          await client.query(`
            INSERT INTO referral_relationships (referrer_id, referred_user_id, referral_code, status)
            VALUES ($1, $2, $3, 'completed')
          `, [referrerId, newUser.id, referralCode]);
          
          // Update referral count
          await client.query(
            'UPDATE referrals SET total_referrals = total_referrals + 1 WHERE referrer_id = $1',
            [referrerId]
          );
        }
      }
      
      // Create session
      const token = generateToken(newUser.id, newUser.email);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      await client.query(`
        INSERT INTO user_sessions (user_id, session_token, expires_at)
        VALUES ($1, $2, $3)
      `, [newUser.id, token, expiresAt]);
      
      // Log activity
      await client.query(`
        INSERT INTO user_activities (user_id, activity_type, description)
        VALUES ($1, 'signup', 'User account created')
      `, [newUser.id]);
      
      await client.query('COMMIT');
      
      // Clean up OTP
      delete otpStore[email];
      
      res.json({
        message: 'Account created successfully!',
        success: true,
        user: { id: newUser.id, email: newUser.email },
        token
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, is_active FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ 
        error: 'No account found with this email.' 
      });
    }
    
    const user = result.rows[0];
    
    if (!user.is_active) {
      return res.status(400).json({ 
        error: 'Account has been deactivated.' 
      });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(400).json({ 
        error: 'Invalid password.' 
      });
    }
    
    // Create session
    const token = generateToken(user.id, user.email);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await pool.query(`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES ($1, $2, $3)
    `, [user.id, token, expiresAt]);
    
    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );
    
    // Log activity
    await pool.query(`
      INSERT INTO user_activities (user_id, activity_type, description)
      VALUES ($1, 'login', 'User logged in')
    `, [user.id]);
    
    res.json({
      message: 'Login successful!',
      success: true,
      user: { id: user.id, email: user.email, full_name: user.full_name },
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
    
    const result = await pool.query(`
      SELECT 
        u.id, u.email, u.full_name, u.phone, u.company, u.bio, 
        u.profile_image_url, u.subscription_plan, u.created_at,
        p.videos_created, p.photos_uploaded, p.total_video_duration,
        p.last_video_created_at, p.member_since
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name || '',
      phone: user.phone || '',
      company: user.company || '',
      bio: user.bio || '',
      profileImageUrl: user.profile_image_url || '',
      subscriptionPlan: user.subscription_plan || 'free',
      createdAt: user.created_at,
      stats: {
        videosCreated: user.videos_created || 0,
        photosUploaded: user.photos_uploaded || 0,
        totalVideoDuration: user.total_video_duration || 0,
        lastVideoCreated: user.last_video_created_at,
        memberSince: user.member_since
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
    
    await pool.query(`
      UPDATE users 
      SET full_name = $1, phone = $2, company = $3, bio = $4, updated_at = NOW()
      WHERE id = $5
    `, [fullName, phone, company, bio, userId]);
    
    // Log activity
    await pool.query(`
      INSERT INTO user_activities (user_id, activity_type, description)
      VALUES ($1, 'profile_updated', 'User profile updated')
    `, [userId]);
    
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
    
    // Get user's referral code
    const referralResult = await pool.query(
      'SELECT referral_code, total_referrals, total_rewards_earned FROM referrals WHERE referrer_id = $1',
      [userId]
    );
    
    if (referralResult.rows.length === 0) {
      return res.status(404).json({ error: 'Referral information not found' });
    }
    
    const referral = referralResult.rows[0];
    
    // Get referral relationships
    const relationshipsResult = await pool.query(`
      SELECT 
        rr.status, rr.reward_amount, rr.reward_status, rr.created_at, rr.completed_at,
        u.email, u.full_name
      FROM referral_relationships rr
      LEFT JOIN users u ON rr.referred_user_id = u.id
      WHERE rr.referrer_id = $1
      ORDER BY rr.created_at DESC
    `, [userId]);
    
    // Get user credits
    const creditsResult = await pool.query(`
      SELECT 
        id, seconds, status, earned_from, earned_at, used_at, expires_at
      FROM user_credits 
      WHERE user_id = $1
      ORDER BY earned_at DESC
    `, [userId]);
    
    res.json({
      referralCode: referral.referral_code,
      totalReferrals: referral.total_referrals || 0,
      totalRewardsEarned: referral.total_rewards_earned || 0,
      relationships: relationshipsResult.rows,
      credits: creditsResult.rows
    });
  } catch (error) {
    console.error('Error fetching referral info:', error);
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// Logout
app.post('/api/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.session.session_token;
    
    // Deactivate session
    await pool.query(
      'UPDATE user_sessions SET is_active = false WHERE session_token = $1',
      [token]
    );
    
    // Log activity
    await pool.query(`
      INSERT INTO user_activities (user_id, activity_type, description)
      VALUES ($1, 'logout', 'User logged out')
    `, [req.user.userId]);
    
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
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Deactivate user (soft delete)
      await client.query(
        'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
        [userId]
      );
      
      // Deactivate all sessions
      await client.query(
        'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
        [userId]
      );
      
      // Log activity
      await client.query(`
        INSERT INTO user_activities (user_id, activity_type, description)
        VALUES ($1, 'account_deleted', 'User account deleted')
      `, [userId]);
      
      await client.query('COMMIT');
      
      res.json({
        message: 'Account deleted successfully',
        success: true
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Database: PostgreSQL`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

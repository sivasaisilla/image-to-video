const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const pool = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
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
  const { email, password } = req.body;
  
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
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hashedPassword]
    );
    
    const newUser = result.rows[0];
    
    // Clean up OTP
    delete otpStore[email];
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
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
    const result = await pool.query(
      'SELECT id, email, password FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ 
        error: 'No account found with this email.' 
      });
    }
    
    const user = result.rows[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(400).json({ 
        error: 'Invalid password.' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
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

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../build')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

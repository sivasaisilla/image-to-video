// Email Service for OTP
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a transporter using Gmail with environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `iMOB-MOTION <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code for iMOB-MOTION',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 32px;">iMOB-MOTION</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your OTP Verification Code</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Your OTP Code</h2>
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center;">
              <span style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
            </div>
            <p style="color: #666; margin: 20px 0 0 0; text-align: center;">
              This OTP is valid for 10 minutes
            </p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Security Notice:</strong> Never share this OTP with anyone. Our team will never ask for your OTP.
            </p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
            <p>If you didn't request this OTP, please ignore this email.</p>
            <p>© 2026 iMOB-MOTION. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email server configuration error:', error);
    return false;
  }
};

export { sendOTPEmail, testEmailConfig };

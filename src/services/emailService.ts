import nodemailer from 'nodemailer';

// Email service configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'kranthinalla0@gmail.com',
    pass: process.env.EMAIL_PASS || 'awyr axos infk rgpn'
  }
});

// Send OTP email
export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'kranthinalla0@gmail.com',
      to: email,
      subject: 'Verify Your Email - IMOB Motion',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #6366f1;
              margin-bottom: 10px;
            }
            .otp-container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              margin: 20px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 5px;
              margin: 10px 0;
              font-family: 'Courier New', monospace;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
            .security-note {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎬 IMOB Motion</div>
              <h1>Email Verification</h1>
            </div>
            
            <p>Hello,</p>
            <p>Thank you for signing up with IMOB Motion! To complete your registration, please use the following verification code:</p>
            
            <div class="otp-container">
              <p>Your verification code is:</p>
              <div class="otp-code">${otp}</div>
              <p>This code will expire in 10 minutes</p>
            </div>
            
            <div class="security-note">
              <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code.
            </div>
            
            <p>If you didn't request this verification, please ignore this email or contact our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The IMOB Motion Team</p>
              <p>© 2024 IMOB Motion. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'kranthinalla0@gmail.com',
      to: email,
      subject: 'Welcome to IMOB Motion! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to IMOB Motion</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #6366f1;
              margin-bottom: 10px;
            }
            .welcome-container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              margin: 20px 0;
            }
            .cta-button {
              display: inline-block;
              background: #6366f1;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎬 IMOB Motion</div>
              <h1>Welcome aboard! 🎉</h1>
            </div>
            
            <p>Hello,</p>
            <p>Welcome to IMOB Motion! We're excited to have you join our community of creative video professionals.</p>
            
            <div class="welcome-container">
              <h2>Your account is ready!</h2>
              <p>Start creating amazing video content with our powerful motion tools.</p>
              <a href="http://localhost:3000" class="cta-button">Get Started</a>
            </div>
            
            <h3>What's next?</h3>
            <ul>
              <li>✨ Explore our video transformation tools</li>
              <li>🎨 Customize your video with AI-powered features</li>
              <li>📹 Create stunning motion graphics</li>
              <li>🚀 Share your creations with the world</li>
            </ul>
            
            <p>If you have any questions, our support team is here to help you succeed.</p>
            
            <div class="footer">
              <p>Best regards,<br>The IMOB Motion Team</p>
              <p>© 2024 IMOB Motion. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

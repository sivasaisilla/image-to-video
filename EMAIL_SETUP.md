# Email Service Setup for OTP

## 📧 How to Configure Email Sending

### **Option 1: Gmail (Recommended for Testing)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "iMOB-MOTION" as the name
   - Copy the 16-character password

3. **Update Email Configuration**:
   Edit `email-service.js` and update:
   ```javascript
   auth: {
     user: 'your-email@gmail.com', // Replace with your Gmail
     pass: 'your-16-character-app-password' // Replace with app password
   }
   ```

### **Option 2: Other Email Services**

You can use any SMTP service. Update the transporter configuration:

```javascript
// Outlook/Hotmail
const transporter = nodemailer.createTransporter({
  service: 'hotmail',
  auth: {
    user: 'your-email@outlook.com',
    pass: 'your-password'
  }
});

// Yahoo
const transporter = nodemailer.createTransporter({
  service: 'yahoo',
  auth: {
    user: 'your-email@yahoo.com',
    pass: 'your-password'
  }
});

// Custom SMTP
const transporter = nodemailer.createTransporter({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@provider.com',
    pass: 'your-password'
  }
});
```

## 🔧 Quick Setup Steps

1. **Install Dependencies** (already done):
   ```bash
   npm install nodemailer
   ```

2. **Configure Email Service**:
   - Edit `email-service.js`
   - Update email and password
   - Test configuration

3. **Restart Server**:
   ```bash
   node server-firebase.js
   ```

## 📱 How It Works

1. **User enters email** → Server generates OTP
2. **Server sends email** → User receives OTP in inbox
3. **User enters OTP** → Server verifies and continues signup

## 🧪 Testing Email Service

You can test the email service separately:

```javascript
// Create test-email.js
const { sendOTPEmail } = require('./email-service');

sendOTPEmail('your-email@example.com', '123456')
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

Run: `node test-email.js`

## ⚠️ Security Notes

- **Never commit** email credentials to Git
- **Use environment variables** in production
- **Use app passwords** instead of regular passwords
- **Consider using email services** like SendGrid for production

## 🚀 Production Email Services

For production, consider using:
- **SendGrid** (free tier available)
- **Mailgun** (free tier available)
- **AWS SES** (pay-as-you-go)
- **Brevo** (free tier available)

These services provide better deliverability and analytics.

---

## 📋 Current Status

- ✅ Email service created
- ✅ Server updated to use email service
- ⏳ **Need to configure email credentials**
- ⏳ **Test email sending**

Once you configure the email credentials, OTPs will be sent to actual email addresses!

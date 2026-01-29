# Firebase Integration Setup Guide

This guide will help you set up Firebase for the IMOB Motion authentication system.

## 🔥 Firebase Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `imob-motion-auth`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Click "Save"

### 3. Set up Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (for development)
3. Select a location (choose closest to your users)
4. Click "Create"

### 4. Get Firebase Configuration

1. Go to Project Settings → General → Your apps
2. Click **Web app** (</>) icon
3. Register app with nickname: `imob-motion-web`
4. Copy the Firebase configuration object

## ⚙️ Configuration

### Update Firebase Config

Replace the placeholder values in `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id-here"
};
```

### Firestore Security Rules

Go to Firestore Database → Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }
    
    // OTPs collection
    match /otps/{email} {
      allow read, write: if true; // Allow OTP creation and verification
      allow delete: if request.auth != null;
    }
  }
}
```

## 🚀 Running the Application

### Development Mode

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Start server (if using backend)
npm run server
```

## 📊 Firebase Data Structure

### Users Collection
```
users/
├── user@example.com
│   ├── uid: "firebase-uid"
│   ├── email: "user@example.com"
│   ├── createdAt: timestamp
│   ├── lastLoginAt: timestamp
│   ├── emailVerified: boolean
│   └── isActive: boolean
```

### OTPs Collection
```
otps/
├── user@example.com
│   ├── email: "user@example.com"
│   ├── otp: "123456"
│   ├── createdAt: timestamp
│   ├── expiresAt: timestamp
│   ├── attempts: number
│   └── isUsed: boolean
```

## 🔧 Features Implemented

### ✅ Authentication
- **Email/Password Authentication** via Firebase Auth
- **User Registration** with email verification
- **User Login** with secure authentication
- **Session Management** with Firebase tokens

### ✅ Email System
- **OTP Generation** using Firestore
- **Email Sending** via Nodemailer (Gmail SMTP)
- **OTP Verification** with expiration and attempt limits
- **Beautiful Email Templates** with HTML styling

### ✅ Security Features
- **Password Hashing** (handled by Firebase)
- **OTP Expiration** (10 minutes)
- **Attempt Limits** (max 3 attempts per OTP)
- **Input Validation** on both frontend and backend

### ✅ User Experience
- **Multi-step Signup Flow** (Email → OTP → Password)
- **Real-time Validation** and error handling
- **Loading States** and user feedback
- **Responsive Design** with modern UI

## 🔄 Migration from Node.js Backend

The Firebase implementation replaces the previous Node.js backend:

| Previous (Node.js) | New (Firebase) |
|-------------------|----------------|
| In-memory user storage | Firebase Authentication |
| Manual JWT handling | Firebase token management |
| File-based OTP storage | Firestore OTP collection |
| Custom email service | Nodemailer + Firebase integration |

## 🛠 Development Notes

### Environment Variables

No additional environment variables needed for Firebase (config is stored in client-side file).

### Email Configuration

Update `.env` file for email sending:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

### Testing

1. Use real email addresses for testing
2. Check Gmail for OTP codes
3. Verify user creation in Firebase Console
4. Test OTP expiration (10 minutes)

## 🚨 Important Notes

- **Firebase Free Tier**: Includes 10GB Firestore storage, 50K document reads/day
- **Email Limits**: Gmail SMTP has daily sending limits
- **Security**: Never expose Firebase config in public repositories
- **Production**: Consider upgrading to Firebase Blaze plan for production

## 📱 Mobile App Ready

The Firebase setup is ready for:
- **React Native** mobile apps
- **Flutter** applications  
- **Progressive Web Apps** (PWA)
- **Cross-platform** development

## 🔍 Troubleshooting

### Common Issues

1. **Firebase Config Error**: Double-check API keys and project ID
2. **Email Not Sending**: Verify Gmail app password setup
3. **OTP Not Working**: Check Firestore rules and collection names
4. **Authentication Failed**: Ensure Email/Password provider is enabled

### Debug Mode

Enable Firebase debug mode:
```javascript
import { getAuth, connectAuthEmulator } from "firebase/auth";

if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
}
```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

---

**Next Steps**: Consider adding:
- Social login (Google, Apple)
- Password reset functionality
- User profile management
- Analytics integration
- Cloud Functions for server-side logic

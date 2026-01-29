# Google & Apple OAuth Setup Guide

This guide will help you set up Google and Apple OAuth authentication for your IMOB Motion app.

## 🔧 Firebase OAuth Setup

### 1. Enable Google Sign-In

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `imob-motion-4b2f1`
3. Go to **Authentication** → **Sign-in method**
4. Click **Google** → Enable
5. Select your email address for support
6. Click **Save**

### 2. Enable Apple Sign-In

1. In the same **Sign-in method** section
2. Click **Apple** → Enable
3. Configure Apple Sign-In:
   - **Bundle ID**: `com.imobmotion.app`
   - **Apple Team ID**: Your Apple Developer Team ID
   - **Key ID**: Your private key ID
   - **Private Key**: Upload your `.p8` file
4. Click **Save**

### 3. Google OAuth Configuration

For Google OAuth to work properly:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `imob-motion-4b2f1`
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Add authorized JavaScript origins:
   - `http://localhost:3002`
   - `http://localhost:3000`
   - Your production domain when deployed

### 4. Apple Developer Setup

For Apple Sign-In, you need:

1. **Apple Developer Account** ($99/year)
2. Create an **App ID** with Sign In with Apple capability
3. Create a **Service ID** for your web app
4. Generate a **Private Key** (`.p8` file)
5. Add your domain to the allowed list

## 🚀 Testing OAuth

### Google Sign-In Testing
1. Open `http://localhost:3002/`
2. Click "Sign Up" or "Sign In"
3. Click "Google" button
4. Select your Google account
5. Authorize the app
6. You'll be redirected back automatically

### Apple Sign-In Testing
1. Same flow as Google
2. Requires Apple Developer account
3. Works best on Safari and iOS devices

## 📊 Data Storage

When users sign in with Google/Apple:

### Firebase Authentication
- User credentials stored securely
- Email verified automatically
- Profile information imported

### Firestore Database
```
users/
├── user@example.com
│   ├── uid: "firebase-uid"
│   ├── email: "user@example.com"
│   ├── displayName: "John Doe"
│   ├── photoURL: "https://..."
│   ├── provider: "google" or "apple"
│   ├── createdAt: timestamp
│   ├── lastLoginAt: timestamp
│   ├── emailVerified: true
│   └── isActive: true
```

## 🔍 Troubleshooting

### Common Issues

1. **Google Sign-In Not Working**
   - Check OAuth consent screen configuration
   - Verify authorized JavaScript origins
   - Check browser console for errors

2. **Apple Sign-In Not Working**
   - Verify Apple Developer account setup
   - Check private key configuration
   - Ensure domain is verified

3. **CORS Errors**
   - Add your domain to authorized origins
   - Check Firebase security rules

### Debug Mode

Enable Firebase debug mode:
```javascript
import { getAuth, connectAuthEmulator } from "firebase/auth";

if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
}
```

## 🎯 Benefits of OAuth

### For Users
- **One-click sign-up/sign-in**
- **No password to remember**
- **Secure authentication**
- **Profile auto-import**

### For Developers
- **Reduced friction**
- **Higher conversion rates**
- **Verified email addresses**
- **Rich profile data**

## 📱 Mobile App Ready

The OAuth setup works for:
- **Web applications** ✅
- **React Native apps** ✅
- **Flutter apps** ✅
- **Progressive Web Apps** ✅

## 🔒 Security Features

- **OAuth 2.0 protocol** (industry standard)
- **PKCE verification** (Proof Key for Code Exchange)
- **Secure token handling** by Firebase
- **Automatic token refresh**
- **Session management**

## 📈 Analytics

Track OAuth usage in Firebase:
1. Go to **Firebase Analytics**
2. Check **Authentication** events
3. Monitor sign-up conversion rates
4. Track provider usage (Google vs Apple)

---

**Next Steps:**
1. Set up Google OAuth (free, immediate)
2. Set up Apple OAuth (requires Apple Developer account)
3. Test both sign-in flows
4. Monitor user adoption rates

The OAuth integration will significantly improve your user experience and conversion rates!

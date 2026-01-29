#!/bin/bash

echo "🔥 Setting up Firebase for iMOB-MOTION..."

# Install Firebase dependencies
echo "📦 Installing Firebase dependencies..."
npm install firebase@10.7.1 express@4.18.2 cors@2.8.5 multer@1.4.5-lts.1 dotenv@16.3.1

# Install dev dependencies
echo "📦 Installing development dependencies..."
npm install --save-dev nodemon@3.0.2 @types/express@4.17.21 @types/cors@2.8.17 @types/multer@1.4.11

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cat > .env << EOF
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyAcdkJl_niHJyqBDtbCtEEFEGkOnukHmYE
FIREBASE_AUTH_DOMAIN=imob-motion-4b2f1.firebaseapp.com
FIREBASE_PROJECT_ID=imob-motion-4b2f1
FIREBASE_STORAGE_BUCKET=imob-motion-4b2f1.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=1036615610685
FIREBASE_APP_ID=1:1036615610685:web:fdcc8decdf5ee233c59554
FIREBASE_MEASUREMENT_ID=G-HJ94PJTD96

# Server Configuration
PORT=5000
NODE_ENV=development
EOF
fi

# Update package.json scripts
echo "📝 Updating package.json scripts..."
npm pkg set scripts.start="node server-firebase.js"
npm pkg set scripts.dev="nodemon server-firebase.js"
npm pkg set scripts.firebase="node server-firebase.js"

echo "✅ Firebase setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Run 'npm run firebase' to start the Firebase server"
echo "2. Run 'npm run dev' to start the frontend"
echo "3. Test the application with Firebase backend"
echo ""
echo "🔥 Firebase Features Enabled:"
echo "   - Authentication (Email/Password)"
echo "   - User Profile Management"
echo "   - File Storage (Images & Videos)"
echo "   - Referral System"
echo "   - Location Services"
echo "   - Real-time Database"
echo "   - Analytics"

// Fix User Profile and Generate Referral Code
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcdkJl_niHJyqBDtbCtEEFEGkOnukHmYE",
  authDomain: "imob-motion-4b2f1.firebaseapp.com",
  projectId: "imob-motion-4b2f1",
  storageBucket: "imob-motion-4b2f1.firebasestorage.app",
  messagingSenderId: "1036615610685",
  appId: "1:1036615610685:web:fdcc8decdf5ee233c59554",
  measurementId: "G-HJ94PJTD96"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Generate referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function fixUserProfile() {
  console.log('🔧 Fixing User Profile...');
  
  try {
    const userRef = doc(db, 'users', 'fHPSz01FDvBTaApX4ivj');
    
    // Update user profile with proper name and referral code
    await updateDoc(userRef, {
      fullName: 'Kranthi Nalla',
      referral: {
        code: generateReferralCode(),
        referredBy: null,
        referralsCount: 0,
        rewardsEarned: 0
      },
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ User profile updated successfully!');
    console.log('🎯 New referral code generated');
    
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
  }
}

// Run the fix
fixUserProfile().then(() => {
  console.log('🎉 Profile fix complete!');
  process.exit(0);
}).catch(console.error);

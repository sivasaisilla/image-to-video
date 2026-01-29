// Test Firebase Integration
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

async function testFirebaseIntegration() {
  console.log('🔥 Testing Firebase Integration');
  console.log('================================');
  
  try {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    
    console.log(`📊 Found ${querySnapshot.size} users in Firebase Firestore`);
    
    if (querySnapshot.empty) {
      console.log('💡 No users found. Sign up a user to test Firebase integration.');
    } else {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log(`👤 User: ${userData.email} (${userData.fullName})`);
        console.log(`   🆔 ID: ${doc.id}`);
        console.log(`   📱 Phone: ${userData.phone || 'Not set'}`);
        console.log(`   📅 Created: ${userData.createdAt?.toDate() || 'Unknown'}`);
        console.log('');
      });
    }
    
    console.log('✅ Firebase integration is working!');
    console.log('🚀 Data is now saved to Firebase Firestore');
    
  } catch (error) {
    console.error('❌ Firebase integration error:', error);
    console.log('💡 Check your Firebase configuration and permissions');
  }
}

// Run the test
testFirebaseIntegration();

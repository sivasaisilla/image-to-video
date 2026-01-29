// Quick View of Registered Emails
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function viewRegisteredEmails() {
  console.log('📧 Registered Emails in Firebase');
  console.log('=================================\n');
  
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    if (usersSnapshot.empty) {
      console.log('No registered users found.');
      return;
    }
    
    console.log(`Total Registered Users: ${usersSnapshot.size}\n`);
    
    usersSnapshot.forEach((doc, index) => {
      const userData = doc.data();
      console.log(`${index + 1}. 📧 ${userData.email}`);
      console.log(`   👤 Name: ${userData.fullName || 'Not set'}`);
      console.log(`   📱 Phone: ${userData.phone || 'Not set'}`);
      console.log(`   🆔 UID: ${doc.id}`);
      console.log(`   📅 Created: ${userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleString() : 'Unknown'}`);
      console.log(`   🎯 Referral Code: ${userData.referral?.code || 'N/A'}`);
      console.log('');
    });
    
    // Show just emails for quick copy
    console.log('📋 Email List (for quick reference):');
    console.log('====================================');
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`- ${userData.email}`);
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
  }
}

// Run the function
viewRegisteredEmails();

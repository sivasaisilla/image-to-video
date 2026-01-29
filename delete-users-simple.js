// Simple User Deletion Tool
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';

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

async function showAndDeleteUsers() {
  console.log('🔥 Firebase User Management');
  console.log('========================\n');
  
  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        email: userData.email,
        fullName: userData.fullName || 'Not set',
        phone: userData.phone || 'Not set',
        createdAt: userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleString() : 'Unknown'
      });
    });
    
    console.log(`📊 Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 📧 ${user.email}`);
      console.log(`   👤 Name: ${user.fullName}`);
      console.log(`   🆔 UID: ${user.uid}`);
      console.log(`   📅 Created: ${user.createdAt}`);
      console.log('');
    });
    
    if (users.length === 0) {
      console.log('No users found.');
      return;
    }
    
    // Auto-delete users (you can modify this section)
    console.log('🗑️  Deleting all users...\n');
    
    for (const user of users) {
      try {
        await deleteDoc(doc(db, 'users', user.uid));
        console.log(`✅ Deleted: ${user.email}`);
      } catch (error) {
        console.log(`❌ Failed to delete ${user.email}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 User deletion complete!');
    
    // Verify deletion
    const afterSnapshot = await getDocs(collection(db, 'users'));
    console.log(`📊 Users remaining: ${afterSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
showAndDeleteUsers();

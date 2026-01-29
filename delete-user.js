// Delete User from Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc, getDocs, collection, query, where } from 'firebase/firestore';

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

// List all users first
async function listAllUsers() {
  console.log('📋 Current Users in Firebase:');
  console.log('=====================================\n');
  
  try {
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
    
    console.log(`Total Users: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.fullName}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    return users;
  } catch (error) {
    console.error('❌ Error listing users:', error);
    return [];
  }
}

// Delete user by email
async function deleteUserByEmail(email) {
  console.log(`🗑️  Deleting user: ${email}`);
  
  try {
    // First find the user by email
    const usersQuery = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(usersQuery);
    
    if (querySnapshot.empty) {
      console.log(`❌ User with email ${email} not found`);
      return false;
    }
    
    // Delete the user document
    const userDoc = querySnapshot.docs[0];
    await deleteDoc(doc(db, 'users', userDoc.id));
    
    console.log(`✅ Successfully deleted user: ${email}`);
    console.log(`   Document ID: ${userDoc.id}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error deleting user ${email}:`, error);
    return false;
  }
}

// Delete user by UID
async function deleteUserByUID(uid) {
  console.log(`🗑️  Deleting user with UID: ${uid}`);
  
  try {
    await deleteDoc(doc(db, 'users', uid));
    console.log(`✅ Successfully deleted user with UID: ${uid}`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting user ${uid}:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('🔥 Firebase User Management Tool');
  console.log('===============================\n');
  
  // List all current users
  const users = await listAllUsers();
  
  if (users.length === 0) {
    console.log('No users found in the database.');
    return;
  }
  
  console.log('\n🎯 Available Actions:');
  console.log('1. Delete user by email');
  console.log('2. Delete user by UID');
  console.log('3. List users again');
  console.log('4. Exit');
  
  // For automation, you can specify which users to delete here
  // Uncomment and modify the lines below to delete specific users
  
  /*
  // Example: Delete specific users by email
  const emailsToDelete = [
    'user1@example.com',
    'user2@example.com'
  ];
  
  for (const email of emailsToDelete) {
    await deleteUserByEmail(email);
  }
  
  // Example: Delete specific users by UID
  const uidsToDelete = [
    'user_uid_1',
    'user_uid_2'
  ];
  
  for (const uid of uidsToDelete) {
    await deleteUserByUID(uid);
  }
  */
  
  console.log('\n📝 To delete users, modify this script and uncomment the deletion section');
  console.log('   Or run with specific email/UID parameters');
}

// Run the tool
main().catch(console.error);

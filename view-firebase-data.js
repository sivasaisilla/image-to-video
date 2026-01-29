// Firebase Data Viewer
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Admin credentials (you can change these)
const ADMIN_EMAIL = "admin@imobmotion.com";
const ADMIN_PASSWORD = "admin123456";

async function signInAsAdmin() {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Signed in as admin');
    return userCredential.user;
  } catch (error) {
    console.log('⚠️ Admin login failed, trying without authentication...');
    return null;
  }
}

async function viewAllUsers() {
  console.log('\n👥 === ALL USERS ===');
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
        company: userData.company || 'Not set',
        subscriptionPlan: userData.subscriptionPlan || 'free',
        createdAt: userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleString() : 'Unknown',
        stats: userData.stats || {},
        referral: userData.referral || {}
      });
    });
    
    console.log(`Total Users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.fullName} (${user.email})`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Company: ${user.company}`);
      console.log(`   Plan: ${user.subscriptionPlan}`);
      console.log(`   Member Since: ${user.createdAt}`);
      console.log(`   Stats: ${JSON.stringify(user.stats)}`);
      console.log(`   Referral Code: ${user.referral.code || 'N/A'}`);
      console.log(`   Referrals: ${user.referral.referralsCount || 0}`);
    });
    
    return users;
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return [];
  }
}

async function viewAllContent() {
  console.log('\n📁 === ALL UPLOADED CONTENT ===');
  try {
    const contentSnapshot = await getDocs(collection(db, 'content'));
    const content = [];
    
    contentSnapshot.forEach((doc) => {
      const contentData = doc.data();
      content.push({
        id: doc.id,
        userId: contentData.userId,
        fileName: contentData.fileName,
        contentType: contentData.contentType,
        size: contentData.size,
        title: contentData.title,
        createdAt: contentData.createdAt ? new Date(contentData.createdAt.toDate()).toLocaleString() : 'Unknown',
        downloadURL: contentData.downloadURL,
        location: contentData.location
      });
    });
    
    console.log(`Total Content Items: ${content.length}`);
    content.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`);
      console.log(`   Type: ${item.contentType}`);
      console.log(`   User ID: ${item.userId}`);
      console.log(`   File: ${item.fileName}`);
      console.log(`   Size: ${item.size} bytes`);
      console.log(`   Uploaded: ${item.createdAt}`);
      console.log(`   Location: ${item.location ? JSON.stringify(item.location) : 'No location'}`);
    });
    
    return content;
  } catch (error) {
    console.error('❌ Error fetching content:', error);
    return [];
  }
}

async function viewAllReferrals() {
  console.log('\n🎯 === ALL REFERRALS ===');
  try {
    const referralsSnapshot = await getDocs(collection(db, 'referrals'));
    const referrals = [];
    
    referralsSnapshot.forEach((doc) => {
      const referralData = doc.data();
      referrals.push({
        id: doc.id,
        referrerId: referralData.referrerId,
        referredUserId: referralData.referredUserId,
        referralCode: referralData.referralCode,
        status: referralData.status,
        createdAt: referralData.createdAt ? new Date(referralData.createdAt.toDate()).toLocaleString() : 'Unknown',
        rewards: referralData.rewards
      });
    });
    
    console.log(`Total Referrals: ${referrals.length}`);
    referrals.forEach((referral, index) => {
      console.log(`\n${index + 1}. Referral Code: ${referral.referralCode}`);
      console.log(`   Referrer ID: ${referral.referrerId}`);
      console.log(`   Referred User ID: ${referral.referredUserId}`);
      console.log(`   Status: ${referral.status}`);
      console.log(`   Created: ${referral.createdAt}`);
      console.log(`   Rewards: ${JSON.stringify(referral.rewards)}`);
    });
    
    return referrals;
  } catch (error) {
    console.error('❌ Error fetching referrals:', error);
    return [];
  }
}

async function viewAllLocations() {
  console.log('\n📍 === ALL LOCATIONS ===');
  try {
    const locationsSnapshot = await getDocs(collection(db, 'locations'));
    const locations = [];
    
    locationsSnapshot.forEach((doc) => {
      const locationData = doc.data();
      locations.push({
        id: doc.id,
        userId: locationData.userId,
        address: locationData.address,
        city: locationData.city,
        state: locationData.state,
        coordinates: locationData.coordinates,
        createdAt: locationData.createdAt ? new Date(locationData.createdAt.toDate()).toLocaleString() : 'Unknown'
      });
    });
    
    console.log(`Total Locations: ${locations.length}`);
    locations.forEach((location, index) => {
      console.log(`\n${index + 1}. ${location.address}`);
      console.log(`   User ID: ${location.userId}`);
      console.log(`   City: ${location.city}`);
      console.log(`   State: ${location.state}`);
      console.log(`   Coordinates: ${JSON.stringify(location.coordinates)}`);
      console.log(`   Added: ${location.createdAt}`);
    });
    
    return locations;
  } catch (error) {
    console.error('❌ Error fetching locations:', error);
    return [];
  }
}

async function viewStorageFiles() {
  console.log('\n☁️ === STORAGE FILES ===');
  try {
    const storageRef = ref(storage, 'content');
    const result = await listAll(storageRef);
    
    console.log(`Total Folders: ${result.prefixes.length}`);
    console.log(`Total Files: ${result.items.length}`);
    
    // List all user folders
    for (const folderRef of result.prefixes) {
      console.log(`\n📂 User Folder: ${folderRef.name}`);
      
      try {
        const folderContents = await listAll(folderRef);
        console.log(`   Files: ${folderContents.items.length}`);
        
        for (const item of folderContents.items) {
          const downloadURL = await getDownloadURL(item);
          console.log(`   📄 ${item.name}`);
          console.log(`      URL: ${downloadURL}`);
        }
      } catch (error) {
        console.log(`   Error accessing folder: ${error.message}`);
      }
    }
    
    // List root files
    if (result.items.length > 0) {
      console.log('\n📄 Root Files:');
      for (const item of result.items) {
        const downloadURL = await getDownloadURL(item);
        console.log(`   ${item.name}: ${downloadURL}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error accessing storage:', error);
  }
}

async function generateSummaryReport() {
  console.log('\n📊 === SUMMARY REPORT ===');
  
  const users = await viewAllUsers();
  const content = await viewAllContent();
  const referrals = await viewAllReferrals();
  const locations = await viewAllLocations();
  
  console.log('\n📈 STATISTICS:');
  console.log(`Total Users: ${users.length}`);
  console.log(`Total Content: ${content.length}`);
  console.log(`Total Referrals: ${referrals.length}`);
  console.log(`Total Locations: ${locations.length}`);
  
  const totalVideos = content.filter(item => item.contentType === 'video').length;
  const totalImages = content.filter(item => item.contentType === 'image').length;
  
  console.log(`Total Videos: ${totalVideos}`);
  console.log(`Total Images: ${totalImages}`);
  
  const activeUsers = users.filter(user => user.stats.videosCreated > 0 || user.stats.photosUploaded > 0).length;
  console.log(`Active Users: ${activeUsers}`);
  
  const premiumUsers = users.filter(user => user.subscriptionPlan !== 'free').length;
  console.log(`Premium Users: ${premiumUsers}`);
  
  // Recent activity (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentUsers = users.filter(user => new Date(user.createdAt) > oneDayAgo).length;
  const recentContent = content.filter(item => new Date(item.createdAt) > oneDayAgo).length;
  
  console.log(`New Users (24h): ${recentUsers}`);
  console.log(`New Content (24h): ${recentContent}`);
}

// Main function
async function main() {
  console.log('🔥 Firebase Data Viewer for iMOB-MOTION');
  console.log('=====================================\n');
  
  // Try to sign in as admin (optional)
  await signInAsAdmin();
  
  // View all data
  await generateSummaryReport();
  await viewAllUsers();
  await viewAllContent();
  await viewAllReferrals();
  await viewAllLocations();
  await viewStorageFiles();
  
  console.log('\n✅ Data viewing complete!');
}

// Run the viewer
main().catch(console.error);

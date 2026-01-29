const { viewDatabase, runQuery, db } = require('./view-database');

async function viewEnhancedData() {
  console.log('🎯 Enhanced IMOB Motion Database Viewer\n');
  
  try {
    // View users table
    console.log('👥 USERS TABLE:');
    console.log('-'.repeat(40));
    const users = await runQuery('SELECT id, email, created_at FROM users');
    users.forEach(user => {
      console.log(`ID: ${user.id} | Email: ${user.email} | Created: ${user.created_at}`);
    });

    // Since we're using the enhanced SQLite server with in-memory features,
    // let's also show what would be stored in the enhanced features
    console.log('\n🎨 ENHANCED FEATURES (In-Memory Storage):');
    console.log('-'.repeat(40));
    
    // Import the server's in-memory storage
    const { userProfiles, referrals, userCredits, referralRelationships, userSessions } = require('./server-enhanced-sqlite');
    
    console.log('\n📊 USER PROFILES:');
    if (userProfiles.size > 0) {
      for (const [userId, profile] of userProfiles.entries()) {
        console.log(`User ${userId}:`);
        console.log(`  Videos Created: ${profile.videosCreated}`);
        console.log(`  Photos Uploaded: ${profile.photosUploaded}`);
        console.log(`  Total Duration: ${profile.totalVideoDuration}s`);
        console.log(`  Member Since: ${profile.memberSince}`);
      }
    } else {
      console.log('  No profiles in memory (create users via signup to see data)');
    }

    console.log('\n🎁 REFERRALS:');
    if (referrals.size > 0) {
      for (const [userId, referral] of referrals.entries()) {
        console.log(`User ${userId}:`);
        console.log(`  Referral Code: ${referral.referralCode}`);
        console.log(`  Total Referrals: ${referral.totalReferrals}`);
        console.log(`  Total Rewards: ${referral.totalRewardsEarned}s`);
      }
    } else {
      console.log('  No referrals in memory');
    }

    console.log('\n💰 USER CREDITS:');
    if (userCredits.size > 0) {
      for (const [userId, credits] of userCredits.entries()) {
        console.log(`User ${userId}:`);
        credits.forEach((credit, index) => {
          console.log(`  Credit ${index + 1}: ${credit.seconds}s - ${credit.status} - ${credit.earnedFrom}`);
        });
      }
    } else {
      console.log('  No credits in memory');
    }

    console.log('\n🔗 REFERRAL RELATIONSHIPS:');
    if (referralRelationships.size > 0) {
      for (const [referrerId, relationships] of referralRelationships.entries()) {
        console.log(`Referrer ${referrerId}:`);
        relationships.forEach((rel, index) => {
          console.log(`  Referred: ${rel.referredUserId} - Status: ${rel.status} - Reward: ${rel.rewardAmount}s`);
        });
      }
    } else {
      console.log('  No referral relationships in memory');
    }

    console.log('\n🔐 USER SESSIONS:');
    if (userSessions.size > 0) {
      for (const [token, session] of userSessions.entries()) {
        console.log(`Session: ${token.substring(0, 20)}...`);
        console.log(`  User: ${session.userId} (${session.email})`);
        console.log(`  Active: ${session.isActive}`);
        console.log(`  Expires: ${session.expiresAt}`);
      }
    } else {
      console.log('  No active sessions');
    }

    console.log('\n📈 SUMMARY:');
    console.log(`  Total Users: ${users.length}`);
    console.log(`  User Profiles: ${userProfiles.size}`);
    console.log(`  Referral Codes: ${referrals.size}`);
    console.log(`  Active Sessions: ${userSessions.size}`);

  } catch (error) {
    console.error('❌ Error viewing enhanced data:', error);
  } finally {
    db.close();
  }
}

// Run the viewer
if (require.main === module) {
  viewEnhancedData();
}

module.exports = { viewEnhancedData };

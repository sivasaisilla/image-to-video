import { useState } from "react";
import { User, Mail, Calendar, Package, Video, Image as ImageIcon, ArrowLeft, Camera, ChevronDown, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { DashboardHeader } from "../layout/DashboardHeader";

interface ProfilePageProps {
  onBack: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToProjects?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToPlans?: () => void;
  onNavigateToReferral?: () => void;
  onLogout: () => void;
}

export function ProfilePage({ onBack, onNavigateToCreate, onNavigateToProjects, onNavigateToSettings, onNavigateToPlans, onNavigateToReferral, onLogout }: ProfilePageProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Yashwanth",
    email: "yaswanth@gmail.com",
    phone: "+1 (555) 123-4567",
    company: "Imagetovideo",
    bio: "Passionate about creating stunning real estate videos",
  });

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
    setIsUserMenuOpen(false);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  return (
    <div className="min-h-screen bg-[#131519] text-white relative">
      {/* Background Gradients */}
      <div className="fixed blur-3xl filter left-[-352px] rounded-[1.67772e+07px] size-[800px] top-[-400px] pointer-events-none" style={{ backgroundImage: "linear-gradient(135deg, rgba(225, 113, 0, 0.2) 0%, rgba(245, 73, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      <div className="fixed blur-3xl filter left-[1501px] rounded-[1.67772e+07px] size-[800px] top-[580px] pointer-events-none" style={{ backgroundImage: "linear-gradient(-45deg, rgba(208, 135, 0, 0.2) 0%, rgba(225, 113, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      
      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md mx-4"
          >
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mx-auto mb-6">
                <LogOut className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl text-center mb-3">Log Out</h3>
              <p className="text-white/60 text-center mb-8">
                Are you sure you want to log out of your account?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  className="flex-1 px-6 py-3 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 px-6 py-3 bg-white text-black hover:bg-white/90 rounded-md transition-all duration-300"
                >
                  Log Out
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 px-8 py-4">
        <DashboardHeader
          onNavigateToCreate={onNavigateToCreate}
          onNavigateToProjects={onNavigateToProjects}
          onNavigateToProfile={() => {}}
          onNavigateToSettings={onNavigateToSettings}
          onNavigateToPlans={onNavigateToPlans}
          onNavigateToReferral={onNavigateToReferral}
          onLogout={handleLogoutClick}
        />
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-4xl">
                  <User className="w-16 h-16 text-white/60" />
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-all">
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl mb-2">{profileData.name}</h1>
                    <p className="text-white/60">{profileData.email}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-md transition-all"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mt-6">
                  <div className="text-center">
                    <div className="text-2xl mb-1">-</div>
                    <div className="text-sm text-white/60">Videos Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">-</div>
                    <div className="text-sm text-white/60">Photos Uploaded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">-</div>
                    <div className="text-sm text-white/60">Total Duration</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-6">
              <h2 className="text-xl mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                    />
                  ) : (
                    <div className="text-white">{profileData.name}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                    />
                  ) : (
                    <div className="text-white">{profileData.email}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                    />
                  ) : (
                    <div className="text-white">{profileData.phone}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Company</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                    />
                  ) : (
                    <div className="text-white">{profileData.company}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all resize-none"
                    />
                  ) : (
                    <div className="text-white">{profileData.bio}</div>
                  )}
                </div>

                {isEditing && (
                  <button
                    onClick={handleSave}
                    className="w-full px-6 py-3 bg-white text-black hover:bg-white/90 rounded-md transition-all"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-6">
              {/* Subscription */}
              <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-6">
                <h2 className="text-xl mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Subscription
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white mb-1">Professional Plan</div>
                      <div className="text-sm text-white/60">60 seconds video</div>
                    </div>
                    <div className="px-4 py-2 bg-white/10 rounded-md">
                      €15.90/video
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/60">Member Since</span>
                      <span className="text-white">January 15, 2024</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Last Video</span>
                      <span className="text-white">2 days ago</span>
                    </div>
                  </div>

                  <button className="w-full px-6 py-3 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all">
                    Change Plan
                  </button>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

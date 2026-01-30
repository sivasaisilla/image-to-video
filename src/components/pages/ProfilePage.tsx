import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Calendar, Package, Video, Image as ImageIcon, ArrowLeft, Camera, ChevronDown, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { DashboardHeader } from "../layout/DashboardHeader";
import { authService, userService, UserData } from "../../services/firebase";

export function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState({
    displayName: "",
  });

  // Fetch user profile using Firebase SDK
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      setError('No authenticated user found');
      setLoading(false);
      return;
    }

    // Set up realtime listener for profile changes
    const unsubscribe = userService.onProfileChange(currentUser.uid, (data) => {
      if (data) {
        setProfileData(data);
        setEditForm({
          displayName: data.displayName || "",
        });
      } else {
        setError('Profile not found');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !profileData) {
      setError('No authenticated user found');
      return;
    }

    try {
      const result = await userService.updateProfile(currentUser.uid, {
        displayName: editForm.displayName,
      });

      if (result.success) {
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
    setIsUserMenuOpen(false);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutDialog(false);
    await authService.signOut();
    navigate("/");
  };

  return loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-400">{error}</div>
        </div>
      ) : (
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
          onNavigateToCreate={() => navigate("/dashboard")}
          onNavigateToProjects={() => navigate("/projects")}
          onNavigateToProfile={() => {}}
          onNavigateToSettings={() => navigate("/settings")}
          onNavigateToPlans={() => navigate("/plans")}
          onNavigateToReferral={() => navigate("/referral")}
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
                    <h1 className="text-3xl mb-2">{profileData?.displayName || 'User'}</h1>
                    <p className="text-white/60">{profileData?.email}</p>
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
                    <div className="text-2xl mb-1">{profileData?.stats.videosCreated || 0}</div>
                    <div className="text-sm text-white/60">Videos Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">{profileData?.stats.photosUploaded || 0}</div>
                    <div className="text-sm text-white/60">Photos Uploaded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">{Math.floor((profileData?.stats.totalVideoSeconds || 0) / 60)}:{((profileData?.stats.totalVideoSeconds || 0) % 60).toString().padStart(2, '0')}</div>
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
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                    />
                  ) : (
                    <div className="text-white">{profileData?.displayName || 'Not set'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Email Address</label>
                  <div className="text-white">{profileData?.email}</div>
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
                      <div className="text-white mb-1 capitalize">{profileData?.subscription.planId || 'Free'} Plan</div>
                      <div className="text-sm text-white/60">{profileData?.credits.availableSeconds || 0} seconds available</div>
                    </div>
                    <div className="px-4 py-2 bg-white/10 rounded-md">
                      {profileData?.credits.usedSeconds || 0}s used
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/60">Member Since</span>
                      <span className="text-white">
                        {profileData?.createdAt ? profileData.createdAt.toDate().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Videos Created</span>
                      <span className="text-white">
                        {profileData?.stats.videosCreated || 0}
                      </span>
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Bell, Video, Globe, Shield, Trash2, ArrowLeft, ChevronDown, LogOut, Save, Check, CreditCard, Download, FileText, Smartphone, Monitor, Moon, Sun, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { DashboardHeader } from "../layout/DashboardHeader";
import { authService, getCurrentUserId } from "../../services/firebase";
import { settingsService, UserSettings, StorageUsage } from "../../services/settingsService";

export function SettingsPage() {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'video' | 'privacy'>('account');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // User data
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Settings State
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);

  // Password State
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Initialize
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setCurrentUser(user);
    loadSettings(user.uid);
    loadStorageUsage(user.uid);
  }, [navigate]);

  const loadSettings = async (uid: string) => {
    try {
      const userSettings = await settingsService.getUserSettings(uid);
      setSettings(userSettings);
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const loadStorageUsage = async (uid: string) => {
    try {
      const usage = await settingsService.getStorageUsage(uid);
      setStorageUsage(usage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!currentUser) return;
    
    try {
      setError('');
      setMessage('');
      const result = await settingsService.updateUserSettings(currentUser.uid, newSettings);
      
      if (result.success) {
        setSettings(prev => prev ? { ...prev, ...newSettings } : null);
        setMessage('Settings saved successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(result.error || 'Failed to save settings');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentUser) return;
    
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setError('Please fill all password fields');
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.new.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      const result = await settingsService.updatePassword(passwordForm.current, passwordForm.new);
      
      if (result.success) {
        setShowPasswordDialog(false);
        setPasswordForm({ current: '', new: '', confirm: '' });
        setMessage('Password updated successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(result.error || 'Failed to update password');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser || !deletePassword) {
      setError('Please enter your password');
      return;
    }

    try {
      setError('');
      setDeletingAccount(true);
      const result = await settingsService.deleteAccount(deletePassword);
      
      if (result.success) {
        setShowDeleteDialog(false);
        navigate('/');
      } else {
        setError(result.error || 'Failed to delete account');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleExportData = async () => {
    if (!currentUser) return;
    
    try {
      const result = await settingsService.exportUserData(currentUser.uid);
      if (result.success && result.data) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `imob-motion-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        setError(result.error || 'Failed to export data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutDialog(false);
    await authService.signOut();
    navigate("/");
  };


  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'video', label: 'Video Settings', icon: Video },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131519] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131519] text-white relative">
      {/* Background Gradients */}
      <div className="fixed blur-3xl filter left-[-352px] rounded-[1.67772e+07px] size-[800px] top-[-400px] pointer-events-none" style={{ backgroundImage: "linear-gradient(135deg, rgba(225, 113, 0, 0.2) 0%, rgba(245, 73, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      <div className="fixed blur-3xl filter left-[1501px] rounded-[1.67772e+07px] size-[800px] top-[580px] pointer-events-none" style={{ backgroundImage: "linear-gradient(-45deg, rgba(208, 135, 0, 0.2) 0%, rgba(225, 113, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      
      {/* Error/Message Alerts */}
      {error && (
        <div className="fixed top-4 right-4 z-[9998] backdrop-blur-md bg-red-500/20 border border-red-500/50 rounded-md p-4 flex items-center gap-3 max-w-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {message && (
        <div className="fixed top-4 right-4 z-[9998] backdrop-blur-md bg-green-500/20 border border-green-500/50 rounded-md p-4 flex items-center gap-3 max-w-md">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{message}</span>
        </div>
      )}
      
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

      {/* Password Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md mx-4"
          >
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
              <h3 className="text-2xl mb-6">Change Password</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all pr-10"
                    />
                    <button
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all pr-10"
                    />
                    <button
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all pr-10"
                    />
                    <button
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPasswordDialog(false)}
                  className="flex-1 px-6 py-3 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePassword}
                  className="flex-1 px-6 py-3 bg-white text-black hover:bg-white/90 rounded-md transition-all"
                >
                  Update Password
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md mx-4"
          >
            <div className="backdrop-blur-md bg-white/5 border border-red-500/50 rounded-md p-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl text-center mb-3">Delete Account</h3>
              <p className="text-white/60 text-center mb-4">
                This action cannot be undone. All your videos, projects, and data will be permanently deleted.
              </p>
              <input
                type="password"
                placeholder="Enter your password to confirm"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all mb-6"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteDialog(false); setDeletePassword(''); }}
                  className="flex-1 px-6 py-3 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-md transition-all disabled:opacity-50"
                >
                  {deletingAccount ? 'Deleting...' : 'Delete Account'}
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
          onNavigateToProfile={() => navigate("/profile")}
          onNavigateToSettings={() => {}}
          onNavigateToPlans={() => navigate("/plans")}
          onNavigateToReferral={() => navigate("/referral")}
          onLogout={handleLogoutClick}
        />
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl mb-2">Settings</h1>
            <p className="text-white/60">Manage your account settings and preferences</p>
          </div>

          {/* Tab Navigation */}
          <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-2 mb-8">
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-black'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Profile Information */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
                      <User className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-2xl mb-1">{currentUser?.displayName || 'User'}</h2>
                      <p className="text-white/60">{currentUser?.email}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-md p-4 mb-6">
                    <p className="text-sm text-white/60">
                      Account created on {currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>

                {/* Password Settings */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </h2>
                  <button
                    onClick={() => setShowPasswordDialog(true)}
                    className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-md transition-all flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </button>
                </div>

                {/* Language & Theme Settings */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Language & Theme
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Language</label>
                      <select
                        value={settings?.language || 'en'}
                        onChange={(e) => handleSaveSettings({ language: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                      >
                        <option value="en">English</option>
                        <option value="tr">Türkçe</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Theme</label>
                      <div className="flex gap-4">
                        {['light', 'dark'].map((t) => (
                          <button
                            key={t}
                            onClick={() => handleSaveSettings({ theme: t as any })}
                            className={`flex-1 px-4 py-3 rounded-md border-2 transition-all capitalize ${
                              settings?.theme === t
                                ? 'border-white bg-white/10'
                                : 'border-white/20 bg-white/5 hover:border-white/40'
                            }`}
                          >
                            {t === 'light' ? <Sun className="w-5 h-5 mx-auto mb-2" /> : <Moon className="w-5 h-5 mx-auto mb-2" />}
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
                  <h2 className="text-2xl mb-2 flex items-center gap-2">
                    <Bell className="w-6 h-6" />
                    Notification Preferences
                  </h2>
                  <p className="text-white/60 mb-8">Choose how you want to receive notifications</p>
                  
                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div className="flex items-start justify-between pb-6 border-b border-white/10">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-5 h-5 text-white/60" />
                          <span className="text-lg">Email Notifications</span>
                        </div>
                        <p className="text-sm text-white/60">Receive email updates about your account activity</p>
                      </div>
                      <button
                        onClick={() => handleSaveSettings({ notifications: { ...settings?.notifications!, email: !settings?.notifications?.email } })}
                        className={`relative w-14 h-8 rounded-full transition-all ml-4 ${
                          settings?.notifications?.email ? 'bg-white' : 'bg-white/20'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-black transition-transform ${
                            settings?.notifications?.email ? 'translate-x-6' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Project Updates */}
                    <div className="flex items-start justify-between pb-6 border-b border-white/10">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Video className="w-5 h-5 text-white/60" />
                          <span className="text-lg">Project Updates</span>
                        </div>
                        <p className="text-sm text-white/60">Get notified when your videos are ready or need attention</p>
                      </div>
                      <button
                        onClick={() => handleSaveSettings({ notifications: { ...settings?.notifications!, projectUpdates: !settings?.notifications?.projectUpdates } })}
                        className={`relative w-14 h-8 rounded-full transition-all ml-4 ${
                          settings?.notifications?.projectUpdates ? 'bg-white' : 'bg-white/20'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-black transition-transform ${
                            settings?.notifications?.projectUpdates ? 'translate-x-6' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Marketing Emails */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-5 h-5 text-white/60" />
                          <span className="text-lg">Marketing & Promotions</span>
                        </div>
                        <p className="text-sm text-white/60">Receive tips, special offers, and product updates</p>
                      </div>
                      <button
                        onClick={() => handleSaveSettings({ notifications: { ...settings?.notifications!, marketing: !settings?.notifications?.marketing } })}
                        className={`relative w-14 h-8 rounded-full transition-all ml-4 ${
                          settings?.notifications?.marketing ? 'bg-white' : 'bg-white/20'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-black transition-transform ${
                            settings?.notifications?.marketing ? 'translate-x-6' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Video Settings */}
            {activeTab === 'video' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Video Quality */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
                  <h2 className="text-2xl mb-2 flex items-center gap-2">
                    <Monitor className="w-6 h-6" />
                    Default Video Quality
                  </h2>
                  <p className="text-white/60 mb-8">Select your preferred video export quality</p>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { value: '720p', label: '720p HD', desc: 'Good quality, smaller file size' },
                      { value: '1080p', label: '1080p Full HD', desc: 'High quality, balanced' },
                      { value: '4k', label: '4K Ultra HD', desc: 'Best quality, larger files' }
                    ].map((quality) => (
                      <button
                        key={quality.value}
                        onClick={() => handleSaveSettings({ video: { ...settings?.video!, defaultQuality: quality.value as any } })}
                        className={`p-6 rounded-md border-2 transition-all text-left ${
                          settings?.video?.defaultQuality === quality.value
                            ? 'border-white bg-white/10 text-white'
                            : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{quality.label}</span>
                          {settings?.video?.defaultQuality === quality.value && (
                            <Check className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <p className="text-sm text-white/60">{quality.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Settings */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
                  <h2 className="text-xl mb-8">Project Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start justify-between pb-6 border-b border-white/10">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Save className="w-5 h-5 text-white/60" />
                          <span className="text-lg">Auto-save Projects</span>
                        </div>
                        <p className="text-sm text-white/60">Automatically save your progress every 5 minutes</p>
                      </div>
                      <button
                        onClick={() => handleSaveSettings({ video: { ...settings?.video!, autosave: !settings?.video?.autosave } })}
                        className={`relative w-14 h-8 rounded-full transition-all ml-4 ${
                          settings?.video?.autosave ? 'bg-white' : 'bg-white/20'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-black transition-transform ${
                            settings?.video?.autosave ? 'translate-x-6' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-3">Default Video Duration</label>
                      <select
                        value={settings?.video?.defaultDurationSeconds || 30}
                        onChange={(e) => handleSaveSettings({ video: { ...settings?.video!, defaultDurationSeconds: parseInt(e.target.value) } })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                      >
                        <option value="30">30 seconds</option>
                        <option value="60">60 seconds</option>
                        <option value="90">90 seconds</option>
                        <option value="120">120 seconds</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Storage */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
                  <h2 className="text-xl mb-6">Storage & Usage</h2>
                  {storageUsage && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Storage Used</span>
                        <span>{(storageUsage.usedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB / {(storageUsage.quotaBytes / (1024 * 1024 * 1024)).toFixed(0)} GB</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${storageUsage.percentageUsed}%` }}></div>
                      </div>
                      <div className="text-xs text-white/60 text-right">
                        {storageUsage.percentageUsed}% used
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Privacy & Security */}
            {activeTab === 'privacy' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Privacy Settings */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
                  <h2 className="text-2xl mb-2 flex items-center gap-2">
                    <Shield className="w-6 h-6" />
                    Privacy & Security
                  </h2>
                  <p className="text-white/60 mb-8">
                    Your privacy is important to us. We use industry-standard security measures to protect your data.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={handleExportData}
                      className="flex items-center gap-3 px-6 py-4 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all text-left"
                    >
                      <Download className="w-5 h-5" />
                      <div>
                        <div className="mb-1">Download My Data</div>
                        <div className="text-xs text-white/60">Get a copy of your data</div>
                      </div>
                    </button>
                    
                    <button
                      className="flex items-center gap-3 px-6 py-4 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all text-left"
                      onClick={() => window.open('/privacy', '_blank')}
                    >
                      <FileText className="w-5 h-5" />
                      <div>
                        <div className="mb-1">Privacy Policy</div>
                        <div className="text-xs text-white/60">Review our privacy policy</div>
                      </div>
                    </button>

                    <button
                      className="flex items-center gap-3 px-6 py-4 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all text-left"
                      onClick={() => window.open('/terms', '_blank')}
                    >
                      <FileText className="w-5 h-5" />
                      <div>
                        <div className="mb-1">Terms of Service</div>
                        <div className="text-xs text-white/60">Read our terms</div>
                      </div>
                    </button>

                    <a
                      href="mailto:support@imobmotion.com"
                      className="flex items-center gap-3 px-6 py-4 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all text-left"
                    >
                      <Mail className="w-5 h-5" />
                      <div>
                        <div className="mb-1">Contact Support</div>
                        <div className="text-xs text-white/60">Report security issues</div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="backdrop-blur-md bg-red-500/5 border border-red-500/20 rounded-md p-8">
                  <h2 className="text-2xl mb-2 flex items-center gap-2 text-red-500">
                    <Trash2 className="w-6 h-6" />
                    Danger Zone
                  </h2>
                  <p className="text-white/60 mb-6">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-md transition-all"
                  >
                    Delete Account
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
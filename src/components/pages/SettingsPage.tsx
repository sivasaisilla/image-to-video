import { useState } from "react";
import { User, Mail, Lock, Bell, Video, Globe, Shield, Trash2, ArrowLeft, ChevronDown, LogOut, Save, Check, CreditCard, Download, FileText, Smartphone, Monitor, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { DashboardHeader } from "../layout/DashboardHeader";

interface SettingsPageProps {
  onBack: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToProjects?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToPlans?: () => void;
  onNavigateToReferral?: () => void;
  onLogout: () => void;
}

export function SettingsPage({ onBack, onNavigateToCreate, onNavigateToProjects, onNavigateToProfile, onNavigateToPlans, onNavigateToReferral, onLogout }: SettingsPageProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'video' | 'privacy'>('account');

  // Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [videoQuality, setVideoQuality] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
    setIsUserMenuOpen(false);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'video', label: 'Video Settings', icon: Video },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ] as const;

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
              <p className="text-white/60 text-center mb-8">
                This action cannot be undone. All your videos, projects, and data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 px-6 py-3 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    // Handle account deletion
                  }}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-md transition-all duration-300"
                >
                  Delete Account
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
          onNavigateToProfile={onNavigateToProfile}
          onNavigateToSettings={() => {}}
          onNavigateToPlans={onNavigateToPlans}
          onNavigateToReferral={onNavigateToReferral}
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
                      <h2 className="text-2xl mb-1">John Doe</h2>
                      <p className="text-white/60">john.doe@example.com</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue="John Doe"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Company</label>
                      <input
                        type="text"
                        defaultValue="Creative Studios Inc."
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue="+1 (555) 123-4567"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Time Zone</label>
                      <select
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                      >
                        <option value="utc">UTC (GMT+0)</option>
                        <option value="est">Eastern Time (GMT-5)</option>
                        <option value="pst">Pacific Time (GMT-8)</option>
                        <option value="gmt+3">Istanbul (GMT+3)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-md transition-all flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button className="px-6 py-3 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all">
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Email Settings */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Address
                  </h2>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      defaultValue="john.doe@example.com"
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                    />
                    <button className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-md transition-all whitespace-nowrap">
                      Update Email
                    </button>
                  </div>
                </div>

                {/* Password & Language Settings */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Password Settings */}
                  <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
                    <h2 className="text-xl mb-6 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Change Password
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Current Password</label>
                        <input
                          type="password"
                          placeholder="Enter current password"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-2">New Password</label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Confirm Password</label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                        />
                      </div>
                      <button className="w-full px-6 py-3 bg-white text-black hover:bg-white/90 rounded-md transition-all">
                        Change Password
                      </button>
                    </div>
                  </div>

                  {/* Language & Region */}
                  <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
                    <h2 className="text-xl mb-6 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Language & Region
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Language</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
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
                        <label className="block text-sm text-white/60 mb-2">Region</label>
                        <select
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                        >
                          <option value="us">United States</option>
                          <option value="tr">Turkey</option>
                          <option value="uk">United Kingdom</option>
                          <option value="de">Germany</option>
                        </select>
                      </div>
                      <button className="w-full px-6 py-3 bg-white text-black hover:bg-white/90 rounded-md transition-all flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Preferences
                      </button>
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
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`relative w-14 h-8 rounded-full transition-all ml-4 ${
                          emailNotifications ? 'bg-white' : 'bg-white/20'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-black transition-transform ${
                            emailNotifications ? 'translate-x-6' : ''
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
                        onClick={() => setProjectUpdates(!projectUpdates)}
                        className={`relative w-14 h-8 rounded-full transition-all ml-4 ${
                          projectUpdates ? 'bg-white' : 'bg-white/20'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-black transition-transform ${
                            projectUpdates ? 'translate-x-6' : ''
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
                        onClick={() => setMarketingEmails(!marketingEmails)}
                        className={`relative w-14 h-8 rounded-full transition-all ml-4 ${
                          marketingEmails ? 'bg-white' : 'bg-white/20'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-black transition-transform ${
                            marketingEmails ? 'translate-x-6' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
                  <h2 className="text-xl mb-6 flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Push Notifications
                  </h2>
                  <p className="text-white/60 mb-6 text-sm">
                    Manage push notifications for desktop and mobile devices
                  </p>
                  <button className="px-6 py-3 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all">
                    Configure Push Notifications
                  </button>
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
                        onClick={() => setVideoQuality(quality.value as any)}
                        className={`p-6 rounded-md border-2 transition-all text-left ${
                          videoQuality === quality.value
                            ? 'border-white bg-white/10 text-white'
                            : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{quality.label}</span>
                          {videoQuality === quality.value && (
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
                        onClick={() => setAutoSave(!autoSave)}
                        className={`relative w-14 h-8 rounded-full transition-all ml-4 ${
                          autoSave ? 'bg-white' : 'bg-white/20'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-black transition-transform ${
                            autoSave ? 'translate-x-6' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-3">Default Video Duration</label>
                      <select
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40 transition-all"
                      >
                        <option value="30">30 seconds</option>
                        <option value="60">60 seconds</option>
                        <option value="90">90 seconds</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Storage */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
                  <h2 className="text-xl mb-6">Storage & Usage</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Storage Used</span>
                      <span>2.4 GB / 50 GB</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: '4.8%' }}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <button className="px-6 py-3 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all">
                        Clear Cache
                      </button>
                      <button className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-md transition-all">
                        Upgrade Storage
                      </button>
                    </div>
                  </div>
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
                    <button className="flex items-center gap-3 px-6 py-4 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all text-left">
                      <Download className="w-5 h-5" />
                      <div>
                        <div className="mb-1">Download My Data</div>
                        <div className="text-xs text-white/60">Get a copy of your data</div>
                      </div>
                    </button>
                    
                    <button className="flex items-center gap-3 px-6 py-4 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all text-left">
                      <FileText className="w-5 h-5" />
                      <div>
                        <div className="mb-1">Privacy Policy</div>
                        <div className="text-xs text-white/60">Review our privacy policy</div>
                      </div>
                    </button>

                    <button className="flex items-center gap-3 px-6 py-4 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all text-left">
                      <FileText className="w-5 h-5" />
                      <div>
                        <div className="mb-1">Terms of Service</div>
                        <div className="text-xs text-white/60">Read our terms</div>
                      </div>
                    </button>

                    <button className="flex items-center gap-3 px-6 py-4 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all text-left">
                      <Lock className="w-5 h-5" />
                      <div>
                        <div className="mb-1">Two-Factor Auth</div>
                        <div className="text-xs text-white/60">Enable 2FA</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Sessions */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
                  <h2 className="text-xl mb-6">Active Sessions</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-md">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-white/60" />
                        <div>
                          <div className="mb-1">MacBook Pro - Chrome</div>
                          <div className="text-xs text-white/60">San Francisco, CA • Active now</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded text-xs">Current</span>
                    </div>
                    <button className="w-full px-6 py-3 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all">
                      Log Out All Other Sessions
                    </button>
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
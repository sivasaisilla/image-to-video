import { useState, useEffect } from "react";
import { Gift, Copy, Check, Users, CreditCard, Award, Clock, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { DashboardHeader } from "../layout/DashboardHeader";

interface ReferralPageProps {
  onNavigateToCreate?: () => void;
  onNavigateToProjects?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToPlans?: () => void;
  onLogout?: () => void;
}

interface FreeCredit {
  id: string;
  earnedFrom: string;
  earnedDate: string;
  expiryDate: string;
  status: 'available' | 'used' | 'expired';
  usedDate?: string;
  seconds: number;
}

export function ReferralPage({
  onNavigateToCreate,
  onNavigateToProjects,
  onNavigateToProfile,
  onNavigateToSettings,
  onNavigateToPlans,
  onLogout,
}: ReferralPageProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'program' | 'history'>('program');
  
  // Mock referral code - in production this would come from backend
  const referralCode = "IC-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock free credits data (now in seconds)
  const freeCredits: FreeCredit[] = [
    {
      id: "fc-1",
      earnedFrom: "Sarah Johnson",
      earnedDate: "Dec 15, 2024",
      expiryDate: "Jan 14, 2025",
      status: "available",
      seconds: 60
    },
    {
      id: "fc-2",
      earnedFrom: "Emma Wilson",
      earnedDate: "Dec 20, 2024",
      expiryDate: "Jan 19, 2025",
      status: "available",
      seconds: 60
    },
    {
      id: "fc-3",
      earnedFrom: "Michael Chen",
      earnedDate: "Nov 10, 2024",
      expiryDate: "Dec 10, 2024",
      status: "used",
      usedDate: "Nov 25, 2024",
      seconds: 60
    },
    {
      id: "fc-4",
      earnedFrom: "David Lee",
      earnedDate: "Oct 5, 2024",
      expiryDate: "Nov 4, 2024",
      status: "expired",
      seconds: 60
    }
  ];

  const availableCredits = freeCredits.filter(c => c.status === 'available');
  const usedCredits = freeCredits.filter(c => c.status === 'used');
  const expiredCredits = freeCredits.filter(c => c.status === 'expired');

  const totalAvailableSeconds = availableCredits.reduce((sum, c) => sum + c.seconds, 0);
  const totalUsedSeconds = usedCredits.reduce((sum, c) => sum + c.seconds, 0);
  const totalEarnedSeconds = freeCredits.reduce((sum, c) => sum + c.seconds, 0);

  const referralHistory = [
    { name: "Sarah Johnson", status: "completed", date: "Dec 15, 2024", reward: "60s" },
    { name: "Michael Chen", status: "pending", date: "Dec 18, 2024", reward: "Pending" },
    { name: "Emma Wilson", status: "completed", date: "Dec 20, 2024", reward: "60s" },
  ];

  return (
    <div className="min-h-screen bg-[#131519] text-white relative">
      {/* Background Gradients */}
      <div className="fixed blur-3xl filter left-[-352px] rounded-[1.67772e+07px] size-[800px] top-[-400px] pointer-events-none" style={{ backgroundImage: "linear-gradient(135deg, rgba(225, 113, 0, 0.2) 0%, rgba(245, 73, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      <div className="fixed blur-3xl filter left-[1501px] rounded-[1.67772e+07px] size-[800px] top-[580px] pointer-events-none" style={{ backgroundImage: "linear-gradient(-45deg, rgba(208, 135, 0, 0.2) 0%, rgba(225, 113, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />

      {/* Header */}
      <header className="sticky top-0 px-8 py-4 z-50">
        <DashboardHeader
          onNavigateToCreate={onNavigateToCreate}
          onNavigateToProjects={onNavigateToProjects}
          onNavigateToProfile={onNavigateToProfile}
          onNavigateToSettings={onNavigateToSettings}
          onNavigateToPlans={onNavigateToPlans}
          onNavigateToReferral={() => {}}
          onLogout={onLogout}
          activePage="referral"
        />
      </header>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl text-white">Refer a agent Program</h1>
                <p className="text-sm text-white/50">Earn rewards by referring friends</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-[10px] p-1">
              <button
                onClick={() => setActiveTab('program')}
                className={`flex-1 px-4 py-2.5 rounded-[10px] text-sm transition-all ${
                  activeTab === 'program'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Refer a agent Program
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-4 py-2.5 rounded-[10px] text-sm transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Earnings History
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'program' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Referral Code Card */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[10px] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg text-white">Your Referral Code</h3>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-[10px] px-4 py-3">
                    <p className="text-xl text-center text-white tracking-wider font-mono">{referralCode}</p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-2 px-4 py-3 bg-white text-black hover:bg-white/90 rounded-[10px] transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-white/40 text-center">
                  Share this code with friends to unlock rewards
                </p>
              </div>

              {/* How It Works */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[10px] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg text-white">How It Works</h3>
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                  {[
                    {
                      step: "1",
                      title: "Share Your Code",
                      description: "Send your unique referral code to friends",
                      icon: Users,
                    },
                    {
                      step: "2",
                      title: "Friend Creates Video",
                      description: "They sign up with your code and get 50% off",
                      icon: CreditCard,
                    },
                    {
                      step: "3",
                      title: "You Both Win",
                      description: "Get 60s free credit when they pay",
                      icon: Gift,
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex-1 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mb-3">
                        <item.icon className="w-6 h-6 text-white/60" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-white/40">Step {item.step}</span>
                      </div>
                      <h4 className="text-sm mb-1 text-white">{item.title}</h4>
                      <p className="text-xs text-white/50">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Referrer Benefit */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[10px] p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4 text-white/60" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm mb-2 text-white">You Earn</h4>
                      <div className="space-y-1.5 text-xs text-white/50">
                        <div className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-white/40 mt-1.5"></div>
                          <span>60s free credit per referral</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-white/40 mt-1.5"></div>
                          <span>Unlimited referrals allowed</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-white/40 mt-1.5"></div>
                          <span>Credits expire in 30 days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Friend Benefit */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[10px] p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-white/60" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm mb-2 text-white">Your Friend Gets</h4>
                      <div className="space-y-1.5 text-xs text-white/50">
                        <div className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-white/40 mt-1.5"></div>
                          <span>50% off first video</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-white/40 mt-1.5"></div>
                          <span>All plans eligible</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-white/40 mt-1.5"></div>
                          <span>One-time discount</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[10px] p-5">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white/60 text-xs">i</span>
                  </div>
                  <div>
                    <h4 className="text-sm mb-2 text-white">Terms & Conditions</h4>
                    <ul className="space-y-1.5 text-xs text-white/50">
                      <li>• Free credits expire 30 days after being unlocked</li>
                      <li>• Credits are applied in the order they were earned (FIFO)</li>
                      <li>• Self-referrals are not permitted and will void rewards</li>
                      <li>• Referral rewards cannot be combined with other promotional offers</li>
                      <li>• Fraudulent activity will result in account suspension</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[10px] p-5 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-white/5 border border-white/10 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="text-2xl mb-1 text-white">{totalAvailableSeconds}s</div>
                  <p className="text-xs text-white/40">Available Credits</p>
                </div>

                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[10px] p-5 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-white/5 border border-white/10 mb-3">
                    <Award className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="text-2xl mb-1 text-white">{totalUsedSeconds}s</div>
                  <p className="text-xs text-white/40">Used Credits</p>
                </div>

                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[10px] p-5 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-white/5 border border-white/10 mb-3">
                    <Gift className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="text-2xl mb-1 text-white">{totalEarnedSeconds}s</div>
                  <p className="text-xs text-white/40">Total Earned</p>
                </div>
              </div>

              {/* Free Credits List & Referral Activity - Side by Side */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Free Credits List */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[10px] overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg text-white">Free Credit History</h3>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                    {/* Available Credits */}
                    {availableCredits.map((credit) => (
                      <div key={credit.id} className="p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 rounded-[10px] bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                              <Gift className="w-4 h-4 text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm text-white">{credit.seconds}s Free Credit</p>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[10px] bg-green-500/10 border border-green-500/20">
                                  <span className="text-xs text-green-400">Available</span>
                                </span>
                              </div>
                              <p className="text-xs text-white/40 mb-1">From {credit.earnedFrom}</p>
                              <div className="flex items-center gap-2 text-xs text-white/30">
                                <Clock className="w-3 h-3" />
                                <span>Expires {credit.expiryDate}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Used Credits */}
                    {usedCredits.map((credit) => (
                      <div key={credit.id} className="p-4 hover:bg-white/5 transition-colors opacity-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-white/40" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm text-white">{credit.seconds}s Free Credit</p>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[10px] bg-white/5 border border-white/10">
                                  <span className="text-xs text-white/40">Used</span>
                                </span>
                              </div>
                              <p className="text-xs text-white/40 mb-1">From {credit.earnedFrom}</p>
                              <p className="text-xs text-white/30">Used on {credit.usedDate}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Expired Credits */}
                    {expiredCredits.map((credit) => (
                      <div key={credit.id} className="p-4 hover:bg-white/5 transition-colors opacity-30">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 rounded-[10px] bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                              <XCircle className="w-4 h-4 text-red-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm text-white">{credit.seconds}s Free Credit</p>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[10px] bg-red-500/10 border border-red-500/20">
                                  <span className="text-xs text-red-400">Expired</span>
                                </span>
                              </div>
                              <p className="text-xs text-white/40 mb-1">From {credit.earnedFrom}</p>
                              <p className="text-xs text-white/30">Expired {credit.expiryDate}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Referral Activity */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[10px] overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg text-white">Refer a agent Activity</h3>
                    </div>
                  </div>
                  
                  {referralHistory.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {referralHistory.map((referral, index) => (
                        <div key={index} className="p-4 hover:bg-white/5 transition-colors">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-white/60" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white mb-0.5 truncate">{referral.name}</p>
                                <p className="text-xs text-white/40">{referral.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs ${
                                referral.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                {referral.reward}
                              </span>
                              <div className={`w-2 h-2 rounded-full ${
                                referral.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'
                              }`}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-[10px] bg-white/5 border border-white/10 mb-3">
                        <Users className="w-6 h-6 text-white/30" />
                      </div>
                      <p className="text-sm text-white/40">No referrals yet</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
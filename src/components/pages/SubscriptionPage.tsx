import { useState } from "react";
import { ArrowLeft, CreditCard, Crown, Check, Mail, MessageCircle, Infinity, Plus, FolderOpen, Image, User, ChevronDown, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardHeader } from "../layout/DashboardHeader";

interface SubscriptionPageProps {
  onClose: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToProjects?: () => void;
  onNavigateToImageEdit?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToReferral?: () => void;
  onLogout?: () => void;
}

export function SubscriptionPage({ onClose, onNavigateToCreate, onNavigateToProjects, onNavigateToImageEdit, onNavigateToProfile, onNavigateToSettings, onNavigateToReferral, onLogout }: SubscriptionPageProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
    setIsUserMenuOpen(false);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    onLogout?.();
  };

  const plans = [
    {
      name: 'Starter',
      price: 9.90,
      duration: '30 second video',
      features: [
        'Website video',
        'MLS Listing video',
        'Social media reel',
        'Custom branded videos',
        '1080 video output',
        'Company logo & watermarks',
        'Dedicated support',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      price: 15.90,
      duration: '60 second video',
      features: [
        'Website video',
        'MLS Listing video',
        'Social media reel',
        'Custom branded videos',
        '1080 video output',
        'Company logo & watermarks',
        'Dedicated support',
        'API Access',
      ],
      popular: false,
    },
    {
      name: 'Exclusive',
      price: 19.90,
      duration: '90 second video',
      features: [
        'Website video',
        'MLS Listing video',
        'Social media reel',
        'Custom branded videos',
        '1080 video output',
        'Company logo & watermarks',
        'Dedicated support',
        'API Access',
      ],
      popular: true,
    },
  ];

  return (
    <div className="fixed inset-0 bg-[#131519] z-50 flex flex-col overflow-y-auto">
      {/* Background Gradients */}
      <div className="absolute blur-3xl filter left-[-352px] rounded-[1.67772e+07px] size-[800px] top-[-400px] pointer-events-none" style={{ backgroundImage: "linear-gradient(135deg, rgba(225, 113, 0, 0.2) 0%, rgba(245, 73, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      <div className="absolute blur-3xl filter left-[1501px] rounded-[1.67772e+07px] size-[800px] top-[580px] pointer-events-none" style={{ backgroundImage: "linear-gradient(-45deg, rgba(208, 135, 0, 0.2) 0%, rgba(225, 113, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      
      {/* Header */}
      <header className="sticky top-0 px-8 py-4 z-50">
        <DashboardHeader
          onNavigateToCreate={onNavigateToCreate}
          onNavigateToProjects={onNavigateToProjects}
          onNavigateToProfile={onNavigateToProfile}
          onNavigateToSettings={onNavigateToSettings}
          onNavigateToPlans={() => {}}
          onNavigateToReferral={onNavigateToReferral}
          onLogout={onLogout}
          activePage="plans"
        />
      </header>

      {/* Main Content */}
      <div className="flex-1 px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-16">
            <h1 className="text-5xl mb-4 text-white">Choose Your Plan</h1>
            <p className="text-lg text-white/60">
              Select the perfect plan for your video creation needs.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-16">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col relative transition-all ${
                  plan.popular
                    ? 'bg-white/10 border-2 border-white/40'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-black rounded-full text-xs">
                    Most Popular
                  </div>
                )}

                {/* Plan Name */}
                <div className="mb-8">
                  <h3 className="text-3xl mb-4 text-white">{plan.name}</h3>
                  <div className="text-3xl text-white/60">{plan.duration}</div>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl text-white">
                      €{plan.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex-1 mb-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-sm bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-white/60" strokeWidth={3} />
                        </div>
                        <span className="text-white/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-4 rounded-md transition-all ${
                    plan.popular
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>

          {/* All Features Comparison */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 mb-16">
            <h3 className="text-2xl mb-6 text-white">All Features Included</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              {plans[2].features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white/60" />
                  </div>
                  <span className="text-white/70">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise Section */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white/60" />
                  </div>
                  <div>
                    <h3 className="text-2xl text-white">Enterprise</h3>
                    <p className="text-sm text-white/50">Custom solution for your team</p>
                  </div>
                </div>

                <p className="text-sm text-white/60 mb-6 leading-relaxed">
                  Get dedicated support, custom integrations, and unlimited usage tailored to your organization's needs.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                    <span className="text-white/70">Unlimited videos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                    <span className="text-white/70">Account manager</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                    <span className="text-white/70">Custom integrations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                    <span className="text-white/70">SLA support</span>
                  </div>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex flex-col gap-3">
                <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all">
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact Sales</span>
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 transition-all text-sm">
                  <Mail className="w-4 h-4" />
                  <span>Email Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Dialog */}
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
    </div>
  );
}
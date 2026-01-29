import { useState } from "react";
import { Gift, Copy, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ReferralPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReferralPage?: () => void;
}

export function ReferralPopup({ isOpen, onClose, onViewReferralPage }: ReferralPopupProps) {
  const [copied, setCopied] = useState(false);
  
  // Mock referral code - in production this would come from backend
  const referralCode = "IC-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Popup Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg"
          >
            <div className="backdrop-blur-md bg-[#131519] border border-white/20 rounded-2xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Header with Gradient */}
              <div className="relative px-8 pt-12 pb-8 overflow-hidden">
                {/* Background Gradient */}
                <div 
                  className="absolute inset-0 opacity-30" 
                  style={{ 
                    background: "linear-gradient(135deg, rgba(225, 113, 0, 0.3) 0%, rgba(245, 73, 0, 0.2) 100%)" 
                  }} 
                />
                
                {/* Icon */}
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-6"
                  >
                    <Gift className="w-8 h-8 text-amber-400" />
                  </motion.div>
                  
                  <h2 className="mb-3 flex items-center gap-3">
                    <Gift className="w-8 h-8 text-amber-400" />
                    <span>Share the Magic</span>
                  </h2>
                  <p className="text-white/60 leading-relaxed">
                    Share ImobMotion with friends and unlock rewards together
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 pb-8">
                {/* Benefits */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="backdrop-blur-md bg-white/5 border border-amber-500/20 rounded-2xl p-4">
                    <div className="text-2xl mb-1 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">50% OFF</div>
                    <p className="text-sm text-white/60">For your friend's first video</p>
                  </div>
                  <div className="backdrop-blur-md bg-white/5 border border-orange-500/20 rounded-2xl p-4">
                    <div className="text-2xl mb-1 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Free Video</div>
                    <p className="text-sm text-white/60">60s video when they create theirs</p>
                  </div>
                </div>

                {/* Referral Code */}
                <div className="mb-6">
                  <p className="text-sm text-white/50 mb-3">Your Referral Code</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 backdrop-blur-md bg-black/40 border border-white/20 rounded-2xl px-4 py-3">
                      <p className="text-xl text-center text-white tracking-wider">{referralCode}</p>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span className="text-sm">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          <span className="text-sm">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* How it works */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                  <p className="text-sm mb-3 text-white/70">How it works:</p>
                  <div className="space-y-2 text-sm text-white/60">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-amber-400">1</span>
                      </div>
                      <p>Share your code with friends</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-amber-400">2</span>
                      </div>
                      <p>They sign up and get 50% off their first video</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-amber-400">3</span>
                      </div>
                      <p>You get a free 60-second video when they create theirs</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={onViewReferralPage}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl transition-all"
                  >
                    View Full Referral Program
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl transition-all"
                  >
                    Maybe Later
                  </button>
                </div>

                {/* Fine Print */}
                <p className="text-xs text-white/40 mt-4 text-center">
                  Free videos expire 30 days after unlock. Terms apply.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
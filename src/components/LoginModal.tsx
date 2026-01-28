import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock } from "lucide-react";
import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login:", { email, password });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 rounded-md p-8 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-md backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl lg:text-4xl mb-2">
                  Sign In
                </h2>
                <p className="text-white/60">
                  Welcome back! Please enter your details.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm text-white/80 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Mail className="w-5 h-5 text-white/40" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-3 backdrop-blur-md bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm text-white/80 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Lock className="w-5 h-5 text-white/40" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-4 py-3 backdrop-blur-md bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 60px rgba(251, 191, 36, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-md transition-all shadow-2xl"
                >
                  Sign In
                </motion.button>

                {/* Sign Up Link */}
                <p className="text-center text-white/60">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

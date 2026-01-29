import { motion } from "motion/react";
import { Mail, Lock, ArrowLeft, Chrome, Apple, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";

interface LoginPageProps {
  onBack: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  onLoginSuccess: () => void;
}

export function LoginPage({ onBack, onSwitchToRegister, onSwitchToForgotPassword, onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = 'http://localhost:3003/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess();
      } else {
        const errorData = await response.json();
        
        // Handle specific error for unregistered users
        if (errorData.code === 'USER_NOT_FOUND') {
          setError(
            `${errorData.error}\n\nClick here to sign up`
          );
        } else if (errorData.code === 'WRONG_PASSWORD') {
          setError(
            `${errorData.error}\n\nPlease check your password and try again.`
          );
        } else {
          setError(errorData.error || 'Login failed. Please check your credentials.');
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1410] overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-rain-drops-colliding-on-a-surface-19497-large.mp4"
            type="video/mp4"
          />
          <source
            src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-[#1a1410]/85"></div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-amber-600/20 via-orange-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-tl from-yellow-600/20 via-amber-600/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="absolute top-8 left-8 z-10 flex items-center gap-2 px-6 py-3 backdrop-blur-md bg-white/10 border border-white/20 rounded-md hover:bg-white/20 transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </motion.button>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl xl:text-6xl mb-6 leading-tight">
                  Welcome back to
                  <br />
                  <span className="bg-gradient-to-r from-amber-300 via-amber-100 to-amber-300 bg-clip-text text-transparent">
                    ImobMotion
                  </span>
                </h1>
                <p className="text-white/70 text-lg leading-relaxed">
                  Transform your real estate listings with AI-powered video creation.
                  Sign in to continue your creative journey.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {[
                  "Generate stunning videos in minutes",
                  "AI-powered customization tools",
                  "Professional results guaranteed",
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
                    <span className="text-white/80">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8 lg:p-12">
              <div className="mb-8">
                <h2 className="text-3xl mb-2">Sign In</h2>
                <p className="text-white/60">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-sm text-white/70 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm text-white/70 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400/50"
                    />
                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={onSwitchToForgotPassword}
                    className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-md hover:shadow-2xl hover:shadow-amber-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-white/40">Or continue with</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-3 py-3 backdrop-blur-md bg-white/5 border border-white/20 rounded-md hover:bg-white/10 transition-all"
                  >
                    <Chrome className="w-5 h-5" />
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-3 py-3 backdrop-blur-md bg-white/5 border border-white/20 rounded-md hover:bg-white/10 transition-all"
                  >
                    <Apple className="w-5 h-5" />
                    <span>Apple</span>
                  </button>
                </div>
              </form>

              {/* Register Link */}
              <div className="mt-8 text-center">
                <span className="text-white/60">Don&apos;t have an account? </span>
                <button
                  onClick={onSwitchToRegister}
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
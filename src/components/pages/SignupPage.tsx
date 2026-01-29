import { motion } from "motion/react";
import { Mail, Lock, ArrowLeft, Chrome, Apple, Loader2, AlertCircle, CheckCircle, User, Eye, EyeOff, Phone } from "lucide-react";
import { useState } from "react";

interface SignupPageProps {
  onBack: () => void;
  onSwitchToLogin: () => void;
  onSignupSuccess: () => void;
}

type SignupStep = 'email' | 'otp' | 'password' | 'success';

export function SignupPage({ onBack, onSwitchToLogin, onSignupSuccess }: SignupPageProps) {
  const [currentStep, setCurrentStep] = useState<SignupStep>('email');
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE = 'http://localhost:3003/api';

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Check if email already exists
      const checkResponse = await fetch(`${API_BASE}/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        setError(checkData.message);
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
        return;
      }

      // Send OTP
      const otpResponse = await fetch(`${API_BASE}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const otpData = await otpResponse.json();

      if (otpData.success) {
        // Display the OTP in the success message for testing
        const successMessage = otpData.otp 
          ? `OTP sent to your email! For testing, your OTP is: ${otpData.otp}`
          : "OTP sent to your email! Please check your inbox.";
        setSuccess(successMessage);
        setCurrentStep('otp');
      } else {
        setError(otpData.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Email verified! Now create your password.");
        setCurrentStep('password');
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: userName, phone: phoneNumber })
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentStep('success');
        setTimeout(() => {
          onSignupSuccess();
        }, 2000);
      } else {
        // Handle specific error for already registered email
        if (data.code === 'EMAIL_ALREADY_IN_USE') {
          setError(
            `${data.error}\n\nTry signing in with this email or use a different email address.`
          );
        } else {
          setError(data.error || "Signup failed");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8 lg:p-12">
        <div className="mb-8">
          <h2 className="text-3xl mb-2">Create Account</h2>
          <p className="text-white/60">Start your journey with IMOB Motion</p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-white/70 mb-2">Your Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all"
                required
              />
            </div>
          </div>

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

          <div>
            <label className="block text-sm text-white/70 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm">{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !userName || !phoneNumber}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-md hover:shadow-2xl hover:shadow-amber-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <span className="text-white/60">Already have an account? </span>
          <button
            onClick={onSwitchToLogin}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderOTPStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8 lg:p-12">
        <div className="mb-8">
          <h2 className="text-3xl mb-2">Verify Email</h2>
          <p className="text-white/60">We sent a 6-digit code to {email}</p>
        </div>

        <form onSubmit={handleOTPSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-white/70 mb-2">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all text-center text-2xl tracking-widest"
              maxLength={6}
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-md hover:shadow-2xl hover:shadow-amber-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep('email')}
            className="w-full py-3 backdrop-blur-md bg-white/5 border border-white/20 rounded-md hover:bg-white/10 transition-all"
          >
            Back to Email
          </button>
        </form>
      </div>
    </motion.div>
  );

  const renderPasswordStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8 lg:p-12">
        <div className="mb-8">
          <h2 className="text-3xl mb-2">Create Password</h2>
          <p className="text-white/60">Set a secure password for your account</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-white/70 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-md hover:shadow-2xl hover:shadow-amber-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Complete Signup'
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-12">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-3xl mb-4">Account Created!</h2>
        <p className="text-white/60 mb-8">Welcome to IMOB Motion! Redirecting to your dashboard...</p>
        <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto rounded-full animate-pulse"></div>
      </div>
    </motion.div>
  );

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
                  Join
                  <br />
                  <span className="bg-gradient-to-r from-amber-300 via-amber-100 to-amber-300 bg-clip-text text-transparent">
                    IMOB Motion
                  </span>
                </h1>
                <p className="text-white/70 text-lg leading-relaxed">
                  Create stunning real estate videos with AI. 
                  Start your free trial today and transform your listings.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {[
                  "AI-powered video generation",
                  "Professional templates",
                  "Email verification security",
                  "No credit card required"
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

          {/* Right Side - Form */}
          {currentStep === 'email' && renderEmailStep()}
          {currentStep === 'otp' && renderOTPStep()}
          {currentStep === 'password' && renderPasswordStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
}

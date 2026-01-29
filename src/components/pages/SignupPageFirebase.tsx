import { motion } from "motion/react";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { firebaseAuthService } from "../../services/firebaseAuth";
import { otpService } from "../../services/otpService";
import { sendOTPEmail } from "../../services/emailService";

interface SignupPageProps {
  onBack: () => void;
  onSwitchToLogin: () => void;
  onSignupSuccess: () => void;
}

type SignupStep = 'email' | 'otp' | 'password' | 'success';

export function SignupPageFirebase({ onBack, onSwitchToLogin, onSignupSuccess }: SignupPageProps) {
  const [currentStep, setCurrentStep] = useState<SignupStep>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await firebaseAuthService.signInWithGoogle();

      if (result.success) {
        setSuccess("Google sign-up successful! Redirecting...");
        setTimeout(() => {
          onSignupSuccess();
        }, 1500);
      } else {
        setError(result.error || "Google sign-up failed. Please try again.");
      }
    } catch (error) {
      console.error('Google sign-up error:', error);
      setError("An unexpected error occurred during Google sign-up.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await firebaseAuthService.signInWithApple();

      if (result.success) {
        setSuccess("Apple sign-up successful! Redirecting...");
        setTimeout(() => {
          onSignupSuccess();
        }, 1500);
      } else {
        setError(result.error || "Apple sign-up failed. Please try again.");
      }
    } catch (error) {
      console.error('Apple sign-up error:', error);
      setError("An unexpected error occurred during Apple sign-up.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Check if email already exists in Firebase
      const userExists = await firebaseAuthService.checkUserExists(email);

      if (userExists) {
        setError("An account with this email already exists. Redirecting to login...");
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
        return;
      }

      // Generate and store OTP
      const newOTP = otpService.generateOTP();
      const otpStored = await otpService.storeOTP(email, newOTP);

      if (!otpStored) {
        setError("Failed to generate OTP. Please try again.");
        return;
      }

      // Send OTP email
      const emailSent = await sendOTPEmail(email, newOTP);
      
      if (emailSent) {
        setGeneratedOTP(newOTP); // For development/testing
        setSuccess("OTP sent to your email!");
        setCurrentStep('otp');
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error('Email submission error:', error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const verification = await otpService.verifyOTP(email, otp);

      if (verification.success) {
        setSuccess("Email verified successfully!");
        setTimeout(() => {
          setCurrentStep('password');
        }, 1000);
      } else {
        setError(verification.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const result = await firebaseAuthService.createUser(email, password);

      if (result.success) {
        setSuccess("Account created successfully!");
        setTimeout(() => {
          setCurrentStep('success');
          setTimeout(() => {
            onSignupSuccess();
          }, 2000);
        }, 1000);
      } else {
        setError(result.error || "Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error('Password submission error:', error);
      setError("An error occurred while creating your account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError("");

    try {
      const newOTP = otpService.generateOTP();
      const otpStored = await otpService.storeOTP(email, newOTP);

      if (otpStored) {
        const emailSent = await sendOTPEmail(email, newOTP);
        if (emailSent) {
          setSuccess("New OTP sent to your email!");
        } else {
          setError("Failed to resend OTP. Please try again.");
        }
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-gray-400">Start your journey with us</p>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 text-sm">{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            'Continue'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Sign In
          </button>
        </p>
      </div>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-gray-400">Or sign up with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-white/20 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Google
          </button>
          <button
            type="button"
            onClick={handleAppleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-white/20 rounded-lg text-white bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            )}
            Apple
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderOTPStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Verify Email</h2>
        <p className="text-gray-400">We sent a 6-digit code to {email}</p>
      </div>

      <form onSubmit={handleOTPSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Enter OTP
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="000000"
            maxLength={6}
            required
          />
          {process.env.NODE_ENV === 'development' && generatedOTP && (
            <p className="text-xs text-gray-500 mt-2 text-center">Development OTP: {generatedOTP}</p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 text-sm">{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            'Verify'
          )}
        </button>

        <button
          type="button"
          onClick={handleResendOTP}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending...</span>
            </div>
          ) : (
            'Resend OTP'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setCurrentStep('email')}
          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          Back to Email
        </button>
      </div>
    </motion.div>
  );

  const renderPasswordStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Create Password</h2>
        <p className="text-gray-400">Set a secure password for your account</p>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 text-sm">{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !password || !confirmPassword}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating Account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setCurrentStep('otp')}
          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          Back to OTP
        </button>
      </div>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-md mx-auto text-center"
    >
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Account Created!</h2>
        <p className="text-gray-400">Your account has been successfully created. Redirecting to dashboard...</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          {currentStep === 'email' && renderEmailStep()}
          {currentStep === 'otp' && renderOTPStep()}
          {currentStep === 'password' && renderPasswordStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
}

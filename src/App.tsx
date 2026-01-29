import { Header, Footer } from "./components/layout";
import { 
  HeroSection, 
  HowItWorksSection, 
  VideoTransformSection, 
  VideoCustomizationSection, 
  GallerySection, 
  PricingSection, 
  TestimonialsSection 
} from "./components/sections";
import { 
  LoginPage, 
  SignupPage, 
  DashboardPage, 
  ProjectsPage, 
  ProfilePage, 
  SettingsPage, 
  SubscriptionPage, 
  ProjectDetailPage, 
  ReferralPage 
} from "./components/pages";
import { ReferralPopup } from "./components/modals";
import { useState, useEffect } from "react";

type ViewType = "home" | "login" | "signup" | "dashboard" | "projects" | "profile" | "settings" | "subscription" | "project-detail" | "referral";

interface Project {
  id: string;
  title: string;
  videoUrl?: string;
  description?: string;
  location?: string;
  rating?: number;
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showReferralPopup, setShowReferralPopup] = useState(false);
  const [loginCount, setLoginCount] = useState(0);

  // Handle registration success - show popup on first registration
  const handleRegisterSuccess = () => {
    setCurrentView("dashboard");
    setShowReferralPopup(true);
  };

  // Handle login success - show popup every second login
  const handleLoginSuccess = () => {
    const newCount = loginCount + 1;
    setLoginCount(newCount);
    setCurrentView("dashboard");
    
    // Show popup every second login
    if (newCount % 2 === 0) {
      setShowReferralPopup(true);
    }
  };

  useEffect(() => {
    // Simulate a referral link being clicked
    const referralLink = new URLSearchParams(window.location.search).get("referral");
    if (referralLink) {
      setShowReferralPopup(true);
    }
  }, []);

  // Profile Page
  if (currentView === "profile") {
    return (
      <ProfilePage 
        onBack={() => setCurrentView("dashboard")}
        onLogout={() => setCurrentView("home")} 
        onNavigateToCreate={() => setCurrentView("dashboard")}
        onNavigateToProjects={() => setCurrentView("projects")}
        onNavigateToSettings={() => setCurrentView("settings")}
        onNavigateToPlans={() => setCurrentView("subscription")}
        onNavigateToReferral={() => setCurrentView("referral")}
      />
    );
  }

  // Settings Page
  if (currentView === "settings") {
    return (
      <SettingsPage 
        onBack={() => setCurrentView("dashboard")}
        onLogout={() => setCurrentView("home")} 
        onNavigateToCreate={() => setCurrentView("dashboard")}
        onNavigateToProjects={() => setCurrentView("projects")}
        onNavigateToProfile={() => setCurrentView("profile")}
        onNavigateToPlans={() => setCurrentView("subscription")}
        onNavigateToReferral={() => setCurrentView("referral")}
      />
    );
  }

  // Projects Page
  if (currentView === "projects") {
    return (
      <ProjectsPage 
        onLogout={() => setCurrentView("home")} 
        onNavigateToCreate={() => setCurrentView("dashboard")}
        onNavigateToProfile={() => setCurrentView("profile")}
        onNavigateToSettings={() => setCurrentView("settings")}
        onNavigateToPlans={() => setCurrentView("subscription")}
        onNavigateToReferral={() => setCurrentView("referral")}
        onProjectSelect={(project) => {
          setSelectedProject(project);
          setCurrentView("project-detail");
        }}
      />
    );
  }

  // Dashboard Page
  if (currentView === "dashboard") {
    return (
      <DashboardPage 
        onLogout={() => setCurrentView("home")} 
        onNavigateToProjects={() => setCurrentView("projects")}
        onNavigateToProfile={() => setCurrentView("profile")}
        onNavigateToSettings={() => setCurrentView("settings")}
        onNavigateToPlans={() => setCurrentView("subscription")}
        onNavigateToReferral={() => setCurrentView("referral")}
      />
    );
  }

  // Login Page
  if (currentView === "login") {
    return (
      <LoginPage
        onBack={() => setCurrentView("home")}
        onSwitchToRegister={() => setCurrentView("signup")}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Signup Page
  if (currentView === "signup") {
    return (
      <SignupPage
        onBack={() => setCurrentView("home")}
        onSwitchToLogin={() => setCurrentView("login")}
        onSignupSuccess={handleRegisterSuccess}
      />
    );
  }

  // Subscription Page
  if (currentView === "subscription") {
    return (
      <SubscriptionPage
        onClose={() => setCurrentView("dashboard")}
        onLogout={() => setCurrentView("home")}
        onNavigateToCreate={() => setCurrentView("dashboard")}
        onNavigateToProjects={() => setCurrentView("projects")}
        onNavigateToProfile={() => setCurrentView("profile")}
        onNavigateToSettings={() => setCurrentView("settings")}
        onNavigateToReferral={() => setCurrentView("referral")}
      />
    );
  }

  // Project Detail Page
  if (currentView === "project-detail" && selectedProject) {
    return (
      <ProjectDetailPage
        project={selectedProject}
        onBack={() => setCurrentView("projects")}
        onDelete={() => {
          setCurrentView("projects");
          setSelectedProject(null);
        }}
      />
    );
  }

  // Referral Page
  if (currentView === "referral") {
    return (
      <ReferralPage
        onNavigateToCreate={() => setCurrentView("dashboard")}
        onLogout={() => setCurrentView("home")}
        onNavigateToProjects={() => setCurrentView("projects")}
        onNavigateToProfile={() => setCurrentView("profile")}
        onNavigateToSettings={() => setCurrentView("settings")}
        onNavigateToPlans={() => setCurrentView("subscription")}
      />
    );
  }

  // Home Page
  return (
    <div className="min-h-screen bg-[#1a1410] text-white">
      <div 
        className="min-h-screen relative"
      >
        {/* Background Video */}
        <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
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

        {/* Content */}
        <div className="relative z-10">
          <Header onNavigateToLogin={() => setCurrentView("login")} />
          <HeroSection />
          <HowItWorksSection />
          <VideoTransformSection />
          <VideoCustomizationSection />
          <GallerySection />
          <PricingSection />
          <TestimonialsSection />
          <Footer />
        </div>
      </div>
      <ReferralPopup
        isOpen={showReferralPopup}
        onClose={() => setShowReferralPopup(false)}
        onViewReferralPage={() => {
          setShowReferralPopup(false);
          setCurrentView("referral");
        }}
      />
    </div>
  );
}
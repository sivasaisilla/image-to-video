/**
 * AppLayout - Layout wrapper for authenticated app pages
 *
 * Redirects to login if user is not authenticated.
 * Provides navigation context to child pages.
 */

import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authService } from "../../services/firebase";
import { ReferralPopup } from "../modals";

export function AppLayout() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showReferralPopup, setShowReferralPopup] = useState(false);

  useEffect(() => {
    // Check authentication state
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        setIsChecking(false);
      } else {
        // User is not logged in, redirect to login
        navigate("/login", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Navigation handlers to pass to pages
  const handleLogout = async () => {
    await authService.signOut();
    navigate("/");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Show loading while checking auth
  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1a1410] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <>
      <Outlet
        context={{
          onLogout: handleLogout,
          onNavigateToCreate: () => handleNavigate("/dashboard"),
          onNavigateToProjects: () => handleNavigate("/projects"),
          onNavigateToProfile: () => handleNavigate("/profile"),
          onNavigateToSettings: () => handleNavigate("/settings"),
          onNavigateToPlans: () => handleNavigate("/plans"),
          onNavigateToReferral: () => handleNavigate("/referral"),
          showReferralPopup: () => setShowReferralPopup(true),
        }}
      />
      <ReferralPopup
        isOpen={showReferralPopup}
        onClose={() => setShowReferralPopup(false)}
        onViewReferralPage={() => {
          setShowReferralPopup(false);
          navigate("/referral");
        }}
      />
    </>
  );
}

// Hook to access layout context in child pages
import { useOutletContext } from "react-router-dom";

export interface AppLayoutContext {
  onLogout: () => void;
  onNavigateToCreate: () => void;
  onNavigateToProjects: () => void;
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onNavigateToPlans: () => void;
  onNavigateToReferral: () => void;
  showReferralPopup: () => void;
}

export function useAppLayout(): AppLayoutContext {
  return useOutletContext<AppLayoutContext>();
}

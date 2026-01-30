/**
 * AuthLayout - Layout wrapper for authentication pages (login, signup, etc.)
 *
 * Redirects to dashboard if user is already logged in.
 */

import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authService } from "../../services/firebase";

export function AuthLayout() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (user) {
        // User is logged in, redirect to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        setIsChecking(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Show nothing while checking auth state
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#1a1410] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return <Outlet />;
}

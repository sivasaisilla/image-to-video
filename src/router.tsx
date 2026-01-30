/**
 * React Router Configuration
 *
 * Defines all application routes with proper URL paths.
 */

import { createBrowserRouter, Navigate } from "react-router-dom";
import {
  LoginPage,
  SignupPage,
  DashboardPage,
  ProjectsPage,
  ProfilePage,
  SettingsPage,
  SubscriptionPage,
  ProjectDetailPage,
  ReferralPage,
  ForgotPasswordPage
} from "./components/pages";
import { LandingPage } from "./components/pages/LandingPage";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthLayout } from "./components/layout/AuthLayout";

export const router = createBrowserRouter([
  // Public routes (landing page)
  {
    path: "/",
    element: <LandingPage />,
  },

  // Auth routes (login, signup, etc.)
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignupPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
    ],
  },

  // Protected app routes (requires authentication)
  {
    element: <AppLayout />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/projects",
        element: <ProjectsPage />,
      },
      {
        path: "/projects/:projectId",
        element: <ProjectDetailPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/plans",
        element: <SubscriptionPage />,
      },
      {
        path: "/referral",
        element: <ReferralPage />,
      },
    ],
  },

  // Catch-all redirect to home
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

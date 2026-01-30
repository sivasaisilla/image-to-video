/**
 * LandingPage - Public landing page with hero and features
 */

import { Header, Footer } from "../layout";
import {
  HeroSection,
  HowItWorksSection,
  VideoTransformSection,
  VideoCustomizationSection,
  GallerySection,
  PricingSection,
  TestimonialsSection
} from "../sections";
import { ReferralPopup } from "../modals";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function LandingPage() {
  const navigate = useNavigate();
  const [showReferralPopup, setShowReferralPopup] = useState(false);

  useEffect(() => {
    // Check for referral link in URL
    const referralLink = new URLSearchParams(window.location.search).get("referral");
    if (referralLink) {
      setShowReferralPopup(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1410] text-white">
      <div className="min-h-screen relative">
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
          <Header onNavigateToLogin={() => navigate("/login")} />
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
          navigate("/referral");
        }}
      />
    </div>
  );
}

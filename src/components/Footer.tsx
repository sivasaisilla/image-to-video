import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import svgPaths from "../imports/svg-nqiqmt8jqs";

export function Footer() {
  return (
    <footer className="px-6 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8 lg:p-12 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
            {/* Brand Section - Takes more space */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-12 h-12" viewBox="0 0 86 97" fill="none" preserveAspectRatio="none">
                  <g clipPath="url(#clip0_footer)">
                    <g>
                      <path d={svgPaths.p1fc0d980} fill="white" />
                      <path d={svgPaths.p3fa59880} fill="white" />
                      <path d={svgPaths.p24ace280} fill="white" />
                    </g>
                    <g>
                      <path d={svgPaths.p11a6300} fill="url(#paint0_linear_footer)" />
                      <path d={svgPaths.p3fa59880} fill="url(#paint1_linear_footer)" />
                    </g>
                    <path d={svgPaths.p31d8dc80} fill="white" />
                    <path d={svgPaths.p9680300} fill="white" />
                  </g>
                  <defs>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_footer" x1="43" x2="43" y1="30" y2="144">
                      <stop stopColor="#FF8300" />
                      <stop offset="1" stopColor="white" />
                    </linearGradient>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_footer" x1="43" x2="43" y1="30" y2="144">
                      <stop stopColor="#FF8300" />
                      <stop offset="1" stopColor="white" />
                    </linearGradient>
                    <clipPath id="clip0_footer">
                      <rect fill="white" height="97" width="86" />
                    </clipPath>
                  </defs>
                </svg>
                <div className="flex flex-col leading-tight">
                  <span className="tracking-wider text-xl">IMOB</span>
                  <span className="tracking-wider text-xl">MOTION</span>
                </div>
              </div>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                Transform your real estate listings with AI-powered videos.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-12 h-12 backdrop-blur-md bg-white/5 border border-white/20 rounded-md hover:bg-amber-400/20 hover:border-amber-400/50 transition-all flex items-center justify-center group"
                >
                  <Facebook className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 backdrop-blur-md bg-white/5 border border-white/20 rounded-md hover:bg-amber-400/20 hover:border-amber-400/50 transition-all flex items-center justify-center group"
                >
                  <Instagram className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 backdrop-blur-md bg-white/5 border border-white/20 rounded-md hover:bg-amber-400/20 hover:border-amber-400/50 transition-all flex items-center justify-center group"
                >
                  <Youtube className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 backdrop-blur-md bg-white/5 border border-white/20 rounded-md hover:bg-amber-400/20 hover:border-amber-400/50 transition-all flex items-center justify-center group"
                >
                  <Linkedin className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
                </a>
              </div>
            </div>

            {/* Links Grid - Takes remaining space */}
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Product */}
              <div>
                <h4 className="mb-6 text-amber-400">Product</h4>
                <div className="space-y-4">
                  <a
                    href="#"
                    className="block text-white/60 hover:text-white hover:translate-x-1 transition-all"
                  >
                    Features
                  </a>
                  <a
                    href="#"
                    className="block text-white/60 hover:text-white hover:translate-x-1 transition-all"
                  >
                    Pricing
                  </a>
                  <a
                    href="#"
                    className="block text-white/60 hover:text-white hover:translate-x-1 transition-all"
                  >
                    Gallery
                  </a>
                </div>
              </div>

              {/* Company */}
              <div>
                <h4 className="mb-6 text-amber-400">Company</h4>
                <div className="space-y-4">
                  <a
                    href="#"
                    className="block text-white/60 hover:text-white hover:translate-x-1 transition-all"
                  >
                    About Us
                  </a>
                  <a
                    href="#"
                    className="block text-white/60 hover:text-white hover:translate-x-1 transition-all"
                  >
                    Contact
                  </a>
                  <a
                    href="#"
                    className="block text-white/60 hover:text-white hover:translate-x-1 transition-all"
                  >
                    Careers
                  </a>
                </div>
              </div>

              {/* Legal */}
              <div>
                <h4 className="mb-6 text-amber-400">Legal</h4>
                <div className="space-y-4">
                  <a
                    href="#"
                    className="block text-white/60 hover:text-white hover:translate-x-1 transition-all"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="block text-white/60 hover:text-white hover:translate-x-1 transition-all"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="#"
                    className="block text-white/60 hover:text-white hover:translate-x-1 transition-all"
                  >
                    Cookie Policy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright - Separate smaller container */}
        <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md px-8 py-5 text-center text-white/60">
          © 2025 ImobMotion. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
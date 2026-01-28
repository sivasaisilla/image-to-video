import { Globe, ChevronDown } from "lucide-react";
import { useState } from "react";
import svgPaths from "../imports/svg-nqiqmt8jqs";

interface HeaderProps {
  onNavigateToLogin: () => void;
}

export function Header({ onNavigateToLogin }: HeaderProps) {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = [
    { code: "en", name: "English" },
    { code: "sv", name: "Swedish" },
    { code: "de", name: "German" },
    { code: "da", name: "Danish" },
    { code: "fr", name: "French" },
    { code: "it", name: "Italian" },
    { code: "es", name: "Spanish" },
  ];

  const navItems = [
    { name: "Home", href: "#" },
    { name: "Features", href: "#features" },
    { name: "Gallery", href: "#gallery" },
    { name: "Prices", href: "#prices" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full px-6 py-5 lg:px-12 backdrop-blur-md bg-white/5 border-b border-white/10 z-50">
      <div className="w-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="w-10 h-10" viewBox="0 0 86 97" fill="none" preserveAspectRatio="none">
              <g clipPath="url(#clip0_header)">
                <g>
                  <path d={svgPaths.p1fc0d980} fill="white" />
                  <path d={svgPaths.p3fa59880} fill="white" />
                  <path d={svgPaths.p24ace280} fill="white" />
                </g>
                <g>
                  <path d={svgPaths.p11a6300} fill="url(#paint0_linear_header)" />
                  <path d={svgPaths.p3fa59880} fill="url(#paint1_linear_header)" />
                </g>
                <path d={svgPaths.p31d8dc80} fill="white" />
                <path d={svgPaths.p9680300} fill="white" />
              </g>
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_header" x1="43" x2="43" y1="30" y2="144">
                  <stop stopColor="#FF8300" />
                  <stop offset="1" stopColor="white" />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_header" x1="43" x2="43" y1="30" y2="144">
                  <stop stopColor="#FF8300" />
                  <stop offset="1" stopColor="white" />
                </linearGradient>
                <clipPath id="clip0_header">
                  <rect fill="white" height="97" width="86" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="tracking-wider text-sm">IMOB</span>
            <span className="tracking-wider text-sm">MOTION</span>
          </div>
        </div>

        {/* Navigation - Center */}
        <nav className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-white/80 hover:text-white transition-colors text-[15px]"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Sign In Button */}
          <button
            onClick={onNavigateToLogin}
            className="px-8 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-md hover:bg-white/20 transition-colors"
          >
            Sign In
          </button>

          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              onBlur={() => setTimeout(() => setIsLangDropdownOpen(false), 200)}
              className="flex items-center gap-2 px-6 py-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-md hover:bg-white/20 transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span>{selectedLanguage}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isLangDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-[200px] backdrop-blur-md bg-[#1a1410]/95 border border-white/20 rounded-md shadow-2xl overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.name);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`block w-full px-6 py-3 text-left transition-colors ${
                      selectedLanguage === lang.name
                        ? 'bg-amber-400/20 text-amber-300 border-l-2 border-amber-400'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
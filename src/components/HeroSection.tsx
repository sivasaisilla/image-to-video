import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Play, Sparkles, Zap, Star } from "lucide-react";

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-300px)] flex items-center justify-center px-6 py-24 lg:py-32 overflow-hidden">
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: mousePosition.x * 0.5,
            y: mousePosition.y * 0.5,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-amber-600/20 via-orange-600/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: -mousePosition.x * 0.3,
            y: -mousePosition.y * 0.3,
          }}
          transition={{ type: "spring", stiffness: 30, damping: 20 }}
          className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-tl from-yellow-600/20 via-amber-600/10 to-transparent rounded-full blur-3xl"
        />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-md bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-full">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-white/80 text-sm">AI-Powered Video Creation</span>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-400/20 rounded-full">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400 text-xs">New</span>
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="text-center">
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-6 tracking-tight leading-[1.1]"
          >
            Transform Your Listings
            <br />
            <span className="relative inline-block mt-2">
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-amber-300 via-amber-100 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                  Instantly!
                </span>
              </span>
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-white/70 text-lg lg:text-xl mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Upload Photos. Get Stunning Videos in Minutes.
            <br />
            <span className="text-amber-400/80">Drive More Sales!</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 20px 60px rgba(251, 191, 36, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-md transition-all shadow-2xl overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Start Creating Now
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-amber-300 to-orange-300"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>

          {/* Trusted By - Infinite Scrolling Brands */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16"
          >
            <p className="text-white/50 text-sm uppercase tracking-wider text-center mb-8">
              Trusted by leading real estate professionals
            </p>
            
            {/* Infinite Scroll Container */}
            <div className="relative overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              {/* Scrolling Brands */}
              <motion.div
                className="flex gap-16 items-center"
                animate={{
                  x: [0, -50 * 10 - 16 * 10],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 30,
                    ease: "linear",
                  },
                }}
              >
                {[
                  "ZILLOW",
                  "REDFIN",
                  "REALTOR.COM",
                  "COMPASS",
                  "SOTHEBY'S",
                  "COLDWELL BANKER",
                  "KELLER WILLIAMS",
                  "RE/MAX",
                  "CENTURY 21",
                  "BERKSHIRE HATHAWAY",
                  "ZILLOW",
                  "REDFIN",
                  "REALTOR.COM",
                  "COMPASS",
                  "SOTHEBY'S",
                  "COLDWELL BANKER",
                  "KELLER WILLIAMS",
                  "RE/MAX",
                  "CENTURY 21",
                  "BERKSHIRE HATHAWAY",
                ].map((brand, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 px-8 py-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <span className="text-white/60 hover:text-white/90 transition-colors text-lg tracking-wider whitespace-nowrap">
                      {brand}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
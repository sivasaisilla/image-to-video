import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Sparkles, Zap } from "lucide-react";

export function VideoTransformSection() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  return (
    <section className="px-6 py-24 lg:py-32 pt-[128px] pr-[24px] pb-[0px] pl-[24px]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-md bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm">AI Technology</span>
            </div>

            <h2 className="text-4xl lg:text-5xl xl:text-6xl mb-8 leading-tight">
              Turn photos into
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-100 to-amber-300 bg-clip-text text-transparent">
                stunning videos
              </span>
            </h2>

            <p className="text-white/70 mb-12 text-lg leading-relaxed">
              With our new photo-to-video transformation technology, you can easily convert still photos into an immersive video tour of your property. Build your brand with video in seconds!
            </p>

            {/* Features List */}
            <div className="space-y-6 mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-md backdrop-blur-md bg-gradient-to-br from-green-400/20 to-emerald-400/20 border border-green-400/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white text-lg">Dynamic walkthrough video</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-md backdrop-blur-md bg-gradient-to-br from-green-400/20 to-emerald-400/20 border border-green-400/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white text-lg">AI-driven customization</span>
              </motion.div>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 20px 60px rgba(251, 191, 36, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="px-12 py-4 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-md transition-all shadow-2xl"
            >
              Get Started Free
            </motion.button>
          </motion.div>

          {/* Right - Video Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8 shadow-2xl">
              {/* Main Split View Container */}
              <div
                ref={containerRef}
                className="relative rounded-md overflow-hidden aspect-[4/3] select-none cursor-ew-resize"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                onTouchMove={handleTouchMove}
              >
                {/* Before Image - Bottom Layer (Full) */}
                <div className="absolute inset-0">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1579484955353-1b23545748f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMHBob3RvcyUyMGdyaWR8ZW58MXx8fHwxNzY0NTk3OTI3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Photos before transformation"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* After Image - Top Layer (Clipped) */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1763479142678-8e29f4edb538?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwcm9wZXJ0eSUyMGludGVyaW9yJTIwcG9vbHxlbnwxfHx8fDE3NjQ1OTc5MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Property after transformation"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Before Label - Left Side */}
                <div className="absolute top-6 left-6 pointer-events-none z-10">
                  <span className="px-4 py-2 backdrop-blur-md bg-black/70 border border-white/20 rounded-md">
                    Before
                  </span>
                </div>

                {/* After Label - Right Side */}
                <div className="absolute top-6 right-6 pointer-events-none z-10">
                  <span className="px-4 py-2 backdrop-blur-md bg-gradient-to-r from-amber-400/90 to-orange-400/90 text-black border border-amber-400 rounded-md">
                    After
                  </span>
                </div>

                {/* Vertical Slider Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none z-20"
                  style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                >
                  {/* Slider Handle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full backdrop-blur-md bg-white/90 border-4 border-white shadow-2xl flex items-center justify-center pointer-events-auto cursor-ew-resize">
                    <div className="flex gap-1">
                      <div className="w-0.5 h-5 bg-black/60 rounded-full"></div>
                      <div className="w-0.5 h-5 bg-black/60 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
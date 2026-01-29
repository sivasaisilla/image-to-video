import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "motion/react";
import { Upload, Wand2, Download, ArrowRight } from "lucide-react";

export function HowItWorksSection() {
  return (
    <section id="features" className="relative py-32 px-6 lg:px-12 pt-[0px] pr-[48px] pb-[128px] pl-[48px]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl xl:text-6xl mb-4">How It Works</h2>
          <p className="text-white/70 text-lg lg:text-xl max-w-3xl mx-auto">
            Transform your photos into stunning videos in three easy steps
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Step 1: Upload */}
          <motion.div
            key="01"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-center group"
          >
            {/* Step Number Circle */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full backdrop-blur-md bg-white/5 border border-white/20 flex items-center justify-center group-hover:border-amber-400/50 transition-all duration-500">
                  <span className="text-4xl">01</span>
                </div>
                {/* Animated gradient ring */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl mb-4">Upload Your Photos</h3>

            {/* Description */}
            <p className="text-white/60 mb-8 leading-relaxed">
              Simply upload your photos from your device or just paste the link to get started.
            </p>

            {/* Content Card */}
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-[22px] shadow-2xl hover:bg-white/10 transition-all duration-500">
              {/* Step 1: Upload Grid */}
              <div className="aspect-[4/3] flex flex-col justify-between">
                <button className="w-full py-2.5 bg-gradient-to-r from-white/95 to-white/90 text-black rounded-md hover:from-white hover:to-white transition-all flex items-center justify-center gap-3 shadow-lg group">
                  <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">Upload Photos</span>
                </button>

                <div className="grid grid-cols-3 gap-2 flex-1 my-2">
                  <motion.div
                    key="1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + 0.1 }}
                    className="rounded-md overflow-hidden h-full"
                  >
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2NDU1NTA2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Photo 1"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </motion.div>
                  <motion.div
                    key="2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + 0.2 }}
                    className="rounded-md overflow-hidden h-full"
                  >
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1638885930125-85350348d266?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc2NDUwMjk3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Photo 2"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </motion.div>
                  <motion.div
                    key="3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + 0.3 }}
                    className="rounded-md overflow-hidden h-full"
                  >
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1610177534644-34d881503b83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY0NTQ4ODMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Photo 3"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </motion.div>
                </div>

                <button className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-md hover:shadow-2xl hover:shadow-amber-400/30 transition-all shadow-lg">
                  <span className="text-sm">Generate Video</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Step 2: AI Transform */}
          <motion.div
            key="02"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center group"
          >
            {/* Step Number Circle */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full backdrop-blur-md bg-white/5 border border-white/20 flex items-center justify-center group-hover:border-amber-400/50 transition-all duration-500">
                  <span className="text-4xl">02</span>
                </div>
                {/* Animated gradient ring */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl mb-4">AI Transforms Into Video</h3>

            {/* Description */}
            <p className="text-white/60 mb-8 leading-relaxed">
              Your photos are instantly transformed into immersive property tours with trending music.
            </p>

            {/* Content Card */}
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-[22px] shadow-2xl hover:bg-white/10 transition-all duration-500">
              {/* Step 2: Single Preview */}
              <div className="aspect-[4/3] rounded-md overflow-hidden relative group/preview">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1611094016919-36b65678f3d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwcm9wZXJ0eSUyMGludGVyaW9yfGVufDF8fHx8MTc2NDQ5OTQ5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Video preview"
                  className="w-full h-full object-cover"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300"
                  >
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-black border-b-8 border-b-transparent ml-1" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 3: Export Formats */}
          <motion.div
            key="03"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center group"
          >
            {/* Step Number Circle */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full backdrop-blur-md bg-white/5 border border-white/20 flex items-center justify-center group-hover:border-amber-400/50 transition-all duration-500">
                  <span className="text-4xl">03</span>
                </div>
                {/* Animated gradient ring */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl mb-4">Export in All Formats</h3>

            {/* Description */}
            <p className="text-white/60 mb-8 leading-relaxed">
              Get your video optimized for MLS listings, websites, and social media reels.
            </p>

            {/* Content Card */}
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-[22px] shadow-2xl hover:bg-white/10 transition-all duration-500">
              {/* Step 3: Format Grid */}
              <div className="grid grid-cols-2 gap-3 aspect-[4/3]">
                <motion.div
                  key="Branded"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 + 0.1 }}
                  className="rounded-md overflow-hidden relative group/format h-full"
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1639663742190-1b3dba2eebcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc2NDUwMzM2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Branded"
                    className="w-full h-full object-cover group-hover/format:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 px-3 py-1 backdrop-blur-md bg-white/20 border border-white/30 rounded-md text-xs">
                    Branded
                  </div>
                </motion.div>
                <motion.div
                  key="Reel"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 + 0.2 }}
                  className="row-span-2 rounded-md overflow-hidden relative group/format h-full"
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1560448204-444f743ef6e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb29mdG9wJTIwdGVycmFjZSUyMHZpZXd8ZW58MXx8fHwxNzY0NTc0ODY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Reel"
                    className="w-full h-full object-cover group-hover/format:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 px-3 py-1 backdrop-blur-md bg-white/20 border border-white/30 rounded-md text-xs">
                    Reel
                  </div>
                </motion.div>
                <motion.div
                  key="MLS"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 + 0.3 }}
                  className="rounded-md overflow-hidden relative group/format h-full"
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1639663742190-1b3dba2eebcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc2NDUwMzM2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="MLS"
                    className="w-full h-full object-cover group-hover/format:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 px-3 py-1 backdrop-blur-md bg-white/20 border border-white/30 rounded-md text-xs">
                    MLS
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
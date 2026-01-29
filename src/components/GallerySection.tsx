import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";
import { motion } from "motion/react";
import { Volume2, VolumeX, Film, Pause } from "lucide-react";

export function GallerySection() {
  const [isMuted, setIsMuted] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);

  const videos = [
    {
      title: "Modern Living Room",
      thumbnail: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80",
      views: "1.2M",
      duration: "2:45"
    },
    {
      title: "Luxury Kitchen",
      thumbnail: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80",
      views: "850K",
      duration: "1:30"
    },
    {
      title: "Master Bedroom",
      thumbnail: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
      views: "920K",
      duration: "2:15"
    },
    {
      title: "Modern Bathroom",
      thumbnail: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
      views: "650K",
      duration: "1:20"
    },
    {
      title: "Home Office",
      thumbnail: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
      views: "710K",
      duration: "1:50"
    }
  ];

  return (
    <section id="gallery" className="relative py-32 px-6 lg:px-12 pt-[0px] pr-[48px] pb-[128px] pl-[48px]">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-md bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-full mb-6">
            <Film className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm">Video Showcase</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl xl:text-6xl mb-6">
            <span className="bg-gradient-to-r from-amber-300 via-amber-100 to-amber-300 bg-clip-text text-transparent">
              Gallery
            </span>
          </h2>
          <p className="text-white/70 text-lg lg:text-xl max-w-2xl mx-auto">
            Explore stunning AI-generated real estate videos showcasing properties in their best light
          </p>
        </motion.div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Large Featured Video - Spans 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="md:col-span-2 lg:row-span-2"
            onMouseEnter={() => setHoveredVideo(0)}
            onMouseLeave={() => setHoveredVideo(null)}
          >
            <div className={`relative h-full backdrop-blur-md bg-white/5 border rounded-md overflow-hidden group cursor-pointer transition-all ${
              playingVideo === 0 
                ? "border-amber-400 ring-2 ring-amber-400/50" 
                : "border-white/20 hover:border-amber-400/50"
            }`}>
              <div className="aspect-[16/9] lg:aspect-auto lg:h-full">
                <ImageWithFallback
                  src={videos[0].thumbnail}
                  alt={videos[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              
              {/* Play/Pause Button */}
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={hoveredVideo === 0 || playingVideo === 0 ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
                onClick={() => setPlayingVideo(playingVideo === 0 ? null : 0)}
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                  {playingVideo === 0 ? (
                    <Pause className="w-8 h-8 text-black" />
                  ) : (
                    <div className="w-0 h-0 border-l-[16px] border-l-black border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1" />
                  )}
                </div>
              </motion.button>
              
              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 backdrop-blur-md bg-amber-400/20 border border-amber-400/30 rounded-full">
                        <span className="text-xs text-amber-300">Featured</span>
                      </div>
                      {playingVideo === 0 && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 backdrop-blur-md bg-green-400/20 border border-green-400/30 rounded-full animate-pulse">
                          <span className="text-xs text-green-300">Playing</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl lg:text-3xl mb-2">{videos[0].title}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>{videos[0].views} views</span>
                      <span>•</span>
                      <span>{videos[0].duration}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="w-12 h-12 rounded-md backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Regular Video Cards */}
          {videos.slice(1).map((video, index) => (
            <motion.div
              key={index + 1}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 + (index + 1) * 0.1 }}
              onMouseEnter={() => setHoveredVideo(index + 1)}
              onMouseLeave={() => setHoveredVideo(null)}
              className={index === 1 ? "lg:row-span-2" : ""}
            >
              <div className={`relative h-full backdrop-blur-md bg-white/5 border rounded-md overflow-hidden group cursor-pointer transition-all ${
                playingVideo === index + 1 
                  ? "border-amber-400 ring-2 ring-amber-400/50" 
                  : "border-white/20 hover:border-amber-400/50"
              }`}>
                <div className={`${index === 1 ? "aspect-[16/9] lg:aspect-auto lg:h-full" : "aspect-[16/9]"}`}>
                  <ImageWithFallback
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {/* Play/Pause Button */}
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={hoveredVideo === index + 1 || playingVideo === index + 1 ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
                  onClick={() => setPlayingVideo(playingVideo === index + 1 ? null : index + 1)}
                  className="absolute inset-0 flex items-center justify-center z-10"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                    {playingVideo === index + 1 ? (
                      <Pause className="w-6 h-6 text-black" />
                    ) : (
                      <div className="w-0 h-0 border-l-[14px] border-l-black border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent ml-1" />
                    )}
                  </div>
                </motion.button>
                
                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg group-hover:text-amber-300 transition-colors">{video.title}</h3>
                    {playingVideo === index + 1 && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 backdrop-blur-md bg-green-400/20 border border-green-400/30 rounded-full animate-pulse">
                        <span className="text-xs text-green-300">Playing</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span>{video.views} views</span>
                    <span>•</span>
                    <span>{video.duration}</span>
                  </div>
                </div>
                
                {/* Duration Badge */}
                <div className="absolute top-4 right-4 px-2 py-1 backdrop-blur-md bg-black/70 rounded text-xs">
                  {video.duration}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
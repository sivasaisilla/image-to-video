import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Download, Share2, AlertCircle } from "lucide-react";

interface VideoPlaybackModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle?: string;
  expiresAt?: number;
}

export function VideoPlaybackModal({
  isOpen,
  onClose,
  videoUrl,
  videoTitle = "Generated Video",
  expiresAt,
}: VideoPlaybackModalProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  // Calculate time remaining for URL expiry
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = expiresAt - now;

      if (remaining <= 0) {
        setIsExpired(true);
        setTimeRemaining("Expired");
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleDownload = () => {
    if (isExpired) {
      alert("Video URL has expired. Please generate a new video.");
      return;
    }

    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `${videoTitle}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (isExpired) {
      alert("Video URL has expired. Please generate a new video.");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: videoTitle,
          text: "Check out this amazing property video!",
          url: videoUrl,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(videoUrl);
      alert("Video URL copied to clipboard!");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-3xl mx-4"
          >
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h3 className="text-2xl font-semibold text-white">{videoTitle}</h3>
                  {expiresAt && (
                    <p
                      className={`text-sm mt-1 flex items-center gap-2 ${
                        isExpired ? "text-red-400" : "text-amber-400"
                      }`}
                    >
                      {isExpired && <AlertCircle className="w-4 h-4" />}
                      {isExpired
                        ? "URL Expired - Generate a new video to continue"
                        : `URL expires in: ${timeRemaining}`}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Video Player */}
              <div className="bg-black aspect-video flex items-center justify-center relative overflow-hidden">
                {isExpired ? (
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h4 className="text-xl text-white mb-2">Video URL Expired</h4>
                    <p className="text-white/60 text-sm max-w-md">
                      The signed URL for this video has expired for security reasons. Please generate
                      a new video to continue.
                    </p>
                  </div>
                ) : (
                  <video
                    key={videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                    onError={() => (
                      <div className="flex items-center justify-center w-full h-full bg-red-500/20">
                        <p className="text-red-400">Error loading video</p>
                      </div>
                    )}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 border-t border-white/10 bg-white/5">
                <button
                  onClick={handleDownload}
                  disabled={isExpired}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isExpired
                      ? "bg-white/5 text-white/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-400 to-orange-400 text-black hover:shadow-lg hover:shadow-amber-500/50"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleShare}
                  disabled={isExpired}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isExpired
                      ? "bg-white/5 text-white/50 cursor-not-allowed"
                      : "border border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-lg font-medium border border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  Close
                </button>
              </div>

              {/* Info */}
              <div className="px-6 py-4 bg-white/5 border-t border-white/10">
                <p className="text-xs text-white/60">
                  ℹ️ Video URLs are temporary for security reasons. Download your video to keep it permanently.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

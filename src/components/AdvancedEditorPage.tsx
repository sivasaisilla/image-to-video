import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Play, Pause, Music, Loader2, CheckCircle2, X } from "lucide-react";

interface AdvancedEditorPageProps {
  onClose: () => void;
  project: {
    title: string;
    location?: string;
  };
}

interface Shot {
  id: string;
  url: string;
  transition: string;
  startTime: number;
  duration: number;
}

interface MusicTrack {
  id: string;
  name: string;
  mood: string;
  thumbnail: string;
  category: string;
}

export function AdvancedEditorPage({ onClose, project }: AdvancedEditorPageProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [selectedMusic, setSelectedMusic] = useState<string>('1');
  const [musicFilter, setMusicFilter] = useState<string>('All');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderComplete, setRenderComplete] = useState<boolean>(false);
  const [shots, setShots] = useState<Shot[]>([
    { id: '1', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop', transition: 'Push In', startTime: 0, duration: 7 },
    { id: '2', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop', transition: 'Push In', startTime: 7, duration: 7 },
    { id: '3', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop', transition: 'Push In', startTime: 14, duration: 7 },
  ]);
  const totalDuration = 21; // Total video duration in seconds

  const musicTracks: MusicTrack[] = [
    { id: '1', name: "Don't hurt me", mood: 'Chill', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', category: 'All' },
    { id: '2', name: "Don't let me go", mood: 'Elegant, Gently', thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop', category: 'Beautiful ambient' },
    { id: '3', name: "For all eternity", mood: 'Beautiful Ambient', thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop', category: 'Beautiful ambient' },
    { id: '4', name: "Deep feelings", mood: 'Soulful, Ambient', thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', category: 'All' },
    { id: '5', name: "Pearly whites", mood: 'Upbeat', thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop', category: 'All' },
  ];

  const filteredMusic = musicFilter === 'All' 
    ? musicTracks 
    : musicTracks.filter(track => track.category === musicFilter);

  // Get current shot based on time
  const getCurrentShot = () => {
    return shots.find(shot => 
      currentTime >= shot.startTime && currentTime < shot.startTime + shot.duration
    ) || shots[0];
  };

  // Handle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Animation loop for playback
  useEffect(() => {
    let animationId: number;
    
    if (isPlaying) {
      const animate = () => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.016; // ~60fps
        });
        animationId = requestAnimationFrame(animate);
      };
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying]);

  // Render progress animation
  useEffect(() => {
    if (!isRendering || renderComplete) return;

    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRenderComplete(true);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRendering, renderComplete]);

  const handleRenderVideo = () => {
    setIsRendering(true);
    setRenderProgress(0);
    setRenderComplete(false);
  };

  const closeRenderModal = () => {
    setIsRendering(false);
    setRenderProgress(0);
    setRenderComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    setCurrentTime(percentage * totalDuration);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newShots = [...shots];
    const draggedShot = newShots[draggedIndex];
    newShots.splice(draggedIndex, 1);
    newShots.splice(index, 0, draggedShot);

    // Update start times
    newShots.forEach((shot, idx) => {
      shot.startTime = idx * 7;
    });

    setShots(newShots);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const currentShot = getCurrentShot();

  // Generate time markers (every second)
  const timeMarkers = Array.from({ length: totalDuration + 1 }, (_, i) => i);

  return (
    <div className="fixed inset-0 bg-[#131519] z-50 flex flex-col">
      {/* Background Gradients */}
      <div className="fixed blur-3xl filter left-[-352px] rounded-[1.67772e+07px] size-[800px] top-[-400px] pointer-events-none" style={{ backgroundImage: "linear-gradient(135deg, rgba(225, 113, 0, 0.2) 0%, rgba(245, 73, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      <div className="fixed blur-3xl filter left-[1501px] rounded-[1.67772e+07px] size-[800px] top-[580px] pointer-events-none" style={{ backgroundImage: "linear-gradient(-45deg, rgba(208, 135, 0, 0.2) 0%, rgba(225, 113, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      
      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-8 py-4 backdrop-blur-md bg-white/5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Project</span>
          </button>
          <div className="w-px h-4 bg-white/20"></div>
          <h1 className="text-sm">Advanced Video Editor</h1>
        </div>

        <button onClick={handleRenderVideo} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm">
          <Play className="w-4 h-4 fill-black" />
          <span>Re-render Video</span>
        </button>
      </div>

      {/* Preview Info Banner */}
      <div className="relative z-10 bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-md px-8 py-3 flex items-center gap-2 flex-shrink-0 text-sm border-b border-amber-400/20">
        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
        <span className="text-white"><span>PREVIEW INFO:</span> Movement changes will not be visible in preview until you re-render the video.</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Column - Video Player & Timeline */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="relative w-full h-full flex flex-col">
              {/* Video Area */}
              <div className="flex-1 relative bg-black flex items-center justify-center">
                <img 
                  src={currentShot.url}
                  alt="Video preview"
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Timer - Top Left */}
                <div className="absolute top-0 left-0 text-white/80 text-sm backdrop-blur-md bg-black/50 px-3 py-1.5 rounded-lg border border-white/10">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </div>
              </div>

              {/* Controls - Bottom */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 fill-white" />
                  )}
                </button>

                {/* Timeline Scrubber */}
                <div 
                  className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer relative"
                  onClick={handleTimelineClick}
                >
                  <div 
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="backdrop-blur-md bg-white/5 border-t border-white/10 p-8 flex-shrink-0">
            {/* Video Track */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2 w-20">
                  <div className="w-4 h-4 bg-[#2a2a2a] rounded flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-white/60">Video</span>
                </div>
                
                {/* Timeline with Time Markers */}
                <div className="flex-1 relative">
                  {/* Time Markers */}
                  <div className="flex justify-between mb-1 text-[10px] text-white/50">
                    {timeMarkers.map((time) => (
                      <span key={time} className="w-0 text-center" style={{ marginLeft: time === 0 ? '0' : 'auto' }}>
                        {formatTime(time)}
                      </span>
                    ))}
                  </div>

                  {/* Shot Cards */}
                  <div className="relative h-16 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    {shots.map((shot, index) => (
                      <div
                        key={shot.id}
                        className={`absolute top-0 h-full bg-white/10 border-l border-r border-white/20 transition-all duration-200 cursor-move rounded-lg overflow-hidden ${
                          draggedIndex === index ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                        }`}
                        style={{
                          left: `${(shot.startTime / totalDuration) * 100}%`,
                          width: `${(shot.duration / totalDuration) * 100}%`
                        }}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="relative w-full h-full p-1.5 pointer-events-none">
                          <div className="w-full h-full rounded overflow-hidden">
                            <img 
                              src={shot.url}
                              alt={`Shot ${shot.id}`}
                              className="w-full h-full object-cover select-none"
                            />
                          </div>
                          <div className="absolute top-2 left-2 text-[10px] text-white bg-black/70 backdrop-blur-md px-2 py-1 rounded-md border border-white/20">
                            Shot {shot.id}
                          </div>
                          <div className="absolute bottom-2 left-2 text-[9px] text-white/80 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md border border-white/20">
                            {shot.transition}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Music Track */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-20">
                  <div className="w-4 h-4 bg-white/10 rounded flex items-center justify-center border border-white/10">
                    <Music className="w-2.5 h-2.5 text-white/60" />
                  </div>
                  <span className="text-xs text-white/60">Music</span>
                </div>
                
                <div className="flex-1 h-12 bg-gradient-to-r from-amber-500/40 to-orange-500/40 rounded-lg flex items-center justify-center border border-amber-400/20">
                  <span className="text-xs text-white/90">Birds eye view</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Background Music */}
        <div className="w-80 backdrop-blur-md bg-white/5 border-l border-white/10 flex flex-col flex-shrink-0">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-4 h-4" />
              <h2 className="text-sm">Background Music</h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setMusicFilter('All')}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap ${
                  musicFilter === 'All'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setMusicFilter('Beautiful ambient')}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap ${
                  musicFilter === 'Beautiful ambient'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }`}
              >
                Beautiful ambient
              </button>
              <button
                onClick={() => setMusicFilter('Cinematic')}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap ${
                  musicFilter === 'Cinematic'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }`}
              >
                Cinematic
              </button>
              <button
                onClick={() => setMusicFilter('Upbeat')}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap ${
                  musicFilter === 'Upbeat'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }`}
              >
                Upbeat
              </button>
              <button
                onClick={() => setMusicFilter('Chill')}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap ${
                  musicFilter === 'Chill'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }`}
              >
                Chill
              </button>
              <button
                onClick={() => setMusicFilter('Epic')}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap ${
                  musicFilter === 'Epic'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }`}
              >
                Epic
              </button>
              <button
                onClick={() => setMusicFilter('Romantic')}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap ${
                  musicFilter === 'Romantic'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }`}
              >
                Romantic
              </button>
            </div>
          </div>

          {/* Music List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {filteredMusic.map((track) => (
                <div
                  key={track.id}
                  onClick={() => setSelectedMusic(track.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg transition-all cursor-pointer border ${
                    selectedMusic === track.id
                      ? 'bg-white/10 border-amber-400/30 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                    <img 
                      src={track.thumbnail} 
                      alt={track.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs mb-0.5 truncate">{track.name}</h3>
                    <p className="text-[10px] text-white/50">{track.mood}</p>
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center flex-shrink-0 border border-white/10"
                  >
                    <Play className="w-3 h-3 fill-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Music */}
          <div className="p-6 border-t border-white/10">
            <div className="text-[10px] text-white/50 mb-2">Selected Music</div>
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop"
                  alt="Selected"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs truncate">Birds eye view</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render Video Modal */}
      {isRendering && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-xl p-8 max-w-md w-full mx-4">
            {!renderComplete ? (
              <>
                {/* Loading State */}
                <div className="flex flex-col items-center">
                  <Loader2 className="w-16 h-16 text-amber-400 animate-spin mb-6" />
                  <h3 className="text-xl mb-2">Rendering Your Video</h3>
                  <p className="text-sm text-white/60 mb-6 text-center">
                    Please wait while we process your video with the new changes...
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-3 mb-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-300"
                      style={{ width: `${renderProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-white/50">{renderProgress}%</p>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6 border border-green-500/30">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl mb-2">Video Rendered Successfully!</h3>
                  <p className="text-sm text-white/60 mb-6 text-center">
                    Your video has been rendered with all the changes.
                  </p>

                  {/* Close Button */}
                  <button
                    onClick={closeRenderModal}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
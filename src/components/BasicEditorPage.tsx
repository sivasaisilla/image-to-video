import { useState, useEffect } from "react";
import { Music, Play, Trash2, X, RotateCcw, Loader2, CheckCircle2 } from "lucide-react";

interface BasicEditorPageProps {
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
}

interface MusicTrack {
  id: string;
  name: string;
  mood: string;
  thumbnail: string;
  category: string;
}

export function BasicEditorPage({ onClose, project }: BasicEditorPageProps) {
  const [shots, setShots] = useState<Shot[]>([
    { id: '1', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop', transition: 'Push In' },
    { id: '2', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop', transition: 'Push In' },
    { id: '3', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop', transition: 'Push In' },
  ]);

  const [selectedMusic, setSelectedMusic] = useState<string>('1');
  const [musicFilter, setMusicFilter] = useState<string>('All');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderComplete, setRenderComplete] = useState<boolean>(false);
  
  const musicTracks: MusicTrack[] = [
    { id: '1', name: "Don't hurt me", mood: 'Chill', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', category: 'All' },
    { id: '2', name: "Don't let me go", mood: 'Elegant, Gently', thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop', category: 'Beautiful ambient' },
    { id: '3', name: "After thoughts", mood: 'Chill', thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', category: 'All' },
    { id: '4', name: "Warm tides", mood: 'Elegant, Gently', thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop', category: 'Beautiful ambient' },
    { id: '5', name: "For all eternity", mood: 'Beautiful Ambient', thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop', category: 'Beautiful ambient' },
  ];

  const deleteShot = (id: string) => {
    setShots(shots.filter(s => s.id !== id));
  };

  const updateTransition = (id: string, transition: string) => {
    setShots(shots.map(shot => 
      shot.id === id ? { ...shot, transition } : shot
    ));
  };

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
    
    setShots(newShots);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRenderVideo = () => {
    setIsRendering(true);
    setRenderProgress(0);
    setRenderComplete(false);
  };

  // Render progress simulation
  useEffect(() => {
    if (isRendering && !renderComplete) {
      const interval = setInterval(() => {
        setRenderProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setRenderComplete(true);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isRendering, renderComplete]);

  const filteredMusic = musicFilter === 'All' 
    ? musicTracks 
    : musicTracks.filter(track => track.category === musicFilter);

  return (
    <div className="fixed inset-0 bg-[#131519] z-50 overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed blur-3xl filter left-[-352px] rounded-[1.67772e+07px] size-[800px] top-[-400px] pointer-events-none" style={{ backgroundImage: "linear-gradient(135deg, rgba(225, 113, 0, 0.2) 0%, rgba(245, 73, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      <div className="fixed blur-3xl filter left-[1501px] rounded-[1.67772e+07px] size-[800px] top-[580px] pointer-events-none" style={{ backgroundImage: "linear-gradient(-45deg, rgba(208, 135, 0, 0.2) 0%, rgba(225, 113, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      
      <div className="h-screen p-8 flex flex-col relative z-10">
        <div className="flex-1 max-w-[1400px] mx-auto w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 flex-shrink-0">
            <div>
              <h1 className="mb-1 flex items-center gap-2">
                Project Editor - {project.title}
              </h1>
              <p className="text-white/60 text-sm">Reorder, delete, and manage your project photos</p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all text-sm">
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleRenderVideo}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Render Video</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all text-sm">
                Close
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Column - Shot Timeline */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg">Shot Timeline</h2>
                <p className="text-white/60 text-sm">{shots.length} shots • Drag to reorder</p>
              </div>

              {/* Timeline Progress */}
              <div className="relative mb-8">
                <div className="h-[2px] bg-white/20 rounded-full">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full">
                  {shots.map((_, index) => (
                    <div key={index} className="w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full shadow-lg"></div>
                  ))}
                </div>
              </div>

              {/* Shot Cards - Horizontal */}
              <div className="flex gap-6 mb-8">
                {shots.map((shot, index) => (
                  <div 
                    key={shot.id} 
                    className={`flex-1 transition-all duration-300 ${
                      draggedIndex === index ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-white/5 border border-white/10 group cursor-move">
                      <img 
                        src={shot.url} 
                        alt={`Shot ${index + 1}`}
                        className="w-full h-full object-cover select-none"
                      />
                      {/* Delete Button */}
                      <button
                        onClick={() => deleteShot(shot.id)}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/70 backdrop-blur-md rounded-lg flex items-center justify-center hover:bg-red-500/80 transition-all border border-white/20 cursor-pointer z-10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Shot Info */}
                    <p className="text-sm mb-2">Shot {index + 1}</p>
                    
                    {/* Transition Dropdown */}
                    <select
                      value={shot.transition}
                      onChange={(e) => updateTransition(shot.id, e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white appearance-none cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='white' opacity='0.6' d='M4 6l4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="Push In" className="bg-black">Push In</option>
                      <option value="Push Out" className="bg-black">Push Out</option>
                      <option value="Orbital Left" className="bg-black">Orbital Left</option>
                      <option value="Orbital Right" className="bg-black">Orbital Right</option>
                      <option value="Speed Ramp" className="bg-black">Speed Ramp</option>
                    </select>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm mb-4">Timeline Editing Instructions</h3>
                <ul className="space-y-2 text-sm text-white/70">
                  <li>• Drag and drop shots left/right along the timeline to reorder them</li>
                  <li>• Use the action button to remove shots</li>
                  <li>• Click "Render Video" to save your changes and start rendering</li>
                  <li>• Use "Reset" to restore the original timeline order</li>
                </ul>
              </div>
            </div>

            {/* Right Column - Background Music */}
            <div className="w-80 backdrop-blur-md bg-white/5 border-l border-white/10 p-6 overflow-y-auto flex-shrink-0">
              <div className="flex items-center gap-2 mb-6">
                <Music className="w-5 h-5" />
                <h2>Background Music</h2>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setMusicFilter('All')}
                  className={`px-4 py-2.5 rounded-lg text-sm transition-all ${
                    musicFilter === 'All'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-lg'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 hover:border-white/20'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setMusicFilter('Beautiful ambient')}
                  className={`px-4 py-2.5 rounded-lg text-sm transition-all ${
                    musicFilter === 'Beautiful ambient'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-lg'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 hover:border-white/20'
                  }`}
                >
                  Beautiful ambient
                </button>
              </div>

              {/* Music List */}
              <div className="space-y-3">
                {filteredMusic.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => setSelectedMusic(track.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer border ${
                      selectedMusic === track.id
                        ? 'bg-white/10 border-amber-400/30 shadow-lg'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                      <img 
                        src={track.thumbnail} 
                        alt={track.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm mb-1 truncate">{track.name}</h3>
                      <p className="text-xs text-white/50">{track.mood}</p>
                    </div>

                    {/* Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center flex-shrink-0 border border-white/10"
                    >
                      <Play className="w-4 h-4 fill-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render Modal */}
      {isRendering && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="backdrop-blur-md bg-white/10 border border-white/10 rounded-xl p-8 max-w-md w-full mx-4">
            {!renderComplete ? (
              <>
                {/* Loading State */}
                <div className="flex flex-col items-center text-center">
                  <Loader2 className="w-16 h-16 mb-6 animate-spin text-amber-400" />
                  <h3 className="text-xl mb-2">Rendering your video...</h3>
                  <p className="text-white/60 text-sm mb-6">Please don&apos;t close this page</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-3 mb-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${renderProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-white/60 text-sm">{renderProgress}%</p>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="flex flex-col items-center text-center">
                  <CheckCircle2 className="w-16 h-16 mb-6 text-green-400" />
                  <h3 className="text-xl mb-2">Project submitted successfully!</h3>
                  <p className="text-white/60 text-sm mb-6">Your video has been rendered and is ready to view</p>
                  
                  <button
                    onClick={() => {
                      setIsRendering(false);
                      onClose();
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-lg hover:shadow-lg hover:scale-105 transition-all"
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
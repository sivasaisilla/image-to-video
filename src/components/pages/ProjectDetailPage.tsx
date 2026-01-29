import { useState } from "react";
import { ArrowLeft, Trash2, Play, Volume2, Edit3, Wand2, Link2, Download, Copy } from "lucide-react";
import { BasicEditorPage } from "../editors/BasicEditorPage";
import { AdvancedEditorPage } from "../editors/AdvancedEditorPage";

interface ProjectDetailPageProps {
  onBack: () => void;
  onDelete?: () => void;
  project: {
    id: string;
    title: string;
    videoUrl?: string;
    description?: string;
    location?: string;
    rating?: number;
  };
}

export function ProjectDetailPage({ onBack, onDelete, project }: ProjectDetailPageProps) {
  const [activeVersion, setActiveVersion] = useState<'mls' | 'client' | 'reel'>('mls');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showBasicEditor, setShowBasicEditor] = useState(false);
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);

  const handleCopyLink = () => {
    // Use fallback method since Clipboard API is blocked in this environment
    const textArea = document.createElement('textarea');
    textArea.value = window.location.href;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    onBack();
  };

  return (
    <div className="fixed inset-0 bg-[#131519] z-[100] overflow-y-auto relative text-white">
      {/* Background Gradients */}
      <div className="fixed blur-3xl filter left-[-352px] rounded-[1.67772e+07px] size-[800px] top-[-400px] pointer-events-none" style={{ backgroundImage: "linear-gradient(135deg, rgba(225, 113, 0, 0.2) 0%, rgba(245, 73, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      <div className="fixed blur-3xl filter left-[1501px] rounded-[1.67772e+07px] size-[800px] top-[580px] pointer-events-none" style={{ backgroundImage: "linear-gradient(-45deg, rgba(208, 135, 0, 0.2) 0%, rgba(225, 113, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      
      <div className="min-h-screen px-8 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            {/* Left - Back Button & Title */}
            <div>
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2.5 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Projects</span>
              </button>
              <h1 className="text-3xl mb-2">{project.title}</h1>
              {project.location && (
                <div className="flex items-center gap-2 text-white/60">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span className="text-sm">{project.location}</span>
                </div>
              )}
            </div>

            {/* Right - Delete Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 backdrop-blur-md bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 hover:border-red-500/30 transition-all text-red-400 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Project</span>
            </button>
          </div>

          {/* Main Content Card */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-8">
            {/* Video Player */}
            <div className={`relative bg-black rounded-xl overflow-hidden mb-6 border ${
              activeVersion === 'reel' 
                ? 'border-pink-500/30 max-w-sm mx-auto aspect-[9/16]' 
                : 'border-white/10 aspect-video'
            }`}>
              {project.videoUrl ? (
                <video
                  controls
                  className={`w-full h-full ${activeVersion === 'reel' ? 'object-cover' : ''}`}
                  src={project.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${
                  activeVersion === 'reel' ? 'bg-gradient-to-br from-pink-500/10 to-orange-500/10' : ''
                }`}>
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                      <Play className="w-10 h-10 text-white/40 ml-1" />
                    </div>
                    <p className="text-white/60">Video Preview</p>
                    <p className="text-white/40 text-sm mt-2">
                      {activeVersion === 'mls' ? 'MLS Version' : activeVersion === 'client' ? 'Client Version' : 'Reel Version (9:16)'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <button
                onClick={() => setShowBasicEditor(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all text-sm"
              >
                <Edit3 className="w-4 h-4" />
                <span>Basic Editor</span>
              </button>
              <button
                onClick={() => setShowAdvancedEditor(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all text-sm"
              >
                <Wand2 className="w-4 h-4" />
                <span>Advanced Editor</span>
              </button>
              <button 
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all relative text-sm"
              >
                {copySuccess ? (
                  <>
                    <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>

            {/* Version Cards */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* MLS Version Card */}
              <button
                onClick={() => setActiveVersion('mls')}
                className={`p-5 rounded-xl transition-all text-left border ${
                  activeVersion === 'mls'
                    ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/40 shadow-lg'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeVersion === 'mls' ? 'bg-blue-500/30' : 'bg-white/10'
                  }`}>
                    <Copy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base mb-1">MLS Version</h3>
                    <p className="text-xs text-white/60">For real estate listings</p>
                  </div>
                </div>
                <p className="text-sm text-white/70">
                  Professional video optimized for MLS platforms with watermark and contact information.
                </p>
              </button>

              {/* Client Version Card */}
              <button
                onClick={() => setActiveVersion('client')}
                className={`p-5 rounded-xl transition-all text-left border ${
                  activeVersion === 'client'
                    ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/40 shadow-lg'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeVersion === 'client' ? 'bg-purple-500/30' : 'bg-white/10'
                  }`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base mb-1">Client Version</h3>
                    <p className="text-xs text-white/60">For personal sharing</p>
                  </div>
                </div>
                <p className="text-sm text-white/70">
                  Clean version without watermarks, perfect for sharing with clients and social media.
                </p>
              </button>

              {/* Reel Version Card */}
              <button
                onClick={() => setActiveVersion('reel')}
                className={`p-5 rounded-xl transition-all text-left border ${
                  activeVersion === 'reel'
                    ? 'bg-gradient-to-br from-pink-500/20 to-orange-600/10 border-pink-500/40 shadow-lg'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeVersion === 'reel' ? 'bg-pink-500/30' : 'bg-white/10'
                  }`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                      <line x1="7" y1="2" x2="7" y2="22"/>
                      <line x1="17" y1="2" x2="17" y2="22"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <line x1="2" y1="7" x2="7" y2="7"/>
                      <line x1="2" y1="17" x2="7" y2="17"/>
                      <line x1="17" y1="17" x2="22" y2="17"/>
                      <line x1="17" y1="7" x2="22" y2="7"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base mb-1">Reel Version</h3>
                    <p className="text-xs text-white/60">For Instagram & TikTok</p>
                  </div>
                </div>
                <p className="text-sm text-white/70">
                  Vertical format video optimized for social media reels and stories (9:16).
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl mb-3">Delete Project?</h3>
            <p className="text-white/80 mb-6">
              Are you sure you want to delete "{project.title}"? This action cannot be undone and all video versions will be permanently removed.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-lg transition-all shadow-lg"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Basic Editor Modal */}
      {showBasicEditor && (
        <BasicEditorPage
          onClose={() => setShowBasicEditor(false)}
          project={project}
        />
      )}

      {/* Advanced Editor Modal */}
      {showAdvancedEditor && (
        <AdvancedEditorPage
          onClose={() => setShowAdvancedEditor(false)}
          project={project}
        />
      )}
    </div>
  );
}
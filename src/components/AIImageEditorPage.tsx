import React, { useState } from "react";
import { X, Wand2, Download, ChevronLeft, User, ChevronDown, Upload, Crown, Loader2, Sparkles } from "lucide-react";
import svgPaths from "../imports/svg-nqiqmt8jqs";

interface AIImageEditorPageProps {
  onClose: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToProjects?: () => void;
  onNavigateToSubscription?: () => void;
  onLogout?: () => void;
}

export function AIImageEditorPage({ onClose, onNavigateToCreate, onNavigateToProjects, onNavigateToSubscription, onLogout }: AIImageEditorPageProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState<string>("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string; dimensions: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const suggestions = [
    "Add blue sky with clouds",
    "Remove furniture from room",
    "Enhance natural lighting",
    "Add modern staging",
    "Replace flooring with hardwood",
    "Add virtual garden landscape",
    "Brighten dark corners",
    "Add sunset lighting"
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Set file info
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const type = file.type;
      const name = file.name;
      
      // Create a temporary image to get dimensions
      const img = new Image();
      img.onload = () => {
        setFileInfo({ 
          name, 
          size: sizeInMB + " MB", 
          type: type.split('/')[1].toUpperCase(), 
          dimensions: `${img.width} x ${img.height}` 
        });
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setEditPrompt(suggestion);
    setSelectedSuggestion(suggestion);
    setShowSuggestions(false);
  };

  const handleGenerateEdit = () => {
    if (selectedImage && editPrompt) {
      setIsGenerated(true);
      setIsProcessing(true);
      setProcessingProgress(0);

      // Simulate processing with progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setProcessingProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          // setTimeout(() => {
          //   setIsProcessing(false);
          //   // Load the edited image
          //   import("figma:asset/065da803cea488bd425bf1b035983f94b5a0d54e.png").then((module) => {
          //     setEditedImage(module.default);
          //   });
          // }, 500);
        }
      }, 500);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setFileInfo(null);
    setIsGenerated(false);
    setEditPrompt("");
    setSelectedSuggestion("");
    setIsProcessing(false);
    setProcessingProgress(0);
    setEditedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-[#131519] z-50 flex flex-col relative">
      {/* Background Gradients */}
      <div className="fixed blur-3xl filter left-[-352px] rounded-[1.67772e+07px] size-[800px] top-[-400px] pointer-events-none" style={{ backgroundImage: "linear-gradient(135deg, rgba(225, 113, 0, 0.2) 0%, rgba(245, 73, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      <div className="fixed blur-3xl filter left-[1501px] rounded-[1.67772e+07px] size-[800px] top-[580px] pointer-events-none" style={{ backgroundImage: "linear-gradient(-45deg, rgba(208, 135, 0, 0.2) 0%, rgba(225, 113, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      
      {/* Header */}
      <header className="sticky top-0 px-8 py-4 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 86 97" fill="none" preserveAspectRatio="none">
              <g clipPath="url(#clip0_ai_editor)">
                <g>
                  <path d={svgPaths.p1fc0d980} fill="white" />
                  <path d={svgPaths.p3fa59880} fill="white" />
                  <path d={svgPaths.p24ace280} fill="white" />
                </g>
                <g>
                  <path d={svgPaths.p11a6300} fill="url(#paint0_linear_ai_editor)" />
                  <path d={svgPaths.p3fa59880} fill="url(#paint1_linear_ai_editor)" />
                </g>
                <path d={svgPaths.p31d8dc80} fill="white" />
                <path d={svgPaths.p9680300} fill="white" />
              </g>
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_ai_editor" x1="43" x2="43" y1="30" y2="144">
                  <stop stopColor="#FF8300" />
                  <stop offset="1" stopColor="white" />
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_ai_editor" x1="43" x2="43" y1="30" y2="144">
                  <stop stopColor="#FF8300" />
                  <stop offset="1" stopColor="white" />
                </linearGradient>
                <clipPath id="clip0_ai_editor">
                  <rect fill="white" height="97" width="86" />
                </clipPath>
              </defs>
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="tracking-wider text-xs">IMOB</span>
              <span className="tracking-wider text-xs">MOTION</span>
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <button 
              onClick={onNavigateToCreate}
              className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Create
            </button>
            <button 
              onClick={onNavigateToProjects}
              className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Projects
            </button>
            <button className="px-6 py-2 bg-white text-black rounded-md hover:bg-white/90 transition-all">
              Image Edit
            </button>
            <button 
              onClick={onNavigateToSubscription}
              className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Subscription
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
                className="flex items-center gap-3 px-3 py-2 backdrop-blur-md bg-white/5 border border-white/20 rounded-md hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-sm">John Doe</span>
                  <span className="text-xs text-white/50">Creator</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-[200px] backdrop-blur-md bg-black/95 border border-white/20 rounded-md shadow-2xl overflow-hidden">
                  <button className="block w-full px-4 py-3 text-left text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                    Profile
                  </button>
                  <button className="block w-full px-4 py-3 text-left text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                    Settings
                  </button>
                  <div className="border-t border-white/10"></div>
                  <button
                    onClick={onLogout}
                    className="block w-full px-4 py-3 text-left text-white/80 hover:bg-white/10 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Upload & Edit */}
        <div className="w-96 bg-black/40 backdrop-blur-md border-r border-white/10 flex flex-col flex-shrink-0">
          <div className="flex-1 overflow-y-auto p-8">
            <h2 className="text-sm mb-6 flex items-center gap-2 text-white/80">
              <Upload className="w-4 h-4" />
              <span>Upload & Edit</span>
            </h2>

            {/* Upload Area */}
            <div className="mb-8">
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {selectedImage && fileInfo ? (
                  <div className="border border-white/20 rounded-md p-4 hover:border-white/40 bg-white/5 backdrop-blur-sm transition-all">
                    <div className="flex items-center gap-3">
                      <img src={selectedImage} alt="Thumbnail" className="w-16 h-16 object-cover rounded-md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate mb-1">{fileInfo.name}</p>
                        <p className="text-xs text-white/60">{fileInfo.size} • {fileInfo.type}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-white/20 rounded-md p-8 hover:border-white/40 hover:bg-white/5 transition-all">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-md bg-white/5 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-white/60" />
                      </div>
                      <p className="text-sm mb-1">Drop your image here</p>
                      <p className="text-xs text-white/50 mb-3">or click to browse</p>
                      <p className="text-xs text-white/40">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Edit Prompt */}
            <div className="mb-6">
              <label className="block text-xs text-white/60 mb-2">
                Edit Prompt
              </label>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="Describe what you want to change in the image..."
                className="w-full h-24 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-md text-sm placeholder:text-white/40 focus:outline-none focus:border-white/40 focus:bg-white/10 resize-none transition-all"
              ></textarea>
            </div>

            {/* Real Estate Suggestions Dropdown */}
            <div className="mb-8">
              <label className="block text-xs text-white/60 mb-2">
                Real Estate Suggestions
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-md hover:bg-white/10 hover:border-white/30 transition-all text-sm text-left"
                >
                  <span className={selectedSuggestion ? "text-white" : "text-white/40"}>
                    {selectedSuggestion || "Select a suggestion..."}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-md border border-white/20 rounded-md shadow-2xl z-10 max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="w-full px-4 py-3 text-sm text-left hover:bg-white/10 transition-all border-b border-white/5 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Generate Edit Button */}
            <button
              onClick={handleGenerateEdit}
              disabled={!selectedImage || !editPrompt}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-md hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              <Wand2 className="w-4 h-4" />
              <span>Generate Edit</span>
            </button>

            {/* Clear Image Button */}
            {selectedImage && (
              <button
                onClick={handleClearImage}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 backdrop-blur-md bg-white/5 border border-white/20 rounded-md hover:bg-white/10 hover:border-white/30 transition-all mt-3"
              >
                <X className="w-4 h-4" />
                <span>Clear Image</span>
              </button>
            )}
          </div>

          {/* Premium Access Banner */}
          <div className="p-6 border-t border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm mb-1">Premium Access Required</h3>
                <p className="text-xs text-white/60 mb-3">
                  Unlock unlimited AI image edits with premium features
                </p>
                <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 hover:border-white/30 transition-all text-xs">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Preview Area */}
        <div className="flex-1 bg-black flex flex-col overflow-hidden">
          {isProcessing ? (
            /* Processing State */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-2xl">
                {/* Processing Card */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8 mb-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-md bg-white/5 border border-white/20 flex items-center justify-center">
                      <Loader2 className="w-10 h-10 animate-spin text-white/60" />
                    </div>
                    <h2 className="text-xl mb-2">Processing Your Image</h2>
                    <p className="text-sm text-white/60">AI is generating your edited image...</p>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/80">Generation Progress</span>
                      <span className="text-sm text-white/60">{processingProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Status Info */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-md bg-white/5 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white/60" />
                    </div>
                    <div>
                      <h3 className="text-sm mb-1">Edit Status</h3>
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-md text-white/80 text-xs">
                        <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse"></span>
                        Processing
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-white/50 min-w-[80px]">Prompt:</span>
                      <span className="text-white/80 flex-1">{editPrompt || "Processing..."}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-white/50 min-w-[80px]">Status:</span>
                      <span className="text-white/80 flex-1">Applying AI transformations...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedImage && isGenerated && editedImage ? (
            /* Result State - After Processing Complete */
            <div className="flex-1 flex flex-col p-8">
              {/* Header Actions */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white/60" />
                  </div>
                  <div>
                    <h2 className="text-xl mb-1">Edit Complete</h2>
                    <p className="text-xs text-white/60">Your AI-edited image is ready</p>
                  </div>
                </div>
                <button
                  onClick={handleClearImage}
                  className="flex items-center gap-2 px-4 py-2 backdrop-blur-md bg-white/5 border border-white/20 rounded-md hover:bg-white/10 hover:border-white/30 transition-all"
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Before/After Comparison */}
              <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                {/* Original Image */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between backdrop-blur-sm bg-white/5">
                    <span className="text-sm text-white/80">Original</span>
                    {fileInfo && (
                      <span className="text-xs text-white/50">{fileInfo.dimensions}</span>
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-center p-6 min-h-0">
                    <img
                      src={selectedImage}
                      alt="Original"
                      className="max-w-full max-h-full object-contain rounded-md"
                    />
                  </div>
                </div>

                {/* Edited Image */}
                <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between backdrop-blur-sm bg-white/5">
                    <span className="text-sm text-white/80 flex items-center gap-2">
                      Edited
                      <span className="px-2 py-1 bg-white/10 border border-white/20 rounded-md text-white/80 text-xs">
                        New
                      </span>
                    </span>
                    {fileInfo && (
                      <span className="text-xs text-white/50">{fileInfo.dimensions}</span>
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-center p-6 min-h-0">
                    <img
                      src={editedImage}
                      alt="Edited"
                      className="max-w-full max-h-full object-contain rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Info Panel */}
              <div className="mt-6 backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-6">
                <div className="grid grid-cols-4 gap-6 mb-6 pb-6 border-b border-white/10">
                  <div>
                    <p className="text-xs text-white/50 mb-2">Dimensions</p>
                    <p className="text-sm">{fileInfo?.dimensions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-2">File Size</p>
                    <p className="text-sm">{fileInfo?.size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-2">Format</p>
                    <p className="text-sm">{fileInfo?.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-2">Edit Type</p>
                    <p className="text-sm">AI Enhanced</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 mb-2">Applied Prompt</p>
                    <p className="text-sm text-white/80">{editPrompt}</p>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-md hover:bg-white/90 transition-all">
                    <Download className="w-4 h-4" />
                    <span>Download Result</span>
                  </button>
                </div>
              </div>
            </div>
          ) : selectedImage && isGenerated ? (
            <div className="flex-1 flex items-center justify-center p-8 relative">
              {/* Close Button */}
              <button
                onClick={handleClearImage}
                className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-md flex items-center justify-center transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image Preview */}
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-[calc(100%-120px)] object-contain rounded-md"
              />

              {/* File Info Bottom Panel */}
              {fileInfo && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10 p-6">
                  <div className="grid grid-cols-3 gap-6 mb-4">
                    <div>
                      <p className="text-xs text-white/50 mb-2">Dimensions</p>
                      <p className="text-sm">{fileInfo.dimensions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-2">File size</p>
                      <p className="text-sm">{fileInfo.size}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-2">File type</p>
                      <p className="text-sm">{fileInfo.type}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 pt-4 border-t border-white/10">
                    <div className="flex-1">
                      <p className="text-xs text-white/50 mb-1">Recommended</p>
                      <p className="text-xs text-white/80">Use high-resolution images for best results</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-white/50 mb-1">Supported formats</p>
                      <p className="text-xs text-white/80">JPG, PNG, WebP up to 10MB</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : selectedImage ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="relative max-w-full max-h-full">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-md bg-white/5 flex items-center justify-center">
                  <Upload className="w-12 h-12 text-white/20" />
                </div>
                <h3 className="text-xl mb-2 text-white/60">No Image Selected</h3>
                <p className="text-sm text-white/40">
                  Upload an image to start editing with AI
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
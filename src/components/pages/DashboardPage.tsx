import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Infinity, Plus, FolderOpen, Image, CreditCard, Upload, Music, MapPin, CheckCircle2, User, ChevronDown, X, Link2, Download, LogOut, GripVertical, Gift } from "lucide-react";
import { motion } from "motion/react";
import { InteractiveMap } from "../common";
import { DashboardHeader } from "../layout";
import { VideoPlaybackModal } from "../modals";
import { authService, storageService, projectService, cloudFunctions, photoService, assetService, jobService, ProjectPhoto } from "../../services/firebase";
import { musicService, DEFAULT_MUSIC_LIBRARY } from "../../services/musicService";
import { wizardService } from "../../services/wizardService";

interface UploadedPhoto {
  id: string;
  name: string;
  size: string;
  url: string;
  storagePath?: string;
}

interface PreviousLogo {
  id: string;
  url: string;
  uploadedAt: string;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [hasUploadedFiles, setHasUploadedFiles] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [videoCreated, setVideoCreated] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<'processing' | 'completed' | 'failed' | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoExpiresAt, setVideoExpiresAt] = useState<number | null>(null);
  const [showVideoPlayback, setShowVideoPlayback] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const [previousLogos, setPreviousLogos] = useState<PreviousLogo[]>([
    {
      id: 'logo-1',
      url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop',
      uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString() // 3 days ago
    },
    {
      id: 'logo-2',
      url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200&h=200&fit=crop',
      uploadedAt: new Date(Date.now() - 86400000 * 7).toISOString() // 7 days ago
    }
  ]);
  const [showLogoOnVideo, setShowLogoOnVideo] = useState(true);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [playingMusic, setPlayingMusic] = useState<string | null>(null);
  const [musicFilter, setMusicFilter] = useState<string>("All");
  const [addressQuery, setAddressQuery] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("House");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([40.7128, -74.0060]);
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState<'processing' | 'completed' | null>(null);
  const [importMethod, setImportMethod] = useState<'url' | 'manual'>('manual');
  const [listingUrl, setListingUrl] = useState<string>("");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [useFreeVideo, setUseFreeVideo] = useState(false);
  const [musicLibrary, setMusicLibrary] = useState(DEFAULT_MUSIC_LIBRARY);
  
  // Load music catalog from Firestore on component mount
  useEffect(() => {
    musicService.getAllSongs().then(songs => {
      if (songs && songs.length > 0) {
        setMusicLibrary(songs);
      }
    }).catch(error => {
      console.error('Failed to load music catalog:', error);
      setMusicLibrary(DEFAULT_MUSIC_LIBRARY);
    });
  }, []);

  // Load wizard data when project changes
  useEffect(() => {
    if (!currentProjectId) return;

    wizardService.getWizardData(currentProjectId).then(wizardData => {
      if (wizardData) {
        if (wizardData.step2?.showLogoOnVideo !== undefined) {
          setShowLogoOnVideo(wizardData.step2.showLogoOnVideo);
        }
        if (wizardData.step2?.logoUrl) {
          setUploadedLogo(wizardData.step2.logoUrl);
        }
        if (wizardData.step3?.selectedMusicId) {
          setSelectedMusic(wizardData.step3.selectedMusicId);
        }
        if (wizardData.step4?.address) {
          setAddressQuery(wizardData.step4.address);
          if (wizardData.step4.city) setCity(wizardData.step4.city);
          if (wizardData.step4.state) setState(wizardData.step4.state);
          if (wizardData.step4.propertyType) setPropertyType(wizardData.step4.propertyType);
        }
      }
    }).catch(error => {
      console.error('Failed to load wizard data:', error);
    });
  }, [currentProjectId]);

  // Auto-save wizard data on step changes
  useEffect(() => {
    if (!currentProjectId) return;

    const saveTimeout = setTimeout(() => {
      const stepData = {
        step1: { photosCount: uploadedPhotos.length },
        step2: { showLogoOnVideo, logoUrl: uploadedLogo },
        step3: { selectedMusicId: selectedMusic },
        step4: { address: addressQuery, city, state, propertyType }
      };

      wizardService.saveWizardData(currentProjectId, stepData)
        .catch(error => console.error('Failed to save wizard data:', error));
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(saveTimeout);
  }, [currentProjectId, uploadedPhotos.length, showLogoOnVideo, uploadedLogo, selectedMusic, addressQuery, city, state, propertyType]);
  
  // Mock free video seconds - in production this would come from backend
  const availableFreeSeconds = 120; // Total free seconds available (e.g., 2x60s videos)
  const currentVideoSeconds = uploadedPhotos.length * 3; // Current video duration
  const canUseFreeCredit = availableFreeSeconds > 0;
  const freeSecondsToUse = Math.min(currentVideoSeconds, availableFreeSeconds);
  const remainingFreeSeconds = Math.max(0, availableFreeSeconds - currentVideoSeconds);
  const paidSeconds = Math.max(0, currentVideoSeconds - availableFreeSeconds);
  const isFullyFree = currentVideoSeconds <= availableFreeSeconds;

  const steps = [
    { name: "Upload Photos", icon: Upload },
    { name: "Add Branding", icon: Image },
    { name: "Add Music", icon: Music },
    { name: "Add Address", icon: MapPin },
    { name: "Project Summary", icon: CheckCircle2 },
  ];

  // Load photos when project changes
  useEffect(() => {
    if (!currentProjectId) return;

    const unsubscribe = photoService.onPhotosChange(currentProjectId, (photos) => {
      const convertedPhotos: UploadedPhoto[] = photos.map((photo: ProjectPhoto) => ({
        id: photo.id || '',
        name: photo.fileName,
        size: formatFileSize(photo.fileSize),
        url: photo.url,
        storagePath: photo.storagePath,
      }));
      setUploadedPhotos(convertedPhotos);
      setHasUploadedFiles(convertedPhotos.length > 0);
    });

    return () => unsubscribe();
  }, [currentProjectId]);

  // Load previous logos when component mounts
  useEffect(() => {
    const loadPreviousLogos = async () => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      const logos = await assetService.getUserAssets(currentUser.uid, 'logo');
      const convertedLogos: PreviousLogo[] = logos.map((logo) => ({
        id: logo.id || '',
        url: logo.url,
        uploadedAt: logo.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));
      setPreviousLogos(convertedLogos);
    };

    loadPreviousLogos();
  }, []);

  // Listen to job status changes (realtime)
  useEffect(() => {
    if (!currentJobId) return;

    const unsubscribe = jobService.onJobChange(currentJobId, async (job) => {
      if (job) {
        setJobStatus(job.status as 'processing' | 'completed' | 'failed');
        
        if (job.status === 'completed' && job.output?.videoAssetId) {
          // Get the video asset to find its storage path
          const assetId = job.output.videoAssetId;
          console.log('Job completed with video asset:', assetId);
          
          // Get signed URL for playback
          // The asset storage path is stored in the job, we'll construct it
          const videoStoragePath = `users/${job.uid}/videos/${job.projectId}_${Date.now()}.mp4`;
          
          // Actually, we should get it from the asset document, but for now we'll use the path from webhook
          // The webhook stores it, we just need to generate a signed URL
          // Since we don't have direct access to asset doc from here, we'll fetch the job's video path
          
          // For now, construct the typical path - in production you'd fetch the asset doc
          const estimatedPath = job.input?.imageUrls?.[0] ? 
            `users/${job.uid}/videos/${job.projectId}_${Date.now()}.mp4` : null;
          
          if (estimatedPath) {
            const urlResult = await cloudFunctions.getSignedVideoUrl(estimatedPath, 60);
            if (urlResult.success && urlResult.url) {
              setVideoUrl(urlResult.url);
              setVideoExpiresAt(urlResult.expiresAt || null);
              setShowVideoPlayback(true);
            }
          }
          
          setVideoCreated(true);
          setUploadSuccess(true);
          
          // Clean up wizard session after successful video creation
          if (currentProjectId) {
            wizardService.deleteWizardSession(currentProjectId)
              .catch(error => console.error('Failed to delete wizard session:', error));
          }
          
          // Auto-navigate to projects after video is done
          setTimeout(() => {
            setVideoCreated(false);
            setCurrentStep(0);
            setUploadedPhotos([]);
            setHasUploadedFiles(false);
            setSelectedLogo(null);
            setUploadedLogo(null);
            setCurrentProjectId(null);
            setCurrentJobId(null);
          }, 3000);
        } else if (job.status === 'failed') {
          alert(`Video generation failed: ${job.error || 'Unknown error'}`);
          setCurrentJobId(null);
        }
      }
    });

    return () => unsubscribe();
  }, [currentJobId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Handle file upload
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        alert('Please login to upload files');
        setIsUploading(false);
        return;
      }

      // Create project if not exists or use existing one
      let projectId = currentProjectId;
      
      if (!projectId) {
        const projectResult = await projectService.create(currentUser.uid, `Project ${new Date().toLocaleDateString()}`);
        if (!projectResult.success || !projectResult.projectId) {
          throw new Error('Failed to create project');
        }
        projectId = projectResult.projectId;  // Use the newly created ID directly
        setCurrentProjectId(projectId);  // Update state for future uploads
      }

      if (!projectId) throw new Error('No project ID');

      // Get current photo count for ordering
      const existingPhotos = await photoService.getProjectPhotos(projectId);
      let nextOrder = existingPhotos.length;

      // Upload each file using photoService (which handles Firestore persistence)
      for (const file of files) {
        try {
          const photoResult = await photoService.addPhoto(
            currentUser.uid,
            projectId,
            file,
            nextOrder,
            3 // 3 seconds per photo
          );

          if (!photoResult.success) {
            console.error('Failed to upload photo:', photoResult.error);
            alert(`Failed to upload ${file.name}: ${photoResult.error}`);
          }
          nextOrder++;
        } catch (fileError) {
          console.error('Error uploading individual file:', fileError);
          alert(`Error uploading ${file.name}`);
        }
      }

      // Update project stepState
      const project = await projectService.getProject(projectId);
      if (project) {
        await projectService.update(projectId, {
          stepState: { ...project.stepState, photos: true }
        });
      }

      setUploadSuccess(true);
      setHasUploadedFiles(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const removePhoto = async (id: string) => {
    if (!currentProjectId) return;

    try {
      const photoToRemove = uploadedPhotos.find(p => p.id === id);
      if (!photoToRemove) return;

      await photoService.deletePhoto(currentProjectId, id, photoToRemove.storagePath || '');
      // Photo will be removed automatically via realtime listener
    } catch (error) {
      console.error('Failed to delete photo:', error);
      alert('Failed to delete photo');
    }
  };

  const handlePhotoReorder = async (fromIndex: number, toIndex: number) => {
    if (!currentProjectId) return;

    try {
      // Reorder local state
      const newPhotos = [...uploadedPhotos];
      const [removed] = newPhotos.splice(fromIndex, 1);
      newPhotos.splice(toIndex, 0, removed);

      // Update Firestore with new orders
      const photoOrders = newPhotos.map((photo, idx) => ({
        id: photo.id,
        order: idx,
      }));

      await photoService.reorderPhotos(currentProjectId, photoOrders);
    } catch (error) {
      console.error('Failed to reorder photos:', error);
      alert('Failed to reorder photos');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFetchFromUrl = async () => {
    if (!listingUrl) return;
    
    setIsFetchingUrl(true);
    
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        alert('Please login to import photos');
        setIsFetchingUrl(false);
        return;
      }

      // Create project if not exists or use existing one
      let projectId = currentProjectId;
      
      if (!projectId) {
        const projectResult = await projectService.create(currentUser.uid, `Project ${new Date().toLocaleDateString()}`);
        if (!projectResult.success || !projectResult.projectId) {
          throw new Error('Failed to create project');
        }
        projectId = projectResult.projectId;  // Use the newly created ID directly
        setCurrentProjectId(projectId);  // Update state for future imports
      }

      if (!projectId) throw new Error('No project ID');

      // Fetch image from URL
      const response = await fetch(listingUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Validate it's an image
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL does not point to a valid image');
      }

      // Extract filename from URL or create one
      const urlPath = new URL(listingUrl).pathname;
      const filename = urlPath.split('/').pop() || `image-${Date.now()}.jpg`;
      
      // Create a File object from the blob
      const file = new File([blob], filename, { type: blob.type });

      // Get current photo count for ordering
      const existingPhotos = await photoService.getProjectPhotos(projectId);
      let nextOrder = existingPhotos.length;

      // Upload using photoService (same as manual upload)
      const photoResult = await photoService.addPhoto(
        currentUser.uid,
        projectId,
        file,
        nextOrder,
        3 // 3 seconds per photo
      );

      if (!photoResult.success) {
        throw new Error(photoResult.error || 'Failed to upload imported image');
      }

      // Clear the URL input
      setListingUrl('');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      
      setIsFetchingUrl(false);
    } catch (error) {
      console.error('URL import error:', error);
      alert('Failed to import from URL. Please upload photos directly.');
      setIsFetchingUrl(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setIsUploadingLogo(true);
      
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          alert('Please login to upload logo');
          setIsUploadingLogo(false);
          return;
        }

        console.log('Starting logo upload for:', file.name);
        const assetResult = await assetService.uploadAsset(currentUser.uid, 'logo', file);
        console.log('Asset upload result:', assetResult);
        
        if (assetResult.success && assetResult.asset) {
          console.log('Logo uploaded successfully:', assetResult.asset.url);
          
          // Update project with logo asset ID
          if (currentProjectId) {
            console.log('Updating project with logo asset ID');
            const updateResult = await projectService.update(currentProjectId, {
              branding: {
                enabled: true,
                logoAssetId: assetResult.asset.id || null
              }
            });
            console.log('Project update result:', updateResult);
          }

          // Add to previous logos
          const newLogo: PreviousLogo = {
            id: assetResult.asset.id || `logo-${Date.now()}`,
            url: assetResult.asset.url,
            uploadedAt: new Date().toISOString()
          };
          setPreviousLogos([newLogo, ...previousLogos]);
          
          setUploadedLogo(assetResult.asset.url);
          setSelectedLogo(assetResult.asset.url);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3000);
        } else {
          console.error('Asset upload failed:', assetResult.error);
          alert(`Failed to upload logo: ${assetResult.error}`);
        }
      } catch (error) {
        console.error('Logo upload failed:', error);
        alert('Failed to upload logo. Please try again.');
      } finally {
        setIsUploadingLogo(false);
        // Reset file input so the same file can be selected again
        if (logoFileInputRef.current) {
          logoFileInputRef.current.value = '';
        }
      }
    }
  };

  const handleCreateVideo = async () => {
    setIsCreatingVideo(true);

    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        alert('Please login to create video');
        setIsCreatingVideo(false);
        return;
      }

      if (!currentProjectId) {
        alert('Please upload photos first');
        setIsCreatingVideo(false);
        return;
      }

      // Get photo storage paths (not URLs) for the Cloud Function
      const photoStoragePaths = uploadedPhotos.map(p => p.storagePath || '');

      // Call Cloud Function to create video job
      const result = await cloudFunctions.createVideoJob(currentProjectId, photoStoragePaths, {
        duration: currentVideoSeconds,
        aspectRatio: '16:9',
        prompt: `Professional real estate video showcasing property at ${addressQuery || 'the location'}`,
      });

      if (result.success && result.jobId) {
        setCurrentJobId(result.jobId);
        setJobStatus('processing');
        setCreationStep('processing');
        setIsCreating(true);
      } else {
        throw new Error(result.error || 'Failed to create video');
      }
    } catch (error) {
      console.error('Video creation failed:', error);
      alert('Failed to create video. Please try again.');
      setIsCreatingVideo(false);
    }
  };

  const logoLibrary = [
    { id: 'remax', name: 'RE/MAX', color: 'bg-white/10' },
    { id: 'sothebys', name: "Sotheby's", color: 'bg-white/10' },
    { id: 'douglas', name: 'Douglas Elliman', color: 'bg-white/10' },
    { id: 'coldwell', name: 'Coldwell Banker', color: 'bg-white/10' },
    { id: 'century21', name: 'Century 21', color: 'bg-white/10' },
    { id: 'compass', name: 'Compass', color: 'bg-white/10' },
    { id: 'keller', name: 'Keller Williams', color: 'bg-white/10' },
    { id: 'engel', name: 'Engel & Völkers', color: 'bg-white/10' },
  ];

  const musicFilters = ["All", "Beautiful ambient", "Chill", "Elegant gently", "Modern hip-hop", "Vocal music songs"];

  // musicLibrary is now fetched from Firestore via useEffect above
  
  const filteredMusic = musicFilter === "All" 
    ? musicLibrary 
    : musicLibrary.filter(song => song.category === musicFilter);

  // Mock address suggestions
  const addressSuggestions = [
    { id: 1, address: "123 Main Street", city: "New York", state: "NY", country: "USA" },
    { id: 2, address: "456 Park Avenue", city: "New York", state: "NY", country: "USA" },
    { id: 3, address: "789 Broadway", city: "New York", state: "NY", country: "USA" },
    { id: 4, address: "321 Ocean Drive", city: "Miami", state: "FL", country: "USA" },
    { id: 5, address: "654 Sunset Boulevard", city: "Los Angeles", state: "CA", country: "USA" },
    { id: 6, address: "987 Michigan Avenue", city: "Chicago", state: "IL", country: "USA" },
    { id: 7, address: "147 Market Street", city: "San Francisco", state: "CA", country: "USA" },
    { id: 8, address: "258 Elm Street", city: "Boston", state: "MA", country: "USA" },
    { id: 9, address: "369 Oak Avenue", city: "Seattle", state: "WA", country: "USA" },
    { id: 10, address: "741 Pine Road", city: "Austin", state: "TX", country: "USA" },
  ];

  const filteredAddresses = addressQuery.length > 0
    ? addressSuggestions.filter(item => 
        item.address.toLowerCase().includes(addressQuery.toLowerCase()) ||
        item.city.toLowerCase().includes(addressQuery.toLowerCase()) ||
        item.state.toLowerCase().includes(addressQuery.toLowerCase())
      )
    : [];

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutDialog(false);
    await authService.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#131519] text-white relative">
      {/* Video Playback Modal */}
      <VideoPlaybackModal
        isOpen={showVideoPlayback}
        onClose={() => {
          setShowVideoPlayback(false);
          setVideoUrl(null);
        }}
        videoUrl={videoUrl || ""}
        videoTitle="Generated Video"
        expiresAt={videoExpiresAt || undefined}
      />

      {/* Background Gradients */}
      <div className="fixed blur-3xl filter left-[-352px] rounded-[1.67772e+07px] size-[800px] top-[-400px] pointer-events-none" style={{ backgroundImage: "linear-gradient(135deg, rgba(225, 113, 0, 0.2) 0%, rgba(245, 73, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      <div className="fixed blur-3xl filter left-[1501px] rounded-[1.67772e+07px] size-[800px] top-[580px] pointer-events-none" style={{ backgroundImage: "linear-gradient(-45deg, rgba(208, 135, 0, 0.2) 0%, rgba(225, 113, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      
      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md mx-4"
          >
            <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mx-auto mb-6">
                <LogOut className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl text-center mb-3">Log Out</h3>
              <p className="text-white/60 text-center mb-8">
                Are you sure you want to log out of your account?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  className="flex-1 px-6 py-3 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 px-6 py-3 bg-white text-black hover:bg-white/90 rounded-md transition-all duration-300"
                >
                  Log Out
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 px-8 py-4 z-50">
        <DashboardHeader
          onNavigateToProjects={() => navigate("/projects")}
          onNavigateToProfile={() => navigate("/profile")}
          onNavigateToSettings={() => navigate("/settings")}
          onNavigateToPlans={() => navigate("/plans")}
          onNavigateToReferral={() => navigate("/referral")}
          onLogout={handleLogoutClick}
          activePage="create"
        />
      </header>

      {/* Workflow Steps */}
      <div className="px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Steps Container */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={index} className="flex items-center">
                  {/* Step Item */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="flex flex-col items-center gap-3"
                  >
                    {/* Icon Circle */}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isActive
                          ? "bg-white text-black border-white shadow-lg shadow-white/30 scale-110"
                          : isCompleted
                          ? "bg-white/10 border-white/50 text-white"
                          : "bg-white/5 border-white/20 text-white/40"
                      }`}
                    >
                      <Icon className={`${isActive ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300`} />
                    </div>
                    
                    {/* Step Label */}
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`text-xs text-center whitespace-nowrap transition-all duration-300 ${
                          isActive ? "text-white" : "text-white/60"
                        }`}
                      >
                        {step.name}
                      </span>
                      <span className={`text-xs transition-all duration-300 ${
                        isActive ? "text-white/70" : "text-white/40"
                      }`}>
                        Step {index + 1}
                      </span>
                    </div>
                  </motion.div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="w-24 px-3 -mt-12">
                      <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: index < currentStep ? "100%" : "0%" }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className="h-full bg-gradient-to-r from-white/60 to-white/80 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-8 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-8"
          >
            {/* Step 0: Upload Photos */}
            {currentStep === 0 && (
              <>
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-2xl mb-2">Upload Photos</h2>
                  <p className="text-white/60 text-sm">
                    Import from a listing URL or upload manually
                  </p>
                </div>

                {/* Import Method Toggle - iOS Style */}
                <div className="inline-flex p-1 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg mb-6">
                  <button
                    onClick={() => setImportMethod('manual')}
                    className={`px-6 py-2.5 rounded-lg transition-all text-sm flex items-center gap-2 ${
                      importMethod === 'manual'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-lg'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Manual Upload</span>
                  </button>
                  <button
                    onClick={() => setImportMethod('url')}
                    className={`px-6 py-2.5 rounded-lg transition-all text-sm flex items-center gap-2 ${
                      importMethod === 'url'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-lg'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Link2 className="w-4 h-4" />
                    <span>Import from URL</span>
                  </button>
                </div>

                {/* URL Import Section */}
                {importMethod === 'url' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    {/* Hero Card */}
                    <div className="relative p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl mb-4 overflow-hidden">
                      {/* Subtle Gradient Orb */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/5 to-orange-400/0 blur-3xl rounded-full"></div>
                      
                      <div className="relative">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <Link2 className="w-5 h-5 text-white/80" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm mb-1">Paste Listing URL</h3>
                            <p className="text-xs text-white/60 mb-3">We&apos;ll automatically fetch all photos from the property listing</p>
                            
                            {/* Supported Platforms */}
                            <div className="flex flex-wrap gap-1.5">
                              {['Zillow', 'Realtor.com', 'Redfin', 'Trulia', 'Apartments.com'].map((site) => (
                                <span key={site} className="px-2 py-1 bg-white/10 border border-white/10 rounded text-xs text-white/70">
                                  {site}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* URL Input */}
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="url"
                              value={listingUrl}
                              onChange={(e) => setListingUrl(e.target.value)}
                              placeholder="https://www.zillow.com/homedetails/..."
                              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all text-white placeholder:text-white/30 text-sm"
                            />
                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          </div>
                          <button
                            onClick={handleFetchFromUrl}
                            disabled={!listingUrl || isFetchingUrl}
                            className="px-5 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                          >
                            {isFetchingUrl ? (
                              <>
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                <span>Fetching...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                <span>Fetch</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Manual Upload Section */}
                {(importMethod === 'manual' || uploadedPhotos.length > 0) && (
                  <>
                    {uploadedPhotos.length === 0 ? (
                      // Empty State - Large Upload Area
                      <div className="mb-6">
                        <label
                          className={`block border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                            dragActive
                              ? "border-amber-400/40 bg-white/10"
                              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileInput}
                            className="hidden"
                            disabled={isUploading}
                          />
                          {isUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                              <h3 className="text-sm mb-2">Uploading...</h3>
                              <p className="text-white/60 text-xs">Please wait while we upload your files</p>
                            </>
                          ) : uploadSuccess ? (
                            <>
                              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                              </div>
                              <h3 className="text-sm mb-2 text-green-500">Upload Successful!</h3>
                              <p className="text-white/60 text-xs">Click Next to continue to branding</p>
                            </>
                          ) : (
                            <>
                              <Upload className="w-12 h-12 mx-auto mb-4 text-white/40" />
                              <h3 className="text-sm mb-2">Drop your photos here</h3>
                              <p className="text-white/60 text-xs mb-5">
                                or click to browse • JPG, PNG, WebP, MP4
                              </p>
                              <div className="inline-block px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-lg hover:shadow-lg transition-all text-sm">
                                Browse Files
                              </div>
                            </>
                          )}
                        </label>
                      </div>
                    ) : (
                      // Photos Uploaded - Grid Showcase
                      <div className="mb-6">
                        {/* Header with instructions */}
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm text-white/80">Upload photos in the order they should appear in your video</h3>
                          <button
                            onClick={() => setUploadedPhotos([])}
                            className="text-xs text-white/60 hover:text-white transition-all"
                          >
                            Clear all
                          </button>
                        </div>

                        {/* Photo Grid - 5 columns with scroll */}
                        <div className="grid grid-cols-5 gap-2 mb-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {uploadedPhotos.map((photo, index) => (
                            <motion.div
                              key={photo.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/html', index.toString());
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
                                const dropIndex = index;
                                
                                if (dragIndex !== dropIndex) {
                                  const newPhotos = [...uploadedPhotos];
                                  const [removed] = newPhotos.splice(dragIndex, 1);
                                  newPhotos.splice(dropIndex, 0, removed);
                                  setUploadedPhotos(newPhotos);
                                }
                              }}
                              className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-amber-400/30 transition-all group bg-white/5 cursor-move"
                            >
                              {/* Order number badge */}
                              <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-amber-500/90 backdrop-blur-md rounded-md flex items-center justify-center z-10 border border-white/20">
                                <span className="text-[10px] font-semibold text-white">{index + 1}</span>
                              </div>
                              
                              {/* Drag handle indicator */}
                              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all">
                                <GripVertical className="w-4 h-4 text-white/80" />
                              </div>
                              
                              <img
                                src={photo.url}
                                alt={photo.name}
                                className="w-full h-full object-cover"
                              />
                              {/* Overlay on hover */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                              {/* Delete button */}
                              <button
                                onClick={() => removePhoto(photo.id)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500/80 hover:bg-red-500 backdrop-blur-md rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/20"
                              >
                                <X className="w-3.5 h-3.5 text-white" />
                              </button>
                              {/* File info on hover */}
                              <div className="absolute bottom-0 left-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                <p className="text-[10px] text-white truncate">{photo.name}</p>
                                <p className="text-[9px] text-white/60">{photo.size}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Add More Button */}
                        <label className="block">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileInput}
                            className="hidden"
                          />
                          <div className="w-full py-3 border-2 border-dashed border-white/10 hover:border-amber-400/30 rounded-lg text-center transition-all cursor-pointer hover:bg-white/5">
                            <span className="text-sm text-white/60">+ Add more photos</span>
                          </div>
                        </label>
                      </div>
                    )}
                  </>
                )}

                {/* Tips - Compact */}
                <div className="flex flex-wrap gap-4 text-xs text-white/50">
                  <span>• Max 16MB per file</span>
                  <span>• 8000x8000px</span>
                  <span>• JPG, PNG, WebP, MP4</span>
                </div>
              </>
            )}

            {/* Step 1: Add Branding */}
            {currentStep === 1 && (
              <>
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl mb-2">Add Branding</h2>
                    <p className="text-white/60 text-sm">
                      Upload your logo
                    </p>
                  </div>
                  {/* Toggle Switch */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/70">Add logo to video</span>
                    <button
                      onClick={() => setShowLogoOnVideo(!showLogoOnVideo)}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        showLogoOnVideo ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-white/10'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                          showLogoOnVideo ? 'bg-white right-0.5 shadow-lg' : 'bg-white/60 left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Conditional Content - Only show when toggle is ON */}
                {showLogoOnVideo && (
                  <>
                    {/* Upload New Logo Button */}
                    <div className="mb-6">
                      <label className="block cursor-pointer">
                        <input
                          ref={logoFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={isUploadingLogo}
                          className="hidden"
                        />
                        <div className={`w-full py-3 backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/30 transition-all text-white rounded-lg text-center flex items-center justify-center gap-2 ${isUploadingLogo ? 'opacity-60 cursor-not-allowed' : ''}`}>
                          {isUploadingLogo ? (
                            <>
                              <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                              <span className="text-sm">Uploading Logo...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span className="text-sm">Upload Your Logo</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>

                    {/* Previously Uploaded Logos */}
                    {previousLogos.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-xs mb-2 text-white/70">Previously Uploaded</h3>
                        <div className="grid grid-cols-4 gap-2">
                          {previousLogos.map((logo) => (
                            <motion.button
                              key={logo.id}
                              onClick={() => {
                                setUploadedLogo(logo.url);
                                setSelectedLogo(null);
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`relative p-2 rounded-lg border transition-all ${
                                uploadedLogo === logo.url
                                  ? 'border-amber-400/30 bg-white/10 shadow-lg'
                                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                              }`}
                            >
                              <div className="w-full aspect-square rounded bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
                                <img src={logo.url} alt="Previous logo" className="w-full h-full object-contain" />
                              </div>
                              
                              {/* Check Mark */}
                              {uploadedLogo === logo.url && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-black" />
                                </motion.div>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Skip Message */}
                <p className="text-xs text-white/50 text-center">
                  You can skip this step if you don&apos;t need branding
                </p>
              </>
            )}

            {/* Step 2: Add Music */}
            {currentStep === 2 && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl mb-2">Add Music</h2>
                  <p className="text-white/60 text-sm">
                    Choose background music for your video
                  </p>
                </div>

                {/* Music Filter */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {musicFilters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setMusicFilter(filter)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm ${
                        musicFilter === filter
                          ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-black'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Music Library */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {filteredMusic.map((song) => (
                    <motion.button
                      key={song.id}
                      onClick={() => setSelectedMusic(song.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-lg border transition-all ${
                        selectedMusic === song.id
                          ? 'border-amber-400/30 bg-white/10 shadow-lg'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-full aspect-square rounded bg-white/10 mb-3 flex items-center justify-center">
                        <div className={`w-12 h-12 rounded-full ${song.color} flex items-center justify-center`}>
                          <Music className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h4 className="text-sm font-medium text-white mb-1">{song.name}</h4>
                      <p className="text-xs text-white/60">{song.category}</p>
                      
                      {/* Check Mark */}
                      {selectedMusic === song.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <CheckCircle2 className="w-4 h-4 text-black" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Skip Message */}
                <p className="text-xs text-white/50 text-center">
                  You can skip this step if you don&apos;t need background music
                </p>
              </>
            )}

            {/* Step 3: Add Address */}
            {currentStep === 3 && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl mb-2">Add Address</h2>
                  <p className="text-white/60 text-sm">
                    Add property location information
                  </p>
                </div>

                {/* Address Input */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={addressQuery}
                      onChange={(e) => setAddressQuery(e.target.value)}
                      onFocus={() => setShowAddressSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                      placeholder="Enter property address..."
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all text-white placeholder:text-white/30"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  </div>

                  {/* Address Suggestions */}
                  {showAddressSuggestions && filteredAddresses.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredAddresses.map((address) => (
                        <button
                          key={address.id}
                          onClick={() => {
                            setAddressQuery(`${address.address}, ${address.city}, ${address.state}`);
                            setShowAddressSuggestions(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-white/10 transition-all border-b border-white/5 last:border-b-0"
                        >
                          <div className="text-sm text-white">{address.address}</div>
                          <div className="text-xs text-white/60">{address.city}, {address.state}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interactive Map */}
                <div className="mb-6">
                  <div className="w-full h-64 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-white/40 mx-auto mb-2" />
                      <p className="text-sm text-white/60">Interactive map would appear here</p>
                    </div>
                  </div>
                </div>

                {/* Skip Message */}
                <p className="text-xs text-white/50 text-center">
                  You can skip this step if you don&apos;t need location information
                </p>
              </>
            )}

            {/* Step 4: Project Summary */}
            {currentStep === 4 && (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl mb-2">Project Summary</h2>
                  <p className="text-white/60 text-sm">
                    Review your project before creating
                  </p>
                </div>

                {/* Summary Cards */}
                <div className="space-y-4 mb-6">
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                          <Upload className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">Photos</h4>
                          <p className="text-xs text-white/60">{uploadedPhotos.length} files uploaded</p>
                        </div>
                      </div>
                      <span className="text-sm text-white/80">{currentVideoSeconds}s video</span>
                    </div>
                  </div>

                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Image className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">Branding</h4>
                          <p className="text-xs text-white/60">{showLogoOnVideo ? 'Logo added' : 'No logo'}</p>
                        </div>
                      </div>
                      {showLogoOnVideo && <span className="text-sm text-white/80">✓</span>}
                    </div>
                  </div>

                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Music className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">Music</h4>
                          <p className="text-xs text-white/60">{selectedMusic ? 'Music selected' : 'No music'}</p>
                        </div>
                      </div>
                      {selectedMusic && <span className="text-sm text-white/80">✓</span>}
                    </div>
                  </div>

                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">Location</h4>
                          <p className="text-xs text-white/60">{addressQuery ? 'Address added' : 'No address'}</p>
                        </div>
                      </div>
                      {addressQuery && <span className="text-sm text-white/80">✓</span>}
                    </div>
                  </div>
                </div>

                {/* Pricing Info */}
                <div className="backdrop-blur-md bg-gradient-to-r from-amber-400/10 to-orange-400/10 border border-amber-400/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-amber-400">Estimated Cost</h4>
                      <p className="text-xs text-white/60">
                        {isFullyFree ? 'Free with credits' : `${paidSeconds} paid seconds`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-400">
                        {isFullyFree ? 'FREE' : `$${(paidSeconds * 0.15).toFixed(2)}`}
                      </div>
                      <p className="text-xs text-white/60">
                        ${isFullyFree ? '0.00' : (paidSeconds * 0.15).toFixed(2)} total
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-6 py-3 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (currentStep === steps.length - 1) {
                    handleCreateVideo();
                  } else {
                    setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
                  }
                }}
                disabled={currentStep === 0 && !hasUploadedFiles && uploadedPhotos.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm ml-auto disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-2"
              >
                {isCreatingVideo ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Creating Video...
                  </>
                ) : currentStep === steps.length - 1 ? 'Create Video' : 'Next →'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Creation Success Overlay */}
      {videoCreated && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-amber-400 to-orange-400 p-1 rounded-2xl max-w-md mx-4">
            <div className="bg-[#1a1410] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Video Created Successfully!</h3>
              <p className="text-white/70 mb-6">
                Your amazing video has been created and is ready to download.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setVideoCreated(false)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                >
                  View Projects
                </button>
                <button
                  onClick={() => setVideoCreated(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-black rounded-lg hover:shadow-lg transition-all"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Infinity, Plus, FolderOpen, Image, CreditCard, User, ChevronDown, Search, RefreshCw, Trash2, Home, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { AIImageEditorPage } from "./AIImageEditorPage";
import { SubscriptionPage } from "./SubscriptionPage";
import { TopUpPage } from "./TopUpPage";
import { DashboardHeader } from "./DashboardHeader";

interface ProjectsPageProps {
  onLogout: () => void;
  onNavigateToCreate: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToPlans?: () => void;
  onNavigateToReferral?: () => void;
  onProjectSelect?: (project: Project) => void;
}

interface Project {
  id: string;
  title: string;
  status: 'in-progress' | 'generating' | 'unpaid' | 'completed';
  thumbnail?: string;
  createdAt: string;
  videoUrl?: string;
  description?: string;
  location?: string;
  rating?: number;
}

export function ProjectsPage({ onLogout, onNavigateToCreate, onNavigateToProfile, onNavigateToSettings, onNavigateToPlans, onNavigateToReferral, onProjectSelect }: ProjectsPageProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showSubscriptionPage, setShowSubscriptionPage] = useState(false);
  const [showTopUpPage, setShowTopUpPage] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
    setIsUserMenuOpen(false);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'New Market',
      status: 'in-progress',
      createdAt: '1 minute ago',
      location: 'New Market, MD',
      description: 'Modern commercial property in the heart of New Market.',
      rating: 4.8,
    },
    {
      id: '2',
      title: '1994 Delkalb Avenue',
      status: 'completed',
      thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
      createdAt: '21 Days ago',
      location: 'Brooklyn, NY',
      description: 'A stunning real estate showcase video featuring this beautiful property with professional cinematography and smooth transitions.',
      rating: 5.0,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    {
      id: '3',
      title: 'Sunset Boulevard Villa',
      status: 'completed',
      thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
      createdAt: '5 Days ago',
      location: 'Los Angeles, CA',
      description: 'Luxurious villa with stunning sunset views.',
      rating: 4.9,
    },
    {
      id: '4',
      title: 'Downtown Loft',
      status: 'generating',
      thumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      createdAt: '2 hours ago',
      location: 'Chicago, IL',
      description: 'Modern loft in the heart of downtown.',
      rating: 4.7,
    },
    {
      id: '5',
      title: 'Beach House Miami',
      status: 'unpaid',
      thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
      createdAt: '10 Days ago',
      location: 'Miami, FL',
      description: 'Oceanfront property with private beach access.',
      rating: 5.0,
    },
  ]);

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  // Filter projects based on active filters
  const filteredProjects = projects.filter(project => {
    // Tab filter
    let tabMatch = true;
    if (activeFilter === 'In Progress') {
      tabMatch = project.status === 'in-progress';
    } else if (activeFilter === 'Generating Clips') {
      tabMatch = project.status === 'generating';
    } else if (activeFilter === 'Unpaid') {
      tabMatch = project.status === 'unpaid';
    } else if (activeFilter === 'Completed') {
      tabMatch = project.status === 'completed';
    }

    // Status dropdown filter
    let statusMatch = true;
    if (statusFilter !== 'All Status') {
      if (statusFilter === 'In Progress') {
        statusMatch = project.status === 'in-progress';
      } else if (statusFilter === 'Completed') {
        statusMatch = project.status === 'completed';
      } else if (statusFilter === 'Unpaid') {
        statusMatch = project.status === 'unpaid';
      } else if (statusFilter === 'Generating') {
        statusMatch = project.status === 'generating';
      }
    }

    // Search filter
    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      searchMatch = 
        project.title.toLowerCase().includes(query) ||
        project.location?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) || false;
    }

    return tabMatch && statusMatch && searchMatch;
  });

  // Calculate counts for tabs
  const getTabCount = (filterName: string) => {
    if (filterName === 'All') return projects.length;
    if (filterName === 'In Progress') return projects.filter(p => p.status === 'in-progress').length;
    if (filterName === 'Generating Clips') return projects.filter(p => p.status === 'generating').length;
    if (filterName === 'Unpaid') return projects.filter(p => p.status === 'unpaid').length;
    if (filterName === 'Completed') return projects.filter(p => p.status === 'completed').length;
    return 0;
  };

  const filterTabs = [
    { name: 'All', count: getTabCount('All') },
    { name: 'In Progress', count: getTabCount('In Progress') },
    { name: 'Generating Clips', count: getTabCount('Generating Clips') },
    { name: 'Unpaid', count: getTabCount('Unpaid') },
    { name: 'Completed', count: getTabCount('Completed') },
  ];

  return (
    <div className="min-h-screen bg-[#131519] text-white relative">
      {/* Background Gradients */}
      <div className="fixed blur-3xl filter left-[-352px] rounded-[1.67772e+07px] size-[800px] top-[-400px] pointer-events-none" style={{ backgroundImage: "linear-gradient(135deg, rgba(225, 113, 0, 0.2) 0%, rgba(245, 73, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      <div className="fixed blur-3xl filter left-[1501px] rounded-[1.67772e+07px] size-[800px] top-[580px] pointer-events-none" style={{ backgroundImage: "linear-gradient(-45deg, rgba(208, 135, 0, 0.2) 0%, rgba(225, 113, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      
      {/* Header */}
      <header className="sticky top-0 px-8 py-4 z-50">
        <DashboardHeader
          onLogout={onLogout}
          onNavigateToCreate={onNavigateToCreate}
          onNavigateToProjects={() => {}}
          onNavigateToProfile={onNavigateToProfile}
          onNavigateToSettings={onNavigateToSettings}
          onNavigateToPlans={onNavigateToPlans}
          onNavigateToReferral={onNavigateToReferral}
          activePage="projects"
        />
      </header>

      {/* Main Content */}
      <div className="flex-1 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-3xl mb-2 text-white">Projects</h1>
            <p className="text-white/60">
              Manage all your real estate video projects
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveFilter(tab.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm ${
                  activeFilter === tab.name
                    ? 'bg-white text-black'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <span>{tab.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === tab.name
                    ? 'bg-black/20'
                    : 'bg-white/10'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Controls */}
          <div className="flex items-center gap-3 mb-6">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title or address..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white placeholder:text-white/40 text-sm"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/20 transition-all text-white cursor-pointer text-sm"
              >
                <option value="All Status">All Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Unpaid">Unpaid</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
            </div>
          </div>

          {/* Projects Count & Refresh */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-white/60 text-sm">Showing {filteredProjects.length} projects</p>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/80 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-lg hover:bg-white/10">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Projects Grid */}
          <div className="grid lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-white/5 flex items-center justify-center">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Home className="w-6 h-6 text-white/40" />
                      </div>
                      <p className="text-xs text-white/60">New Market</p>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base">{project.title}</h3>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          project.status === 'completed'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {project.status === 'completed' ? 'Completed' : 'In progress'}
                      </span>
                      <button 
                        onClick={() => setDeleteConfirm(project.id)}
                        className="p-1 hover:bg-red-500/20 rounded transition-all group"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white/40 group-hover:text-red-400" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-white/60 mb-3">{project.createdAt}</p>

                  {project.status === 'completed' && (
                    <button 
                      onClick={() => {
                        if (onProjectSelect) onProjectSelect(project);
                      }}
                      className="w-full py-2.5 bg-white border border-white/40 hover:bg-white/90 transition-all text-black rounded-lg text-sm"
                    >
                      👁 View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-md p-6 max-w-md w-full">
            <h3 className="text-xl mb-3">Delete Project?</h3>
            <p className="text-white/80 text-sm mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-md transition-all text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Image Editor Page */}
      {showImageEditor && (
        <AIImageEditorPage 
          onClose={() => setShowImageEditor(false)}
          onNavigateToCreate={onNavigateToCreate}
          onNavigateToProjects={() => setShowImageEditor(false)}
          onNavigateToSubscription={() => {
            setShowImageEditor(false);
            setShowSubscriptionPage(true);
          }}
          onLogout={onLogout}
        />
      )}

      {/* Subscription Page */}
      {showSubscriptionPage && (
        <SubscriptionPage 
          onClose={() => setShowSubscriptionPage(false)}
          onNavigateToCreate={onNavigateToCreate}
          onNavigateToProjects={() => setShowSubscriptionPage(false)}
          onNavigateToImageEdit={() => {
            setShowSubscriptionPage(false);
            setShowImageEditor(true);
          }}
          onLogout={onLogout}
        />
      )}

      {/* Top Up Page */}
      {showTopUpPage && (
        <TopUpPage 
          onClose={() => setShowTopUpPage(false)}
        />
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-md p-6 max-w-md w-full">
            <h3 className="text-xl mb-3">Logout?</h3>
            <p className="text-white/80 text-sm mb-6">
              Are you sure you want to logout? This action will end your session.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 py-2.5 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-md transition-all text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
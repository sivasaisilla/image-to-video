import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Infinity, Plus, FolderOpen, Image, CreditCard, User, ChevronDown, Search, RefreshCw, Trash2, Home, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { AIImageEditorPage } from "../editors";
import { SubscriptionPage, TopUpPage } from ".";
import { DashboardHeader } from "../layout";
import { authService, projectService, Project } from "../../services/firebase";

export function ProjectsPage() {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showSubscriptionPage, setShowSubscriptionPage] = useState(false);
  const [showTopUpPage, setShowTopUpPage] = useState(false);

  // Real data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user projects using Firebase SDK
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      setError('No authenticated user found');
      setLoading(false);
      return;
    }

    // Set up realtime listener for projects
    const unsubscribe = projectService.onUserProjectsChange(currentUser.uid, (projectsList) => {
      setProjects(projectsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteProject = async (id: string) => {
    try {
      const result = await projectService.delete(id);
      if (!result.success) {
        setError(result.error || 'Failed to delete project');
      }
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutDialog(false);
    await authService.signOut();
    navigate("/");
  };

  // Filter projects based on active filters
  const filteredProjects = projects.filter(project => {
    // Tab filter
    let tabMatch = true;
    if (activeFilter === 'In Progress') {
      tabMatch = project.status === 'draft' || project.status === 'generating';
    } else if (activeFilter === 'Generating Clips') {
      tabMatch = project.status === 'generating';
    } else if (activeFilter === 'Completed') {
      tabMatch = project.status === 'completed';
    } else if (activeFilter === 'Failed') {
      tabMatch = project.status === 'failed';
    }

    // Status dropdown filter
    let statusMatch = true;
    if (statusFilter !== 'All Status') {
      if (statusFilter === 'In Progress') {
        statusMatch = project.status === 'draft' || project.status === 'generating';
      } else if (statusFilter === 'Completed') {
        statusMatch = project.status === 'completed';
      } else if (statusFilter === 'Failed') {
        statusMatch = project.status === 'failed';
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
        project.address?.text?.toLowerCase().includes(query) || false;
    }

    return tabMatch && statusMatch && searchMatch;
  });

  // Calculate counts for tabs
  const getTabCount = (filterName: string) => {
    if (filterName === 'All') return projects.length;
    if (filterName === 'In Progress') return projects.filter(p => p.status === 'draft' || p.status === 'generating').length;
    if (filterName === 'Generating Clips') return projects.filter(p => p.status === 'generating').length;
    if (filterName === 'Completed') return projects.filter(p => p.status === 'completed').length;
    if (filterName === 'Failed') return projects.filter(p => p.status === 'failed').length;
    return 0;
  };

  const filterTabs = [
    { name: 'All', count: getTabCount('All') },
    { name: 'In Progress', count: getTabCount('In Progress') },
    { name: 'Generating Clips', count: getTabCount('Generating Clips') },
    { name: 'Completed', count: getTabCount('Completed') },
    { name: 'Failed', count: getTabCount('Failed') },
  ];

  return (
    <div className="min-h-screen bg-[#131519] text-white relative">
      {/* Background Gradients */}
      <div className="fixed blur-3xl filter left-[-352px] rounded-[1.67772e+07px] size-[800px] top-[-400px] pointer-events-none" style={{ backgroundImage: "linear-gradient(135deg, rgba(225, 113, 0, 0.2) 0%, rgba(245, 73, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      <div className="fixed blur-3xl filter left-[1501px] rounded-[1.67772e+07px] size-[800px] top-[580px] pointer-events-none" style={{ backgroundImage: "linear-gradient(-45deg, rgba(208, 135, 0, 0.2) 0%, rgba(225, 113, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)" }} />
      
      {/* Header */}
      <header className="sticky top-0 px-8 py-4 z-50">
        <DashboardHeader
          onLogout={handleLogoutClick}
          onNavigateToCreate={() => navigate("/dashboard")}
          onNavigateToProjects={() => {}}
          onNavigateToProfile={() => navigate("/profile")}
          onNavigateToSettings={() => navigate("/settings")}
          onNavigateToPlans={() => navigate("/plans")}
          onNavigateToReferral={() => navigate("/referral")}
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

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-lg text-white mb-2">No projects yet</h3>
              <p className="text-white/60 text-sm mb-4">
                Upload your first image or video to get started
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-white/90 transition-all text-sm"
              >
                Create First Project
              </button>
            </div>
          )}

          {/* Projects Grid */}
          <div className="grid lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-white/5 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Home className="w-6 h-6 text-white/40" />
                    </div>
                    <p className="text-xs text-white/60">{project.address?.text || 'No address'}</p>
                  </div>
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
                            : project.status === 'failed'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : project.status === 'generating'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {project.status === 'completed' ? 'Completed' :
                         project.status === 'failed' ? 'Failed' :
                         project.status === 'generating' ? 'Generating' : 'Draft'}
                      </span>
                      <button
                        onClick={() => setDeleteConfirm(project.id || null)}
                        className="p-1 hover:bg-red-500/20 rounded transition-all group"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white/40 group-hover:text-red-400" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-white/60 mb-3">
                    {project.createdAt ? project.createdAt.toDate().toLocaleDateString() : 'Unknown date'}
                  </p>

                  {project.status === 'completed' && (
                    <button
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="w-full py-2.5 bg-white border border-white/40 hover:bg-white/90 transition-all text-black rounded-lg text-sm"
                    >
                      View Details
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
          onNavigateToCreate={() => navigate("/dashboard")}
          onNavigateToProjects={() => setShowImageEditor(false)}
          onNavigateToSubscription={() => {
            setShowImageEditor(false);
            setShowSubscriptionPage(true);
          }}
          onLogout={handleLogoutClick}
        />
      )}

      {/* Subscription Page */}
      {showSubscriptionPage && (
        <SubscriptionPage
          onClose={() => setShowSubscriptionPage(false)}
          onNavigateToCreate={() => navigate("/dashboard")}
          onNavigateToProjects={() => setShowSubscriptionPage(false)}
          onNavigateToImageEdit={() => {
            setShowSubscriptionPage(false);
            setShowImageEditor(true);
          }}
          onLogout={handleLogoutClick}
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
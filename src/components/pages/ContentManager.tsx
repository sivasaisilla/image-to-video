import { useState, useEffect } from "react";
import { Upload, File, Image as ImageIcon, Video, Trash2, Search, Filter, Download, Eye } from "lucide-react";
import { motion } from "motion/react";

interface ContentItem {
  id: number;
  title: string;
  description: string;
  content_type: 'video' | 'image';
  file_url: string;
  file_size: number;
  duration?: number;
  format: string;
  status: string;
  created_at: string;
  location_name?: string;
}

interface ContentStats {
  total_content: number;
  video_count: number;
  image_count: number;
  total_duration: number;
  total_size: number;
}

interface ContentManagerProps {
  onBack: () => void;
  userId: number;
}

export function ContentManager({ onBack, userId }: ContentManagerProps) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'image'>('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  // Fetch user content
  useEffect(() => {
    fetchContent();
  }, [filterType]);

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/content/user/${userId}?contentType=${filterType === 'all' ? '' : filterType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      setContent(data.content || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', selectedFile.name);
      formData.append('description', '');

      const response = await fetch(`${API_BASE}/content/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      
      // Reset form and refresh content
      setSelectedFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      await fetchContent();
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (contentId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete content');
      }

      await fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      setError('Failed to delete content');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131519] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131519] text-white">
      {/* Header */}
      <div className="sticky top-0 px-8 py-4 z-50 backdrop-blur-md bg-[#131519]/80 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-white/60 hover:text-white">
              ← Back
            </button>
            <h1 className="text-2xl font-bold">Content Manager</h1>
          </div>
          
          {stats && (
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold">{stats.total_content}</div>
                <div className="text-white/60">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{stats.video_count}</div>
                <div className="text-white/60">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{stats.image_count}</div>
                <div className="text-white/60">Images</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{formatFileSize(stats.total_size)}</div>
                <div className="text-white/60">Size</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <div className="px-8 py-6 border-b border-white/10">
        <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-6">
          <h2 className="text-xl font-semibold mb-4">Upload New Content</h2>
          
          <div className="flex items-center gap-4">
            <input
              id="file-input"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <label
              htmlFor="file-input"
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white/90 rounded-md cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4" />
              Choose File
            </label>
            
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm">
                <File className="w-4 h-4" />
                <span>{selectedFile.name}</span>
                <span className="text-white/60">({formatFileSize(selectedFile.size)})</span>
              </div>
            )}
            
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 rounded-md transition-all"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 text-red-400 text-sm">{error}</div>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'video' | 'image')}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40"
            >
              <option value="all">All</option>
              <option value="video">Videos</option>
              <option value="image">Images</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="px-8 py-6">
        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white/60 mb-4">
              {searchTerm ? 'No content found matching your search.' : 'No content uploaded yet.'}
            </div>
            {!searchTerm && (
              <p className="text-white/40">Upload your first image or video to get started.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContent.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md overflow-hidden"
              >
                {/* Preview */}
                <div className="aspect-video bg-black/20 flex items-center justify-center">
                  {item.content_type === 'video' ? (
                    <Video className="w-12 h-12 text-white/40" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-white/40" />
                  )}
                </div>
                
                {/* Content Info */}
                <div className="p-4">
                  <h3 className="font-semibold truncate mb-2">{item.title}</h3>
                  <p className="text-sm text-white/60 mb-3 line-clamp-2">{item.description || 'No description'}</p>
                  
                  <div className="flex items-center justify-between text-xs text-white/40 mb-3">
                    <span>{item.content_type}</span>
                    <span>{formatFileSize(item.file_size)}</span>
                  </div>
                  
                  {item.duration && (
                    <div className="text-xs text-white/40 mb-3">
                      Duration: {formatDuration(item.duration)}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-all">
                      <Eye className="w-3 h-3 inline mr-1" />
                      View
                    </button>
                    <button className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-all">
                      <Download className="w-3 h-3 inline mr-1" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-xs transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

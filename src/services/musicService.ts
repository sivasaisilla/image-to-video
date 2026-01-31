import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Song {
  id?: string;
  name: string;
  category: string;
  duration: number; // in seconds
  audioUrl?: string; // URL to audio file for preview
  color: string; // Tailwind color for UI
  createdAt?: any;
}

// Default music library - used for seeding
export const DEFAULT_MUSIC_LIBRARY: Song[] = [
  { id: 'song1', name: 'Peaceful Morning', category: 'Beautiful ambient', duration: 60, color: 'bg-blue-500' },
  { id: 'song2', name: 'Urban Dreams', category: 'Modern hip-hop', duration: 60, color: 'bg-purple-500' },
  { id: 'song3', name: 'Smooth Vibes', category: 'Chill', duration: 60, color: 'bg-green-500' },
  { id: 'song4', name: 'Classical Touch', category: 'Elegant gently', duration: 60, color: 'bg-amber-500' },
  { id: 'song5', name: 'Sunset Boulevard', category: 'Chill', duration: 60, color: 'bg-pink-500' },
  { id: 'song6', name: 'Ocean Breeze', category: 'Beautiful ambient', duration: 60, color: 'bg-cyan-500' },
  { id: 'song7', name: 'Street Rhythm', category: 'Modern hip-hop', duration: 60, color: 'bg-red-500' },
  { id: 'song8', name: 'Piano Elegance', category: 'Elegant gently', duration: 60, color: 'bg-indigo-500' },
  { id: 'song9', name: 'Dreamy Clouds', category: 'Beautiful ambient', duration: 60, color: 'bg-violet-500' },
  { id: 'song10', name: 'Lofi Beats', category: 'Chill', duration: 60, color: 'bg-teal-500' },
  { id: 'song11', name: 'Vocal Harmony', category: 'Vocal music songs', duration: 60, color: 'bg-orange-500' },
  { id: 'song12', name: 'Midnight Echo', category: 'Modern hip-hop', duration: 60, color: 'bg-slate-500' },
  { id: 'song13', name: 'Soft Melody', category: 'Elegant gently', duration: 60, color: 'bg-rose-500' },
  { id: 'song14', name: 'Summer Vibes', category: 'Vocal music songs', duration: 60, color: 'bg-lime-500' },
  { id: 'song15', name: 'Acoustic Soul', category: 'Vocal music songs', duration: 60, color: 'bg-emerald-500' },
];

export const musicService = {
  /**
   * Get all songs from music catalog
   */
  async getAllSongs(): Promise<Song[]> {
    try {
      const q = query(collection(db, 'music_catalog'));
      const docs = await getDocs(q);
      
      if (docs.empty) {
        // Return default library if collection is empty
        return DEFAULT_MUSIC_LIBRARY;
      }
      
      return docs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Song));
    } catch (error) {
      console.error('Error fetching songs:', error);
      return DEFAULT_MUSIC_LIBRARY;
    }
  },

  /**
   * Get songs by category
   */
  async getSongsByCategory(category: string): Promise<Song[]> {
    try {
      const q = query(collection(db, 'music_catalog'), where('category', '==', category));
      const docs = await getDocs(q);
      return docs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Song));
    } catch (error) {
      console.error('Error fetching songs by category:', error);
      return DEFAULT_MUSIC_LIBRARY.filter(song => song.category === category);
    }
  },

  /**
   * Get unique categories from music catalog
   */
  async getCategories(): Promise<string[]> {
    try {
      const songs = await this.getAllSongs();
      const categories = [...new Set(songs.map(song => song.category))];
      return ['All', ...categories.sort()];
    } catch (error) {
      console.error('Error fetching categories:', error);
      const categories = [...new Set(DEFAULT_MUSIC_LIBRARY.map(song => song.category))];
      return ['All', ...categories.sort()];
    }
  },

  /**
   * Get song by ID
   */
  async getSongById(songId: string): Promise<Song | null> {
    try {
      const songs = await this.getAllSongs();
      return songs.find(song => song.id === songId) || null;
    } catch (error) {
      console.error('Error fetching song:', error);
      return null;
    }
  },

  /**
   * Seed music catalog (admin only - called during setup)
   * In production, this would be protected by Cloud Functions
   */
  async seedMusicCatalog(): Promise<void> {
    try {
      const musicRef = collection(db, 'music_catalog');
      
      for (const song of DEFAULT_MUSIC_LIBRARY) {
        const { id, ...songData } = song;
        await addDoc(musicRef, {
          ...songData,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error seeding music catalog:', error);
    }
  }
};

// Export default music filters for UI
export const MUSIC_FILTERS = ["All", "Beautiful ambient", "Chill", "Elegant gently", "Modern hip-hop", "Vocal music songs"];

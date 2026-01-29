import { useState, useEffect } from "react";
import { MapPin, Navigation, Search, Globe, Map, Crosshair, Info } from "lucide-react";
import { motion } from "motion/react";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  locationName: string;
  city: string;
  country: string;
  accuracy?: number;
}

interface LocationManagerProps {
  onBack: () => void;
  userId: number;
}

export function LocationManager({ onBack, userId }: LocationManagerProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [searchResult, setSearchResult] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  // Get current location using browser geolocation
  const getCurrentLocation = async () => {
    setLoading(true);
    setError('');

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Get address from coordinates
          const token = localStorage.getItem('token');
          if (!token) {
            setError('No authentication token found');
            setLoading(false);
            return;
          }

          const response = await fetch(`${API_BASE}/location/reverse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ latitude, longitude })
      });

          if (!response.ok) {
            throw new Error('Failed to get address from coordinates');
          }

          const data = await response.json();
          const locationData: LocationData = {
            latitude,
            longitude,
            address: data.location.address,
            locationName: data.location.location_name,
            city: data.location.components.city || '',
            country: data.location.components.country || '',
            accuracy
          };

          setCurrentLocation(locationData);
          
          // Generate static map URL
          const mapResponse = await fetch(`${API_BASE}/location/static-map`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude, longitude })
          });

          setLoading(false);
        },
        (error) => {
          let errorMessage = 'Unknown error occurred';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'Failed to get location.';
              break;
          }
          setError(errorMessage);
          setLoading(false);
        }
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get location');
      setLoading(false);
    }
  };

  // Search for location by address
  const searchLocation = async () => {
    if (!searchAddress.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/location/geocode`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address: searchAddress })
      });

      if (!response.ok) {
        throw new Error('Failed to find location');
      }

      const data = await response.json();
      const locationData: LocationData = {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        address: data.location.address,
        locationName: data.location.location_name,
        city: '',
        country: ''
      };

      setSearchResult(locationData);
      
      // Generate static map URL
      const mapResponse = await fetch(`${API_BASE}/location/static-map`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ latitude: locationData.latitude, longitude: locationData.longitude })
      });

      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to search location');
      setLoading(false);
    }
  };

  // Format coordinates for display
  const formatCoordinates = (lat: number, lon: number) => {
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  };

  // Get map embed URL
  const getMapEmbed = async (location: LocationData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/location/embed-map`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ latitude: location.latitude, longitude: location.longitude })
      });

      if (response.ok) {
        const data = await response.json();
        setEmbedUrl(data.embedUrl);
      }
    } catch (error) {
      console.error('Error getting map embed:', error);
    }
  };

  // Generate static map URL
  const generateStaticMapUrl = (location: LocationData) => {
    const token = localStorage.getItem('token');
    if (!token) return '';

    return `${API_BASE}/location/static-map`;
  };

  return (
    <div className="min-h-screen bg-[#131519] text-white">
      {/* Header */}
      <div className="sticky top-0 px-8 py-4 z-50 backdrop-blur-md bg-[#131519]/80 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-white/60 hover:text-white">
              ← Back
            </button>
            <h1 className="text-2xl font-bold">Location Manager</h1>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Current Location Section */}
        <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Crosshair className="w-5 h-5" />
            Current Location
          </h2>
          
          <button
            onClick={getCurrentLocation}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 rounded-md transition-all"
          >
            {loading ? 'Getting Location...' : 'Get My Location'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {currentLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-3"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="font-medium">{currentLocation.locationName}</span>
              </div>
              <div className="text-sm text-white/60">
                <p>{currentLocation.address}</p>
                <p className="mt-1">
                  {currentLocation.city && `${currentLocation.city}, `}
                  {currentLocation.country}
                </p>
              </div>
              <div className="text-xs text-white/40">
                <p>Coordinates: {formatCoordinates(currentLocation.latitude, currentLocation.longitude)}</p>
                {currentLocation.accuracy && (
                  <p>Accuracy: ±{currentLocation.accuracy.toFixed(0)} meters</p>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Search Location Section */}
        <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Location
          </h2>
          
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Enter address or location name..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:border-white/40"
            />
            <button
              onClick={searchLocation}
              disabled={loading || !searchAddress.trim()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 rounded-md transition-all"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-3"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="font-medium">{searchResult.locationName}</span>
              </div>
              <div className="text-sm text-white/60">
                <p>{searchResult.address}</p>
                <p className="mt-1">
                  Coordinates: {formatCoordinates(searchResult.latitude, searchResult.longitude)}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Map Display */}
        {(currentLocation || searchResult) && (
          <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Map className="w-5 h-5" />
              Map View
            </h2>
            
            <div className="space-y-4">
              {/* Static Map */}
              <div className="bg-black/20 rounded-md p-4 text-center">
                <p className="text-white/60 mb-2">Static Map Preview</p>
                <div className="w-full h-48 bg-black/40 rounded flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white/40" />
                </div>
                <p className="text-xs text-white/40 mt-2">
                  Map would display here with the location marker
                </p>
              </div>

              {/* Map Embed */}
              <div className="bg-black/20 rounded-md p-4">
                <p className="text-white/60 mb-2">Interactive Map</p>
                <div className="w-full h-64 bg-black/40 rounded flex items-center justify-center">
                  <Globe className="w-8 h-8 text-white/40" />
                </div>
                <p className="text-xs text-white/40 mt-2">
                  Interactive map would be embedded here
                </p>
              </div>

              {/* Location Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/5 rounded p-3">
                  <p className="text-white/60 mb-1">Latitude</p>
                  <p className="font-mono">
                    {(currentLocation || searchResult)?.latitude.toFixed(6)}
                  </p>
                </div>
                <div className="bg-white/5 rounded p-3">
                  <p className="text-white/60 mb-1">Longitude</p>
                  <p className="font-mono">
                    {(currentLocation || searchResult)?.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location Features */}
        <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Location Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">🔍 Geolocation</h3>
              <ul className="text-sm text-white/60 space-y-1">
                <li>• Automatic location detection</li>
                <li>• High accuracy GPS positioning</li>
                <li>• Browser-based geolocation API</li>
                <li>• Permission-based access control</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">🗺️ Map Services</h3>
              <ul className="text-sm text-white/60 space-y-1">
                <li>• Address to coordinates conversion</li>
                <li>• Coordinates to address lookup</li>
                <li>• Static map generation</li>
                <li>• Interactive map embedding</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">📍 Location Data</h3>
              <ul className="text-sm text-white/60 space-y-1">
                <li>• Precise GPS coordinates</li>
                <li>• Full address resolution</li>
                <li>• City and country detection</li>
                <li>• Accuracy measurements</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">🔒 Privacy & Security</h3>
              <ul className="text-sm text-white/60 space-y-1">
                <li>• User consent required</li>
                <li>• Secure API authentication</li>
                <li>• User-isolated location data</li>
                <li>• No tracking without permission</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

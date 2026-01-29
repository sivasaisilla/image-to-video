// Location Service for Geolocation and Map Integration

class LocationService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || null;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  // Get current user location using browser geolocation
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          };
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Unknown error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'User denied the request for Geolocation';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out';
              break;
            default:
              errorMessage = 'An unknown error occurred';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Reverse geocoding to get address from coordinates
  async reverseGeocode(latitude, longitude) {
    if (!this.apiKey) {
      // Fallback to OpenStreetMap Nominatim
      return this.reverseGeocodeOSM(latitude, longitude);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          address: result.formatted_address,
          components: {
            street_number: this.getComponent(result, 'street_number'),
            route: this.getComponent(result, 'route'),
            city: this.getComponent(result, 'locality'),
            state: this.getComponent(result, 'administrative_area_level_1'),
            country: this.getComponent(result, 'country'),
            postal_code: this.getComponent(result, 'postal_code')
          },
          location_name: result.formatted_address.split(',')[0]
        };
      } else {
        throw new Error('No results found');
      }
    } catch (error) {
      console.error('Google Maps geocoding error:', error);
      // Fallback to OpenStreetMap
      return this.reverseGeocodeOSM(latitude, longitude);
    }
  }

  // OpenStreetMap Nominatim reverse geocoding (free alternative)
  async reverseGeocodeOSM(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.display_name || '';
        return {
          address,
          components: {
            street_number: data.address.house_number,
            route: data.address.road,
            city: data.address.city || data.address.town || data.address.village,
            state: data.address.state,
            country: data.address.country,
            postal_code: data.address.postcode
          },
          location_name: data.address.road || data.address.city || 'Unknown Location'
        };
      } else {
        throw new Error('No results found');
      }
    } catch (error) {
      console.error('OpenStreetMap geocoding error:', error);
      throw error;
    }
  }

  // Forward geocoding to get coordinates from address
  async geocodeAddress(address) {
    if (!this.apiKey) {
      return this.geocodeAddressOSM(address);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          address: result.formatted_address,
          location_name: result.formatted_address.split(',')[0]
        };
      } else {
        throw new Error('No results found');
      }
    } catch (error) {
      console.error('Google Maps geocoding error:', error);
      return this.geocodeAddressOSM(address);
    }
  }

  // OpenStreetMap Nominatim forward geocoding
  async geocodeAddressOSM(address) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          address: result.display_name,
          location_name: result.display_name.split(',')[0]
        };
      } else {
        throw new Error('No results found');
      }
    } catch (error) {
      console.error('OpenStreetMap geocoding error:', error);
      throw error;
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Format coordinates for display
  formatCoordinates(latitude, longitude) {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  // Helper method to get address component
  getComponent(result, type) {
    const component = result.address_components.find(comp => 
      comp.types.includes(type)
    );
    return component ? component.long_name : '';
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Validate coordinates
  validateCoordinates(latitude, longitude) {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }

  // Get static map URL (for embedding)
  getStaticMapUrl(latitude, longitude, width = 400, height = 300, zoom = 15) {
    if (this.apiKey) {
      return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${latitude},${longitude}&key=${this.apiKey}`;
    } else {
      // OpenStreetMap static map alternative
      return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&markers=${latitude},${longitude},red`;
    }
  }

  // Get map embed URL
  getMapEmbedUrl(latitude, longitude, zoom = 15) {
    if (this.apiKey) {
      return `https://www.google.com/maps/embed/v1/place?q=${latitude},${longitude}&zoom=${zoom}&key=${this.apiKey}`;
    } else {
      // OpenStreetMap embed
      return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;
    }
  }
}

// Export singleton instance
const locationService = new LocationService();

module.exports = locationService;

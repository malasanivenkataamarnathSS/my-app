import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Navigation, Route } from 'lucide-react';

// Since we can't install Leaflet right away, we'll create a placeholder component
// that shows the structure for when Leaflet is installed

interface Location {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}

interface MapComponentProps {
  center?: Location;
  zoom?: number;
  markers?: Location[];
  onLocationSelect?: (location: Location) => void;
  showSearch?: boolean;
  showRouting?: boolean;
  height?: string;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  center = { lat: 40.7128, lng: -74.0060, name: 'New York' },
  zoom = 13,
  markers = [],
  onLocationSelect,
  showSearch = true,
  showRouting = false,
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  // Initialize map when Leaflet is available
  useEffect(() => {
    if (mapRef.current && !map) {
      // Placeholder for Leaflet initialization
      console.log('Map would be initialized here with Leaflet');
      
      // Simulate map object
      const mockMap = {
        id: 'map-instance',
        center,
        zoom,
        addMarker: (location: Location) => console.log('Add marker:', location),
        removeMarker: (location: Location) => console.log('Remove marker:', location),
        setView: (location: Location, zoom: number) => console.log('Set view:', location, zoom),
        on: (event: string, callback: Function) => console.log('Event listener:', event)
      };
      
      setMap(mockMap);
    }
  }, [mapRef, map, center, zoom]);

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'Your Location'
          };
          setUserLocation(location);
          setSelectedLocation(location);
          onLocationSelect?.(location);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  // Search for locations (placeholder implementation)
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // Placeholder for geocoding API call
      // In real implementation, this would use a service like Nominatim or Google Geocoding
      const mockResults: Location[] = [
        {
          lat: 40.7589,
          lng: -73.9851,
          name: 'Times Square',
          address: 'Times Square, New York, NY'
        },
        {
          lat: 40.7614,
          lng: -73.9776,
          name: 'Bryant Park',
          address: 'Bryant Park, New York, NY'
        }
      ].filter(result => 
        result.name?.toLowerCase().includes(query.toLowerCase()) ||
        result.address?.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
  };

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setSearchQuery('');
    setSearchResults([]);
    onLocationSelect?.(location);
    
    if (map) {
      map.setView(location, 15);
    }
  };

  const calculateRoute = async (from: Location, to: Location) => {
    if (!showRouting) return;

    try {
      // Placeholder for routing API call
      console.log('Calculate route from', from, 'to', to);
      // In real implementation, this would use a routing service like OSRM or GraphHopper
    } catch (error) {
      console.error('Route calculation failed:', error);
    }
  };

  return (
    <div className="relative bg-white rounded-lg border overflow-hidden">
      {/* Search Bar */}
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location..."
              className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(result)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{result.name}</div>
                        {result.address && (
                          <div className="text-sm text-gray-600">{result.address}</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button
          onClick={getUserLocation}
          className="p-3 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Get my location"
        >
          <Navigation className="w-5 h-5 text-gray-600" />
        </button>
        
        {showRouting && selectedLocation && userLocation && (
          <button
            onClick={() => calculateRoute(userLocation, selectedLocation)}
            className="p-3 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Get directions"
          >
            <Route className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ height }} 
        className="w-full bg-gray-100 flex items-center justify-center"
      >
        {/* Placeholder for Leaflet Map */}
        <div className="text-center text-gray-500">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Interactive Map</h3>
          <p className="text-sm">
            Map component ready for Leaflet integration
          </p>
          {selectedLocation && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">{selectedLocation.name}</p>
              {selectedLocation.address && (
                <p className="text-sm text-blue-700">{selectedLocation.address}</p>
              )}
              <p className="text-xs text-blue-600 mt-1">
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Location Info */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{selectedLocation.name}</h4>
              {selectedLocation.address && (
                <p className="text-sm text-gray-600 mt-1">{selectedLocation.address}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Delivery Zone Map Component
export const DeliveryZoneMap: React.FC<{
  deliveryZones: Array<{
    id: string;
    name: string;
    coordinates: Location[];
    deliveryFee: number;
    estimatedTime: string;
  }>;
}> = ({ deliveryZones }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Delivery Zones</h3>
      
      <MapComponent
        center={{ lat: 40.7128, lng: -74.0060 }}
        height="300px"
        showSearch={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deliveryZones.map((zone) => (
          <div key={zone.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900">{zone.name}</h4>
            <div className="mt-2 text-sm text-gray-600">
              <p>Delivery Fee: ${zone.deliveryFee}</p>
              <p>Estimated Time: {zone.estimatedTime}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
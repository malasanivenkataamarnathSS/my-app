import React from 'react';
import { MapComponent, DeliveryZoneMap } from '../components/maps/MapComponent';

const sampleDeliveryZones = [
  {
    id: '1',
    name: 'Downtown',
    coordinates: [],
    deliveryFee: 2.99,
    estimatedTime: '20-30 mins'
  },
  {
    id: '2',
    name: 'Uptown',
    coordinates: [],
    deliveryFee: 4.99,
    estimatedTime: '30-45 mins'
  },
  {
    id: '3',
    name: 'Suburbs',
    coordinates: [],
    deliveryFee: 6.99,
    estimatedTime: '45-60 mins'
  }
];

export const Maps: React.FC = () => {
  const handleLocationSelect = (location: any) => {
    console.log('Selected location:', location);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Location & Delivery
            </h1>
            <p className="text-lg text-gray-600">
              Find locations, check delivery zones, and plan your routes
            </p>
          </div>

          {/* Main Map */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Interactive Map
            </h2>
            <MapComponent
              height="500px"
              showSearch={true}
              showRouting={true}
              onLocationSelect={handleLocationSelect}
            />
          </div>

          {/* Delivery Zones */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <DeliveryZoneMap deliveryZones={sampleDeliveryZones} />
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                🔍
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Location Search</h3>
              <p className="text-gray-600 text-sm">
                Search for addresses, landmarks, and points of interest
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                🚚
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Delivery Zones</h3>
              <p className="text-gray-600 text-sm">
                Check delivery availability and fees for your area
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                🗺️
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Route Planning</h3>
              <p className="text-gray-600 text-sm">
                Get directions and optimize delivery routes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
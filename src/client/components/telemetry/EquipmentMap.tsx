'use client';

import { MapPin } from 'lucide-react';

interface EquipmentLocation {
  equipmentId: string;
  equipmentName: string;
  latitude: number;
  longitude: number;
}

interface EquipmentMapProps {
  equipment: EquipmentLocation[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

export default function EquipmentMap({ equipment, center, zoom }: EquipmentMapProps) {
  return (
    <div className="w-full h-full min-h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Equipment Map</p>
        <p className="text-sm text-gray-400 mt-1">
          {equipment.length} equipment locations
        </p>
        <div className="mt-4 text-xs text-gray-400">
          {equipment.map((eq) => (
            <p key={eq.equipmentId}>
              {eq.equipmentName}: {eq.latitude.toFixed(4)}, {eq.longitude.toFixed(4)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

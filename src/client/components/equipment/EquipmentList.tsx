'use client';

import { Equipment } from '@/types/equipment.types';
import EquipmentCard from './EquipmentCard';

interface EquipmentListProps {
  equipment: Equipment[];
}

export default function EquipmentList({ equipment }: EquipmentListProps) {
  if (equipment.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No equipment found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {equipment.map((item) => (
        <EquipmentCard key={item.id} equipment={item} />
      ))}
    </div>
  );
}

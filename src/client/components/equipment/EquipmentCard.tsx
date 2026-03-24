'use client';

import Link from 'next/link';
import { HardHat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Equipment } from '@/types/equipment.types';
import { EQUIPMENT_STATUS_COLORS } from '@/lib/constants';

interface EquipmentCardProps {
  equipment: Equipment;
}

export default function EquipmentCard({ equipment }: EquipmentCardProps) {
  return (
    <Link href={`/equipment/${equipment.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <HardHat className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">{equipment.name}</CardTitle>
                <p className="text-sm text-gray-500">{equipment.assetNumber}</p>
              </div>
            </div>
            <Badge className={EQUIPMENT_STATUS_COLORS[equipment.status]}>
              {equipment.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Type</p>
              <p className="font-medium">{equipment.equipmentType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-gray-500">Hours</p>
              <p className="font-medium">{equipment.totalHours.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Manufacturer</p>
              <p className="font-medium truncate">{equipment.manufacturer}</p>
            </div>
            <div>
              <p className="text-gray-500">Model</p>
              <p className="font-medium truncate">{equipment.model}</p>
            </div>
          </div>
          {equipment.nextServiceDue && (
            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
              Next Service: {new Date(equipment.nextServiceDue).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

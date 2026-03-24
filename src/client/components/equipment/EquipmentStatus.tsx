'use client';

import { Badge } from '@/components/ui/badge';
import { EquipmentStatus } from '@/types/equipment.types';
import { EQUIPMENT_STATUS_COLORS } from '@/lib/constants';

interface EquipmentStatusProps {
  status: EquipmentStatus;
}

export default function EquipmentStatus({ status }: EquipmentStatusProps) {
  return (
    <Badge className={EQUIPMENT_STATUS_COLORS[status]}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

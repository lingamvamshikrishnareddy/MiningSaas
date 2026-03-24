'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { equipmentApi } from '@/lib/api';
import { useCreateMaintenance, useUpdateMaintenance } from '@/hooks/useMaintenance';
import type { MaintenanceRecord } from '@/types/maintenance.types';
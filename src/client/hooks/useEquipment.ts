import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentApi } from '../lib/api';
import { EquipmentFilters } from '../types/equipment.types';

export function useEquipment(filters?: EquipmentFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['equipment', filters],
    queryFn: () => equipmentApi.getAll(filters).then((r) => r.data),
    staleTime: 30 * 1000,
  });
}

export function useEquipmentById(id: string) {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useFleetOverview() {
  return useQuery({
    queryKey: ['equipment', 'fleet-overview'],
    queryFn: () => equipmentApi.getFleetOverview().then((r) => r.data.data),
    staleTime: 60 * 1000,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: equipmentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

export function useUpdateEquipment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => equipmentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', id] });
    },
  });
}

export function useUpdateEquipmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      equipmentApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: equipmentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

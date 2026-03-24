import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '../lib/api';
import { MaintenanceFilters } from '../types/maintenance.types';

export function useMaintenance(filters?: MaintenanceFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['maintenance', filters],
    queryFn: () => maintenanceApi.getAll(filters).then((r) => r.data),
    staleTime: 30 * 1000,
  });
}

export function useMaintenanceById(id: string) {
  return useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => maintenanceApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useMaintenanceStats() {
  return useQuery({
    queryKey: ['maintenance', 'stats'],
    queryFn: () => maintenanceApi.getStats().then((r) => r.data.data),
    staleTime: 60 * 1000,
  });
}

export function useUpcomingMaintenance(days = 7) {
  return useQuery({
    queryKey: ['maintenance', 'upcoming', days],
    queryFn: () => maintenanceApi.getUpcoming(days).then((r) => r.data.data),
    staleTime: 60 * 1000,
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
}

export function useCompleteMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      maintenanceApi.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
}

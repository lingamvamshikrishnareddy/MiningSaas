import { useQuery } from '@tanstack/react-query';
import { telemetryApi } from '../lib/api';

export function useEquipmentTelemetry(equipmentId: string, hours = 24) {
  return useQuery({
    queryKey: ['telemetry', equipmentId, hours],
    queryFn: () => telemetryApi.getByEquipment(equipmentId, { hours }).then((r) => r.data.data),
    enabled: !!equipmentId,
    staleTime: 30 * 1000,
  });
}

export function useLatestTelemetry(equipmentId: string) {
  return useQuery({
    queryKey: ['telemetry', equipmentId, 'latest'],
    queryFn: () => telemetryApi.getLatest(equipmentId).then((r) => r.data.data),
    enabled: !!equipmentId,
    refetchInterval: 30 * 1000,
  });
}

export function useFleetTelemetry(siteId?: string) {
  return useQuery({
    queryKey: ['telemetry', 'fleet', siteId],
    queryFn: () => telemetryApi.getFleetLatest(siteId).then((r) => r.data.data),
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });
}

export function useTelemetryAlerts() {
  return useQuery({
    queryKey: ['telemetry', 'alerts'],
    queryFn: () => telemetryApi.getAlerts().then((r) => r.data.data),
    refetchInterval: 60 * 1000,
  });
}

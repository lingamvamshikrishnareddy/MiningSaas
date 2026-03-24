import { useQuery } from '@tanstack/react-query';
import { sitesApi } from '../lib/api';

export function useSites(params?: any) {
  return useQuery({
    queryKey: ['sites', params],
    queryFn: () => sitesApi.getAll(params).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSiteById(id: string) {
  return useQuery({
    queryKey: ['sites', id],
    queryFn: () => sitesApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

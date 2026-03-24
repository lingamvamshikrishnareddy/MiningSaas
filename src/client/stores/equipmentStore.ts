import { create } from 'zustand';
import { Equipment, EquipmentFilters, FleetOverview } from '../types/equipment.types';

interface EquipmentStore {
  equipment: Equipment[];
  selectedEquipment: Equipment | null;
  fleetOverview: FleetOverview | null;
  filters: EquipmentFilters;
  isLoading: boolean;
  error: string | null;
  setEquipment: (equipment: Equipment[]) => void;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  setFleetOverview: (overview: FleetOverview) => void;
  setFilters: (filters: Partial<EquipmentFilters>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEquipmentStore = create<EquipmentStore>((set) => ({
  equipment: [],
  selectedEquipment: null,
  fleetOverview: null,
  filters: {},
  isLoading: false,
  error: null,
  setEquipment: (equipment) => set({ equipment }),
  setSelectedEquipment: (selectedEquipment) => set({ selectedEquipment }),
  setFleetOverview: (fleetOverview) => set({ fleetOverview }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: {} }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

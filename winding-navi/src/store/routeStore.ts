import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Route, Region, RoadConditionType, RoadReport, MOCK_ROUTES } from '../types/route';

interface RouteState {
  routes: Route[];
  searchQuery: string;
  selectedRegion: Region;
  setSearchQuery: (query: string) => void;
  setSelectedRegion: (region: Region) => void;
  addRoadReport: (routeId: string, message: string, type: RoadConditionType, username: string) => void;
}

export const useRouteStore = create<RouteState>()(
  persist(
    (set) => ({
      routes: MOCK_ROUTES,
      searchQuery: '',
      selectedRegion: '전체',
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedRegion: (region) => set({ selectedRegion: region }),
      
      addRoadReport: (routeId, message, type, username) => set((state) => {
        const newReport: RoadReport = {
          id: `rep_${Date.now()}`,
          message,
          type,
          username,
          timestamp: Date.now(),
          upvotes: 0,
        };

        return {
          routes: state.routes.map(r => {
            if (r.id === routeId) {
              return {
                ...r,
                reports: [newReport, ...r.reports],
                currentCondition: type // Update current condition to latest report
              };
            }
            return r;
          })
        };
      })
    }),
    {
      name: 'winding-route-storage',
    }
  )
);

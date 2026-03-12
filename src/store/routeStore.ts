import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Route, Region, RoadReport, MOCK_ROUTES } from '../types/route';

interface RouteState {
  routes: Route[];
  searchQuery: string;
  selectedRegion: Region;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedRegion: (region: Region) => void;
  addRoadReport: (routeId: string, report: Omit<RoadReport, 'id' | 'username' | 'upvotes'>) => void;
  upvoteReport: (routeId: string, reportId: string) => void;
}

export const useRouteStore = create<RouteState>()(
  persist(
    (set) => ({
      routes: MOCK_ROUTES,
      searchQuery: '',
      selectedRegion: '전체',

      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setSelectedRegion: (region) => set({ selectedRegion: region }),

      addRoadReport: (routeId, report) => set((state) => ({
        routes: state.routes.map(route => {
          if (route.id === routeId) {
            const newReport: RoadReport = {
              ...report,
              id: `rep_${Date.now()}`,
              username: '나(임시)', // MVP placeholder
              upvotes: 0
            };
            return {
              ...route,
              reports: [newReport, ...route.reports],
              // Update current condition if it's worse or newer
              currentCondition: report.type
            };
          }
          return route;
        })
      })),

      upvoteReport: (routeId, reportId) => set((state) => ({
        routes: state.routes.map(route => {
          if (route.id === routeId) {
            return {
              ...route,
              reports: route.reports.map(r => 
                r.id === reportId ? { ...r, upvotes: r.upvotes + 1 } : r
              )
            };
          }
          return route;
        })
      }))
    }),
    {
      name: 'winding-route-storage',
      partialize: (state) => ({ routes: state.routes }), // Persist only routes (which contain reports)
    }
  )
);

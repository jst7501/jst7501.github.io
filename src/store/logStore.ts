import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DriveLog, Badge, BADGES } from '../types/log';
import { Route, MOCK_ROUTES } from '../types/route';

interface LogState {
  logs: DriveLog[];
  unlockedBadges: string[];
  availableBadges: Badge[];
  unlockedBadgeIds: string[];
  totalDistanceKm: number;
  visitedRegions: string[];
  
  // Actions
  addLog: (route: Route) => { isNewBadgeUnlocked: boolean, unlockedBadgeIds: string[] };
  removeLog: (logId: string) => void;
  
  // Computed (handled via getters or derived in components)
  // For simplicity we will compute these in components or via helper hooks:
  // - totalDistance
  // - visitedRegions
  // - completedCourses
}

// Helper to calculate unlocking logic
const checkBadges = (logs: DriveLog[], routes: Route[]): string[] => {
  const unlocked = new Set<string>();
  
  if (logs.length >= 1) unlocked.add('first_drive');
  if (logs.length >= 5) unlocked.add('5_courses');
  if (logs.length >= 10) unlocked.add('10_courses');
  
  let totalKm = 0;
  const regions = new Set<string>();
  let hasMountain = false;
  let hasCoast = false;

  logs.forEach(log => {
    const route = routes.find(r => r.id === log.routeId);
    if (!route) return;
    
    totalKm += route.distanceKm;
    regions.add(route.region);
    if (route.difficulty === '상') hasMountain = true;
    if (route.tags.includes('해안')) hasCoast = true; // Assuming "해안" is a tag in real data
  });

  if (totalKm >= 100) unlocked.add('100km');
  if (totalKm >= 500) unlocked.add('500km');
  if (hasMountain) unlocked.add('mountain');
  if (hasCoast) unlocked.add('coast');
  if (regions.size >= 3) unlocked.add('3_regions');
  if (regions.size >= 10) unlocked.add('all_regions');

  return Array.from(unlocked);
};

export const useLogStore = create<LogState>()(
  persist(
    (set, get) => ({
      logs: [],
      unlockedBadges: [],
      availableBadges: BADGES,
      unlockedBadgeIds: [],
      totalDistanceKm: 0,
      visitedRegions: [],
      
      addLog: (route) => {
        const state = get();
        // Prevent duplicate route logging for MVP simplicity, or just allow multiple.
        // Let's allow multiple but count unique for badges.
        const newLog: DriveLog = {
          id: `log_${Date.now()}`,
          routeId: route.id,
          date: Date.now(),
        };
        
        const newLogs = [newLog, ...state.logs];
        const newUnlockedBadges = checkBadges(newLogs, MOCK_ROUTES);
        
        // Find newly unlocked badges
        const newlyUnlocked = newUnlockedBadges.filter(b => !state.unlockedBadges.includes(b));
        
        set({ logs: newLogs, unlockedBadges: newUnlockedBadges });
        
        return {
          isNewBadgeUnlocked: newlyUnlocked.length > 0,
          unlockedBadgeIds: newlyUnlocked
        };
      },
      
      removeLog: (logId) => set((state) => {
        const newLogs = state.logs.filter(l => l.id !== logId);
        return { logs: newLogs, unlockedBadges: checkBadges(newLogs, MOCK_ROUTES) };
      }),
    }),
    {
      name: 'winding-log-storage',
    }
  )
);

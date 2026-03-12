import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, CarProfile } from '../types/user';

interface UserState {
  nickname: string;
  carModel: string;
  experienceYears: number;
  favorites: string[];
  setNickname: (name: string) => void;
  setCarModel: (car: string) => void;
  toggleFavorite: (routeId: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      nickname: '차쟁이1',
      carModel: '벨로스터 N',
      experienceYears: 3,
      favorites: ['r2'],
      
      setNickname: (name) => set({ nickname: name }),
      
      setCarModel: (car) => set({ carModel: car }),
      
      toggleFavorite: (routeId) => set((state) => {
        const favs = state.favorites;
        const newFavs = favs.includes(routeId)
          ? favs.filter(id => id !== routeId)
          : [...favs, routeId];
          
        return { favorites: newFavs };
      })
    }),
    {
      name: 'winding-user-storage',
    }
  )
);

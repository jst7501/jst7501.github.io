import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, CarProfile } from '../types/user';

interface UserState {
  profile: UserProfile;
  setNickname: (name: string) => void;
  setCarProfile: (car: CarProfile) => void;
  toggleFavorite: (routeId: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: {
        nickname: '차쟁이1',
        isPremium: false,
        car: null,
        favorites: ['r2'],
      },
      
      setNickname: (name) => set((state) => ({
        profile: { ...state.profile, nickname: name }
      })),
      
      setCarProfile: (car) => set((state) => ({
        profile: { ...state.profile, car }
      })),
      
      toggleFavorite: (routeId) => set((state) => {
        const favs = state.profile.favorites;
        const newFavs = favs.includes(routeId)
          ? favs.filter(id => id !== routeId)
          : [...favs, routeId];
          
        return {
          profile: { ...state.profile, favorites: newFavs }
        };
      })
    }),
    {
      name: 'winding-user-storage',
    }
  )
);

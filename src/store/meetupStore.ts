import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Meetup, MOCK_MEETUPS } from '../types/meetup';

interface MeetupState {
  meetups: Meetup[];
  addMeetup: (meetup: Meetup) => void;
  toggleParticipation: (id: string, isJoining: boolean) => void;
}

export const useMeetupStore = create<MeetupState>()(
  persist(
    (set) => ({
      meetups: MOCK_MEETUPS,
      addMeetup: (meetup) => set((state) => ({
        meetups: [meetup, ...state.meetups]
      })),
      toggleParticipation: (id, isJoining) => set((state) => ({
        meetups: state.meetups.map(m => {
          if (m.id === id) {
            return {
              ...m,
              isParticipating: isJoining,
              currentMembers: isJoining ? m.currentMembers + 1 : m.currentMembers - 1
            };
          }
          return m;
        })
      }))
    }),
    {
      name: 'winding-meetup-storage',
    }
  )
);

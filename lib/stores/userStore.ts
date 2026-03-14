import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
  id: string
  username: string
  avatar_url: string | null
  xp: number
  coins: number
  level: number
  streak: number
  last_activity: string | null
}

interface UserStore {
  profile: UserProfile | null
  hearts: number
  maxHearts: number
  setProfile: (profile: UserProfile) => void
  updateXP: (amount: number) => void
  updateCoins: (amount: number) => void
  loseHeart: () => void
  resetHearts: () => void
  clearProfile: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: null,
      hearts: 5,
      maxHearts: 5,

      setProfile: (profile) => set({ profile }),

      updateXP: (amount) =>
        set((state) => {
          if (!state.profile) return state
          const newXP = state.profile.xp + amount
          const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1
          return {
            profile: { ...state.profile, xp: newXP, level: newLevel },
          }
        }),

      updateCoins: (amount) =>
        set((state) => {
          if (!state.profile) return state
          return {
            profile: {
              ...state.profile,
              coins: state.profile.coins + amount,
            },
          }
        }),

      loseHeart: () =>
        set((state) => ({
          hearts: Math.max(0, state.hearts - 1),
        })),

      resetHearts: () => set({ hearts: 5 }),

      clearProfile: () => set({ profile: null, hearts: 5 }),
    }),
    {
      name: 'madulingo-user',
      partialize: (state) => ({
        hearts: state.hearts,
        profile: state.profile,
      }),
    }
  )
)

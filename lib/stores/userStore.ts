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

const MAX_HEARTS = 5
const REGEN_INTERVAL_MS = 5 * 60 * 1000 // 5 menit dalam milidetik

interface UserStore {
  profile: UserProfile | null
  hearts: number
  lastHeartLostAt: number | null // timestamp milidetik

  setProfile: (profile: UserProfile) => void
  updateXP: (amount: number) => void
  updateCoins: (amount: number) => void
  loseHeart: () => void
  resetHearts: () => void
  clearProfile: () => void
  regenHearts: () => void // dipanggil saat app dibuka / timer tick
  getNextRegenIn: () => number // sisa detik ke nyawa berikutnya
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      hearts: MAX_HEARTS,
      lastHeartLostAt: null,

      setProfile: (profile) => set({ profile }),

      updateXP: (amount) =>
        set((state) => {
          if (!state.profile) return state
          const newXP = state.profile.xp + amount
          const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1
          return { profile: { ...state.profile, xp: newXP, level: newLevel } }
        }),

      updateCoins: (amount) =>
        set((state) => {
          if (!state.profile) return state
          return { profile: { ...state.profile, coins: state.profile.coins + amount } }
        }),

      loseHeart: () =>
        set((state) => {
          const newHearts = Math.max(0, state.hearts - 1)
          return {
            hearts: newHearts,
            // Catat waktu kehilangan nyawa pertama (kalau belum ada timer berjalan)
            lastHeartLostAt:
              newHearts < MAX_HEARTS && state.lastHeartLostAt === null
                ? Date.now()
                : state.lastHeartLostAt,
          }
        }),

      resetHearts: () =>
        set({ hearts: MAX_HEARTS, lastHeartLostAt: null }),

      // Dipanggil setiap kali app dibuka atau timer tick
      regenHearts: () =>
        set((state) => {
          // Kalau nyawa sudah penuh, reset timer
          if (state.hearts >= MAX_HEARTS) {
            return { hearts: MAX_HEARTS, lastHeartLostAt: null }
          }

          // Kalau tidak ada timestamp, tidak perlu regen
          if (!state.lastHeartLostAt) return state

          const now = Date.now()
          const elapsed = now - state.lastHeartLostAt
          const heartsToRegen = Math.floor(elapsed / REGEN_INTERVAL_MS)

          if (heartsToRegen <= 0) return state

          const newHearts = Math.min(MAX_HEARTS, state.hearts + heartsToRegen)

          // Geser timestamp sesuai sisa waktu yang belum dihitung
          const remainder = elapsed % REGEN_INTERVAL_MS
          const newLastHeartLostAt =
            newHearts >= MAX_HEARTS ? null : now - remainder

          return {
            hearts: newHearts,
            lastHeartLostAt: newLastHeartLostAt,
          }
        }),

      // Kembalikan sisa detik ke regen nyawa berikutnya
      getNextRegenIn: () => {
        const state = get()
        if (state.hearts >= MAX_HEARTS || !state.lastHeartLostAt) return 0
        const elapsed = Date.now() - state.lastHeartLostAt
        const remainder = elapsed % REGEN_INTERVAL_MS
        return Math.ceil((REGEN_INTERVAL_MS - remainder) / 1000) // dalam detik
      },

      clearProfile: () =>
        set({ profile: null, hearts: MAX_HEARTS, lastHeartLostAt: null }),
    }),
    {
      name: 'madulingo-user',
      partialize: (state) => ({
        hearts: state.hearts,
        profile: state.profile,
        lastHeartLostAt: state.lastHeartLostAt,
      }),
    }
  )
)
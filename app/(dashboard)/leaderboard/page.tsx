'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/userStore'
import { getLevelTitle } from '@/lib/utils/xp'

interface LeaderboardEntry {
  id: string
  username: string
  avatar_url: string | null
  xp: number
  level: number
  streak: number
  rank: number
}

export default function LeaderboardPage() {
  const { profile } = useUserStore()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, xp, level, streak')
      .order('xp', { ascending: false })
      .limit(10)

    if (data) {
      setEntries(data.map((entry, i) => ({ ...entry, rank: i + 1 })))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLeaderboard()

    // Real-time subscription
    const channel = supabase
      .channel('leaderboard-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, fetchLeaderboard)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { color: '#FACC15', bg: 'bg-[#FACC15]/10 border-[#FACC15]/30', emoji: '🥇' }
    if (rank === 2) return { color: '#94A3B8', bg: 'bg-slate-500/10 border-slate-500/30', emoji: '🥈' }
    if (rank === 3) return { color: '#CD7F32', bg: 'bg-orange-700/10 border-orange-700/30', emoji: '🥉' }
    return { color: '#475569', bg: 'bg-white/3 border-white/10', emoji: `${rank}` }
  }

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#FACC15]/20 rounded-xl flex items-center justify-center">
          <Trophy size={20} className="text-[#FACC15]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            Papan <span className="text-[#FACC15]">Juara</span>
          </h1>
          <p className="text-slate-500 text-xs">Top 10 pelajar MaduLingo</p>
        </div>
      </div>

      {/* Your rank card */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 mb-6 border border-[#E11D48]/20"
        >
          <p className="text-xs text-slate-500 mb-1">Posisimu</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E11D48]/20 flex items-center justify-center font-bold text-[#E11D48]">
              {profile.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{profile.username}</p>
              <p className="text-xs text-slate-500">{getLevelTitle(profile.level)}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#FACC15]">{profile.xp} XP</p>
              <p className="text-xs text-slate-500">Level {profile.level}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const rankStyle = getRankStyle(entry.rank)
            const isMe = entry.id === profile?.id
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${rankStyle.bg} ${
                  isMe ? 'ring-1 ring-[#E11D48]/40' : ''
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {entry.rank <= 3 ? (
                    <span className="text-lg">{rankStyle.emoji}</span>
                  ) : (
                    <span className="text-sm font-bold text-slate-500">#{entry.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: rankStyle.color + '20', color: rankStyle.color }}
                >
                  {entry.username[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {entry.username}
                    {isMe && <span className="text-[#E11D48] ml-1 text-xs">(Kamu)</span>}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Lv.{entry.level}</span>
                    <span className="text-xs text-orange-400">🔥 {entry.streak}</span>
                  </div>
                </div>

                {/* XP */}
                <div className="text-right">
                  <p className="font-bold text-sm" style={{ color: rankStyle.color }}>
                    {entry.xp.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-600">XP</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {entries.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-600">
          <Trophy size={40} className="mx-auto mb-3 opacity-30" />
          <p>Belum ada data. Jadilah yang pertama!</p>
        </div>
      )}
    </div>
  )
}

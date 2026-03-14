'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, Heart, Coins, Trophy, Star, ArrowRight, LogOut, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/userStore'
import { xpProgress, xpToNextLevel, getLevelTitle, DISTRICTS } from '@/lib/utils/xp'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { profile, hearts } = useUserStore()
  const [lessons, setLessons] = useState<any[]>([])
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    const fetchData = async () => {
      const [{ data: lessonsData }, { data: progressData }] = await Promise.all([
        supabase.from('lessons').select('*').order('order_index'),
        supabase.from('user_progress').select('lesson_id').eq('user_id', profile.id).eq('is_completed', true),
      ])
      if (lessonsData) setLessons(lessonsData)
      if (progressData) setCompletedIds(progressData.map((p: any) => p.lesson_id))
    }
    fetchData()
  }, [profile])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const progress = profile ? xpProgress(profile.xp) : 0

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-slate-400 text-sm">Selamat datang,</p>
          <h2 className="text-xl font-bold">
            {profile?.username || 'Pengguna'} 
            <span className="text-[#FACC15] ml-1">👋</span>
          </h2>
        </div>
        <button onClick={handleLogout} className="p-2 rounded-xl text-slate-500 hover:text-[#E11D48] transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      {/* XP Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Star size={16} className="text-[#FACC15]" />
              <span className="text-sm font-semibold text-[#FACC15]">
                Level {profile?.level || 1} · {getLevelTitle(profile?.level || 1)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {xpToNextLevel(profile?.xp || 0)} XP lagi ke level berikutnya
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">{profile?.xp || 0}</span>
            <p className="text-xs text-slate-500">total XP</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full xp-bar"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Bento Grid Stats */}
      <div className="bento-grid mb-6">
        {/* Hearts */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4"
        >
          <div className="flex items-center gap-1.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart
                key={i}
                size={16}
                className={i < hearts ? 'text-[#E11D48] fill-[#E11D48]' : 'text-slate-700'}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500">Nyawa</p>
          <p className="text-xl font-bold text-[#E11D48]">{hearts}/5</p>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-4"
        >
          <Flame size={24} className="streak-fire text-orange-400 mb-2" />
          <p className="text-xs text-slate-500">Streak</p>
          <p className="text-xl font-bold text-orange-400">{profile?.streak || 0} hari</p>
        </motion.div>

        {/* Coins */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-4"
        >
          <div className="text-2xl mb-2">🪙</div>
          <p className="text-xs text-slate-500">Koin</p>
          <p className="text-xl font-bold text-[#FACC15]">{profile?.coins || 0}</p>
        </motion.div>

        {/* Lessons done */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-4"
        >
          <Zap size={24} className="text-violet-400 mb-2" />
          <p className="text-xs text-slate-500">Selesai</p>
          <p className="text-xl font-bold text-violet-400">{completedIds.length}</p>
        </motion.div>
      </div>

      {/* Madura Path Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-5 mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Jalur Madura</h3>
          <Link href="/learn" className="flex items-center gap-1 text-[#E11D48] text-sm hover:underline">
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-3">
          {DISTRICTS.map((district, i) => {
            const isUnlocked = (profile?.level || 1) >= district.requiredLevel
            return (
              <div
                key={district.name}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isUnlocked ? 'bg-white/5' : 'opacity-40'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: district.color + '20' }}
                >
                  {district.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{district.name}</p>
                  <p className="text-xs text-slate-500 truncate">{district.tagline}</p>
                </div>
                {!isUnlocked && (
                  <span className="text-xs text-slate-600">Level {district.requiredLevel}</span>
                )}
                {isUnlocked && (
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Quick Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link href="/learn">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-[#E11D48] hover:bg-[#BE123C] rounded-2xl font-semibold flex items-center justify-center gap-2 rose-glow transition-all"
          >
            <Zap size={18} />
            Mulai Belajar Sekarang
          </motion.button>
        </Link>
      </motion.div>
    </div>
  )
}

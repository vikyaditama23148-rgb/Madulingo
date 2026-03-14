'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, CheckCircle2, Star, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/userStore'
import { DISTRICTS, DISTRICT_REQUIREMENTS } from '@/lib/utils/xp'

export default function LearnPage() {
  const { profile } = useUserStore()
  const [lessons, setLessons] = useState<any[]>([])
  const [completedIds, setCompletedIds] = useState<string[]>([])
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

  const userLevel = profile?.level || 1

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
          Jalur <span className="text-[#E11D48]">Madura</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Jelajahi 4 kabupaten Madura</p>
      </div>

      {/* Madura Path */}
      <div className="relative">
        {DISTRICTS.map((district, districtIdx) => {
          const districtLessons = lessons.filter(l => l.district === district.name)
          const isDistrictUnlocked = userLevel >= district.requiredLevel

          return (
            <motion.div
              key={district.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: districtIdx * 0.1 }}
              className="mb-8"
            >
              {/* District Header */}
              <div
                className={`rounded-2xl p-4 mb-4 flex items-center gap-3 ${
                  isDistrictUnlocked ? 'border border-white/10' : 'opacity-50'
                }`}
                style={{
                  background: isDistrictUnlocked
                    ? `linear-gradient(135deg, ${district.color}20, transparent)`
                    : 'rgba(255,255,255,0.03)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: district.color + '30' }}
                >
                  {district.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold">{district.name}</h2>
                    {!isDistrictUnlocked && (
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-slate-400">
                        Level {district.requiredLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{district.tagline}</p>
                </div>
                {!isDistrictUnlocked && <Lock size={18} className="text-slate-600" />}
              </div>

              {/* Lessons in this district */}
              {isDistrictUnlocked && districtLessons.length > 0 && (
                <div className="space-y-2 pl-4">
                  {districtLessons.map((lesson, lessonIdx) => {
                    const isCompleted = completedIds.includes(lesson.id)
                    return (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: districtIdx * 0.1 + lessonIdx * 0.05 }}
                      >
                        <Link href={`/learn/${lesson.id}`}>
                          <motion.div
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                              isCompleted
                                ? 'border-green-500/30 bg-green-500/5'
                                : 'border-white/10 bg-white/3 hover:bg-white/5'
                            }`}
                          >
                            {/* Status icon */}
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCompleted ? 'bg-green-500/20' : 'bg-white/10'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 size={18} className="text-green-400" />
                              ) : (
                                <span className="text-sm font-bold text-slate-400">{lessonIdx + 1}</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{lesson.title}</p>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-xs text-slate-500">
                                  +{lesson.xp_reward} XP
                                </span>
                                <span className="text-xs text-slate-500">
                                  🪙 {lesson.coin_reward}
                                </span>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: lesson.difficulty }).map((_, i) => (
                                    <Star key={i} size={10} className="text-[#FACC15] fill-[#FACC15]" />
                                  ))}
                                </div>
                              </div>
                            </div>

                            <ChevronRight size={16} className="text-slate-600" />
                          </motion.div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {isDistrictUnlocked && districtLessons.length === 0 && (
                <div className="pl-4">
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-slate-600 text-sm">
                    Pelajaran segera hadir...
                  </div>
                </div>
              )}

              {/* Connector line to next district */}
              {districtIdx < DISTRICTS.length - 1 && (
                <div className="flex justify-center my-4">
                  <div className="path-line h-8 opacity-30" />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

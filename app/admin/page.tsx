'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen, ScrollText, GraduationCap, Users,
  MessageSquare, LogOut, Shield, ChevronRight,
  TrendingUp, BookMarked, MessageSquarePlus
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/userStore'

interface Stats {
  lessons: number
  vocabulary: number
  wiki: number
  stories: number
  users: number
  kb: number
  feedback: number
}

const adminMenus = [
  {
    href: '/admin/kosakata',
    icon: ScrollText,
    label: 'Kosakata',
    desc: 'Tambah & edit kata Madura',
    color: '#7C3AED',
    statKey: 'vocabulary' as keyof Stats,
  },
  {
    href: '/admin/wiki',
    icon: BookMarked,
    label: 'MaduWiki',
    desc: 'Kelola artikel ensiklopedia',
    color: '#0EA5E9',
    statKey: 'wiki' as keyof Stats,
  },
  {
    href: '/admin/cerita',
    icon: BookOpen,
    label: 'Cerita Rakyat',
    desc: 'Kelola cerita & paragraf',
    color: '#F97316',
    statKey: 'stories' as keyof Stats,
  },
  {
    href: '/admin/pelajaran',
    icon: GraduationCap,
    label: 'Pelajaran',
    desc: 'Kelola quiz & materi belajar',
    color: '#E11D48',
    statKey: 'lessons' as keyof Stats,
  },
  {
    href: '/admin/pengguna',
    icon: Users,
    label: 'Pengguna',
    desc: 'Lihat data user terdaftar',
    color: '#34D399',
    statKey: 'users' as keyof Stats,
  },
  {
    href: '/admin/tanya-tetua',
    icon: MessageSquare,
    label: 'Knowledge Base',
    desc: 'Kelola basis pengetahuan AI',
    color: '#FACC15',
    statKey: 'kb' as keyof Stats,
  },
  {
    href: '/admin/feedback',
    icon: MessageSquarePlus,
    label: 'Feedback',
    desc: 'Kelola feedback dari pengguna',
    color: '#E11D48',
    statKey: 'feedback' as keyof Stats,
  },
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const { profile } = useUserStore()
  const supabase = createClient()
  const [stats, setStats] = useState<Stats>({
    lessons: 0, vocabulary: 0, wiki: 0,
    stories: 0, users: 0, kb: 0, feedback: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const [lessons, vocab, wiki, stories, users, kb, feedback] = await Promise.all([
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
        supabase.from('vocabulary').select('id', { count: 'exact', head: true }),
        supabase.from('wiki_articles').select('id', { count: 'exact', head: true }),
        supabase.from('stories').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('ai_knowledge_base').select('id', { count: 'exact', head: true }),
        supabase.from('feedback').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        lessons:    lessons.count    || 0,
        vocabulary: vocab.count      || 0,
        wiki:       wiki.count       || 0,
        stories:    stories.count    || 0,
        users:      users.count      || 0,
        kb:         kb.count         || 0,
        feedback:   feedback.count   || 0,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E11D48]/20 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-[#E11D48]" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Admin <span className="text-[#E11D48]">MaduLingo</span>
            </h1>
            <p className="text-xs text-slate-500">Halo, {profile?.username || 'Admin'} 👋</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={14} /> Keluar
        </button>
      </div>

      {/* Stats overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-[#FACC15]" />
          <p className="text-sm font-semibold text-[#FACC15]">Statistik Konten</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="bg-white/5 rounded-xl h-14 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Pengguna',      value: stats.users,      color: '#34D399' },
              { label: 'Pelajaran',     value: stats.lessons,    color: '#E11D48' },
              { label: 'Kosakata',      value: stats.vocabulary, color: '#7C3AED' },
              { label: 'Artikel Wiki',  value: stats.wiki,       color: '#0EA5E9' },
              { label: 'Cerita',        value: stats.stories,    color: '#F97316' },
              { label: 'Knowledge Base',value: stats.kb,         color: '#FACC15' },
              { label: 'Feedback',      value: stats.feedback,   color: '#E11D48' },
            ].map(s => (
              <div key={s.label} className="bg-white/3 rounded-xl p-3 text-center">
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 gap-3">
        {adminMenus.map((menu, i) => (
          <motion.div
            key={menu.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link href={menu.href}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="glass rounded-2xl px-4 py-4 flex items-center gap-4 hover:border-white/20 transition-all group"
                style={{ borderLeft: `3px solid ${menu.color}` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: menu.color + '15', color: menu.color }}
                >
                  <menu.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{menu.label}</p>
                  <p className="text-xs text-slate-500">{menu.desc}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!loading && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: menu.color + '15', color: menu.color }}
                    >
                      {stats[menu.statKey]}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Back to site */}
      <div className="mt-6 text-center">
        <Link href="/">
          <button className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            ← Kembali ke MaduLingo
          </button>
        </Link>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, BookOpen, Clock, Star, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Story {
  id: string
  title_id: string
  title_en: string
  title_madura: string
  district: string
  xp_reward: number
  read_time_minutes: number
  order_index: number
}

const districtColor: Record<string, string> = {
  Bangkalan: '#E11D48',
  Sampang:   '#7C3AED',
  Pamekasan: '#0EA5E9',
  Sumenep:   '#FACC15',
}

export default function AdminCeritaPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchStories = async () => {
    const { data } = await supabase.from('stories').select('*').order('order_index')
    if (data) setStories(data)
    setLoading(false)
  }

  useEffect(() => { fetchStories() }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus cerita "${title}"? Semua paragraf juga akan dihapus.`)) return
    setDeleting(id)
    await supabase.from('stories').delete().eq('id', id)
    await fetchStories()
    setDeleting(null)
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Kelola <span className="text-[#E11D48]">Cerita Rakyat</span>
            </h1>
            <p className="text-xs text-slate-500">{stories.length} cerita tersedia</p>
          </div>
        </div>

        <Link href="/admin/cerita/tambah">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E11D48] rounded-xl text-sm font-semibold rose-glow"
          >
            <Plus size={16} /> Tambah
          </motion.button>
        </Link>
      </div>

      {/* Story list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="glass rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📖</div>
          <p className="text-slate-500 text-sm mb-4">Belum ada cerita</p>
          <Link href="/admin/cerita/tambah">
            <button className="px-6 py-3 bg-[#E11D48] rounded-xl text-sm font-semibold">
              Tambah Cerita Pertama
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story, i) => {
            const color = districtColor[story.district] || '#E11D48'
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-4"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="font-semibold text-sm leading-snug mb-0.5">
                      {story.title_id}
                    </h3>
                    <p className="text-xs text-slate-500 italic mb-2 truncate">
                      {story.title_madura}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full border"
                        style={{ borderColor: color + '40', color, backgroundColor: color + '10' }}
                      >
                        {story.district}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Clock size={9} /> {story.read_time_minutes} menit
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-[#FACC15]">
                        <Star size={9} /> {story.xp_reward} XP
                      </span>
                      <span className="text-[10px] text-slate-600">
                        #{story.order_index}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/admin/cerita/${story.id}`}>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                      >
                        <Edit2 size={15} />
                      </motion.button>
                    </Link>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(story.id, story.title_id)}
                      disabled={deleting === story.id}
                      className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-all disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Quick links */}
      <div className="mt-8 glass rounded-2xl p-4">
        <p className="text-xs text-slate-500 mb-3">Kelola konten lainnya:</p>
        <div className="flex gap-2 flex-wrap">
          <Link href="/admin/wiki">
            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-slate-400 transition-all">
              📚 Wiki
            </button>
          </Link>
          <Link href="/admin/kosakata">
            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-slate-400 transition-all">
              📖 Kosakata
            </button>
          </Link>
          <Link href="/admin/pelajaran">
            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-slate-400 transition-all">
              🎓 Pelajaran
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

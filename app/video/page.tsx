'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, ThumbsUp, Bookmark, Eye, Search,
  X, Clock, ArrowLeft, Film, TrendingUp
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/userStore'

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface Video {
  id: string
  title: string
  description: string
  youtube_url: string | null
  storage_url: string | null
  thumbnail_url: string | null
  kategori: string
  district: string
  view_count: number
  duration: string | null
  is_featured: boolean
  created_at: string
  uploader_id: string | null
}

// ── KATEGORI CONFIG ───────────────────────────────────────────────────────────
const KATEGORI = [
  { key: 'semua',   label: 'Semua',            emoji: '🎬' },
  { key: 'tradisi', label: 'Tradisi',           emoji: '🎭' },
  { key: 'pariwisata', label: 'Pariwisata',     emoji: '🗺️' },
  { key: 'alam',    label: 'Alam',              emoji: '🌿' },
  { key: 'religi',  label: 'Religi',            emoji: '🕌' },
  { key: 'seni',    label: 'Seni & Kerajinan',  emoji: '🎨' },
  { key: 'bahasa',  label: 'Bahasa',            emoji: '🗣️' },
  { key: 'tokoh',   label: 'Tokoh & Sejarah',   emoji: '📜' },
  { key: 'materi',  label: 'Materi',            emoji: '📚' },
  { key: 'musik',   label: 'Musik',             emoji: '🎵' },
  { key: 'hiburan', label: 'Hiburan',           emoji: '🎉' },
  { key: 'makanan', label: 'Makanan',           emoji: '🍜' },
]

// ── HELPERS ───────────────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/)
  return match ? match[1] : null
}

function getThumbnail(video: Video): string {
  if (video.thumbnail_url) return video.thumbnail_url
  if (video.youtube_url) {
    const id = getYouTubeId(video.youtube_url)
    if (id) return `https://img.youtube.com/vi/${id}/mqdefault.jpg`
  }
  return ''
}

function formatViews(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}jt`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}rb`
  return String(count)
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hari ini'
  if (days < 7) return `${days} hari lalu`
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`
  if (days < 365) return `${Math.floor(days / 30)} bulan lalu`
  return `${Math.floor(days / 365)} tahun lalu`
}

// ── VIDEO CARD ────────────────────────────────────────────────────────────────
function VideoCard({ video, featured = false }: { video: Video; featured?: boolean }) {
  const thumb = getThumbnail(video)
  const kat = KATEGORI.find(k => k.key === video.kategori)

  return (
    <Link href={`/video/${video.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="group cursor-pointer"
      >
        {/* Thumbnail */}
        <div className={`relative rounded-2xl overflow-hidden bg-slate-800 ${featured ? 'aspect-video' : 'aspect-video'}`}>
          {thumb ? (
            <img src={thumb} alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <Film size={featured ? 48 : 32} className="text-slate-600" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-[#E11D48] rounded-full flex items-center justify-center shadow-lg rose-glow">
              <Play size={20} className="fill-white text-white ml-0.5" />
            </div>
          </div>

          {/* Duration */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
              {video.duration}
            </div>
          )}

          {/* Featured badge */}
          {video.is_featured && (
            <div className="absolute top-2 left-2 bg-[#E11D48] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <TrendingUp size={9} /> Unggulan
            </div>
          )}

          {/* Kategori badge */}
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
            {kat?.emoji} {kat?.label}
          </div>
        </div>

        {/* Info */}
        <div className="mt-2.5 px-0.5">
          <h3 className={`font-semibold leading-snug line-clamp-2 group-hover:text-[#E11D48] transition-colors ${featured ? 'text-base' : 'text-sm'}`}>
            {video.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Eye size={10} /> {formatViews(video.view_count)}
            </span>
            <span>·</span>
            <span>{timeAgo(video.created_at)}</span>
            {video.district !== 'Umum' && (
              <>
                <span>·</span>
                <span className="text-slate-600">{video.district}</span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function VideoPage() {
  const router = useRouter()
  const { profile } = useUserStore()
  const supabase = createClient()

  const [videos, setVideos] = useState<Video[]>([])
  const [filtered, setFiltered] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [activeKat, setActiveKat] = useState('semua')
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
    }
    checkAuth()
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
    if (data) { setVideos(data); setFiltered(data) }
    setLoading(false)
  }

  useEffect(() => {
    let result = [...videos]
    if (activeKat !== 'semua') result = result.filter(v => v.kategori === activeKat)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [activeKat, search, videos])

  const featured = filtered.find(v => v.is_featured)
  const rest = filtered.filter(v => !v.is_featured || filtered.indexOf(v) !== filtered.indexOf(featured!))

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 bg-[#0A0F1E]/95 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">

          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                <ArrowLeft size={18} />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#E11D48] rounded-lg flex items-center justify-center">
                <Play size={14} className="fill-white text-white ml-0.5" />
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                Madu<span className="text-[#E11D48]">Tube</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari video..."
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#E11D48] transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearch('') }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              {showSearch ? <X size={18} /> : <Search size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── KATEGORI TABS ── */}
      <div className="sticky top-[57px] z-30 bg-[#0A0F1E]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {KATEGORI.map(k => (
              <motion.button
                key={k.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveKat(k.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeKat === k.key
                    ? 'bg-[#E11D48] text-white shadow-lg'
                    : 'bg-white/8 text-slate-400 hover:bg-white/12 hover:text-white'
                }`}
              >
                <span>{k.emoji}</span>
                {k.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {loading ? (
          <div className="space-y-6">
            <div className="aspect-video rounded-2xl bg-slate-800/50 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="space-y-2">
                  <div className="aspect-video rounded-2xl bg-slate-800/50 animate-pulse" />
                  <div className="h-4 bg-slate-800/50 rounded animate-pulse" />
                  <div className="h-3 bg-slate-800/50 rounded w-2/3 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Film size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-slate-500 text-lg mb-2">Belum ada video</p>
            <p className="text-slate-700 text-sm">
              {search ? 'Coba kata kunci lain' : 'Video untuk kategori ini belum tersedia'}
            </p>
          </div>
        ) : (
          <>
            {/* Featured video */}
            {featured && activeKat === 'semua' && !search && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <VideoCard video={featured} featured />
              </motion.div>
            )}

            {/* Video count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                {filtered.length} video {activeKat !== 'semua' ? `· ${KATEGORI.find(k => k.key === activeKat)?.label}` : ''}
              </p>
            </div>

            {/* Video grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(activeKat === 'semua' && !search ? rest : filtered).map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <VideoCard video={video} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

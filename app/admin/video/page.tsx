'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Plus, Edit2, Trash2, Save,
  X, Eye, Star, Film, Youtube, Upload
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/userStore'

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([-\w]{11})/)
  return match ? match[1] : null
}


interface Video {
  id: string
  title: string
  description: string | null
  youtube_url: string | null
  storage_url: string | null
  thumbnail_url: string | null
  kategori: string
  district: string
  view_count: number
  duration: string | null
  is_featured: boolean
  created_at: string
}

const KATEGORI = [
  'tradisi', 'pariwisata', 'alam', 'religi', 'seni',
  'bahasa', 'tokoh', 'materi', 'musik', 'hiburan', 'makanan'
]
const DISTRICTS = ['Umum', 'Bangkalan', 'Sampang', 'Pamekasan', 'Sumenep']

function InputField({ label, value, onChange, placeholder, required = false, multiline = false }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; required?: boolean; multiline?: boolean
}) {
  const cls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors"
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1.5 block">
        {label} {required && <span className="text-[#E11D48]">*</span>}
      </label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls + ' resize-none'} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  )
}

export default function AdminVideoPage() {
  const router = useRouter()
  const { profile } = useUserStore()
  const supabase = createClient()

  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [storageUrl, setStorageUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [kategori, setKategori] = useState('tradisi')
  const [district, setDistrict] = useState('Umum')
  const [duration, setDuration] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    const { data } = await supabase
      .from('videos').select('*')
      .order('created_at', { ascending: false })
    if (data) setVideos(data)
    setLoading(false)
  }

  const resetForm = () => {
    setTitle(''); setDescription(''); setYoutubeUrl('')
    setStorageUrl(''); setThumbnailUrl(''); setKategori('tradisi')
    setDistrict('Umum'); setDuration(''); setIsFeatured(false)
    setEditingId(null); setShowForm(false)
  }

  const openEdit = (video: Video) => {
    setEditingId(video.id)
    setTitle(video.title)
    setDescription(video.description || '')
    setYoutubeUrl(video.youtube_url || '')
    setStorageUrl(video.storage_url || '')
    setThumbnailUrl(video.thumbnail_url || '')
    setKategori(video.kategori)
    setDistrict(video.district)
    setDuration(video.duration || '')
    setIsFeatured(video.is_featured)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    if (!title.trim()) { alert('Judul video wajib diisi!'); return }
    if (!youtubeUrl.trim() && !storageUrl.trim()) {
      alert('URL YouTube atau URL Storage harus diisi salah satunya!')
      return
    }
    setSaving(true)

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      youtube_url: youtubeUrl.trim() || null,
      storage_url: storageUrl.trim() || null,
      thumbnail_url: thumbnailUrl.trim() || null,
      kategori, district,
      duration: duration.trim() || null,
      is_featured: isFeatured,
      uploader_id: profile?.id || null,
    }

    if (editingId) {
      const { error } = await supabase.from('videos').update(payload).eq('id', editingId)
      if (error) { alert('Gagal: ' + error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('videos').insert(payload)
      if (error) { alert('Gagal: ' + error.message); setSaving(false); return }
    }

    await fetchVideos()
    resetForm()
    setSaving(false)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus video "${title}"?`)) return
    setDeleting(id)
    await supabase.from('videos').delete().eq('id', id)
    await fetchVideos()
    setDeleting(null)
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('videos').update({ is_featured: !current }).eq('id', id)
    await fetchVideos()
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Kelola <span className="text-[#E11D48]">MaduTube</span>
            </h1>
            <p className="text-xs text-slate-500">{videos.length} video tersedia</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E11D48] rounded-xl text-sm font-semibold rose-glow">
          <Plus size={16} /> Upload
        </motion.button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass rounded-2xl p-5 space-y-4 border border-[#E11D48]/20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#E11D48]">
                  {editingId ? '✏️ Edit Video' : '➕ Upload Video Baru'}
                </p>
                <button onClick={resetForm} className="text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <InputField label="Judul Video" value={title} onChange={setTitle}
                placeholder="contoh: Karapan Sapi Madura 2024" required />
              <InputField label="Deskripsi" value={description} onChange={setDescription}
                placeholder="Deskripsi video..." multiline />

              {/* Video source */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Youtube size={12} className="text-red-500" /> URL YouTube
                  </label>
                  <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Upload size={12} className="text-blue-400" /> URL Storage Supabase
                  </label>
                  <input value={storageUrl} onChange={e => setStorageUrl(e.target.value)}
                    placeholder="https://xxx.supabase.co/storage/v1/object/public/videos/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors" />
                </div>
              </div>

              <InputField label="URL Thumbnail (opsional, auto dari YouTube jika kosong)"
                value={thumbnailUrl} onChange={setThumbnailUrl}
                placeholder="https://..." />

              <div className="grid grid-cols-2 gap-3">
                <InputField label="Durasi" value={duration} onChange={setDuration} placeholder="contoh: 10:25" />
              </div>

              {/* Kategori */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {KATEGORI.map(k => (
                    <button key={k} onClick={() => setKategori(k)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border capitalize transition-all ${
                        kategori === k ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]' : 'border-white/10 bg-white/3 text-slate-500'
                      }`}>
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* District */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Kabupaten</label>
                <div className="flex gap-2 flex-wrap">
                  {DISTRICTS.map(d => (
                    <button key={d} onClick={() => setDistrict(d)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        district === d ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]' : 'border-white/10 bg-white/3 text-slate-500'
                      }`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div>
                  <p className="text-sm font-medium">Video Unggulan</p>
                  <p className="text-xs text-slate-500">Ditampilkan paling atas di beranda</p>
                </div>
                <button onClick={() => setIsFeatured(!isFeatured)}
                  className={`w-12 h-6 rounded-full transition-all ${isFeatured ? 'bg-[#E11D48]' : 'bg-white/20'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-all mx-0.5 ${isFeatured ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex gap-3">
                <button onClick={resetForm}
                  className="flex-shrink-0 px-4 py-2.5 rounded-xl border border-white/20 text-sm hover:bg-white/5 transition-all">
                  Batal
                </button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 bg-[#E11D48] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 rose-glow disabled:opacity-50">
                  <Save size={14} />
                  {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Upload Video'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="glass rounded-2xl h-20 animate-pulse" />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16">
          <Film size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-slate-600 text-sm">Belum ada video</p>
        </div>
      ) : (
        <div className="space-y-2">
          {videos.map((video, i) => (
            <motion.div key={video.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`glass rounded-xl px-4 py-3 flex items-center gap-3 ${video.is_featured ? 'border-l-2 border-[#FACC15]' : ''}`}
            >
              {/* Thumbnail mini */}
              <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                {video.youtube_url && getYouTubeId(video.youtube_url) ? (
                  <img src={`https://img.youtube.com/vi/${getYouTubeId(video.youtube_url)}/mqdefault.jpg`}
                    alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film size={14} className="text-slate-600" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{video.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-600 capitalize">{video.kategori}</span>
                  <span className="text-[10px] text-slate-700">·</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-600">
                    <Eye size={9} /> {video.view_count}
                  </span>
                  {video.is_featured && (
                    <span className="text-[10px] text-[#FACC15]">⭐ Unggulan</span>
                  )}
                </div>
              </div>

              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => toggleFeatured(video.id, video.is_featured)}
                  title={video.is_featured ? 'Hapus dari unggulan' : 'Jadikan unggulan'}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    video.is_featured ? 'bg-[#FACC15]/20 text-[#FACC15]' : 'bg-white/5 text-slate-600 hover:text-[#FACC15]'
                  }`}>
                  <Star size={13} className={video.is_featured ? 'fill-[#FACC15]' : ''} />
                </button>
                <button onClick={() => openEdit(video)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => handleDelete(video.id, video.title)}
                  disabled={deleting === video.id}
                  className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-all disabled:opacity-40">
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

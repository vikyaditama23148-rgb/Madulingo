'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Star, Search, X, ChevronDown, ExternalLink, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Feedback {
  id: string
  user_id: string | null
  username: string | null
  rating: number
  kategori: string
  deskripsi: string
  image_url: string | null
  status: 'baru' | 'dibaca' | 'diproses' | 'selesai'
  created_at: string
}

const statusConfig = {
  baru:     { label: 'Baru',     color: '#E11D48', bg: '#E11D4815' },
  dibaca:   { label: 'Dibaca',   color: '#FACC15', bg: '#FACC1515' },
  diproses: { label: 'Diproses', color: '#0EA5E9', bg: '#0EA5E915' },
  selesai:  { label: 'Selesai',  color: '#34D399', bg: '#34D39915' },
}

const kategoriConfig = {
  bug:    { label: '🐛 Bug',    color: '#EF4444' },
  saran:  { label: '💡 Saran',  color: '#FACC15' },
  pujian: { label: '❤️ Pujian', color: '#34D399' },
}

export default function AdminFeedbackPage() {
  const supabase = createClient()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [filtered, setFiltered] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('semua')
  const [filterKategori, setFilterKategori] = useState<string>('semua')
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchFeedbacks = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) { setFeedbacks(data); setFiltered(data) }
    setLoading(false)
  }

  useEffect(() => { fetchFeedbacks() }, [])

  useEffect(() => {
    let result = [...feedbacks]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(f =>
        f.deskripsi.toLowerCase().includes(q) ||
        (f.username?.toLowerCase().includes(q))
      )
    }
    if (filterStatus !== 'semua') result = result.filter(f => f.status === filterStatus)
    if (filterKategori !== 'semua') result = result.filter(f => f.kategori === filterKategori)
    setFiltered(result)
  }, [search, filterStatus, filterKategori, feedbacks])

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await supabase.from('feedback').update({ status }).eq('id', id)
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: status as any } : f))
    if (selectedFeedback?.id === id) {
      setSelectedFeedback(prev => prev ? { ...prev, status: status as any } : null)
    }
    setUpdating(null)
  }

  // Stats
  const stats = {
    total: feedbacks.length,
    baru: feedbacks.filter(f => f.status === 'baru').length,
    avgRating: feedbacks.length
      ? (feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length).toFixed(1)
      : '0',
    bug: feedbacks.filter(f => f.kategori === 'bug').length,
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

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
              Kelola <span className="text-[#E11D48]">Feedback</span>
            </h1>
            <p className="text-xs text-slate-500">{feedbacks.length} feedback masuk</p>
          </div>
        </div>
        <button onClick={fetchFeedbacks}
          className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { label: 'Total', value: stats.total, color: '#94A3B8' },
          { label: 'Baru', value: stats.baru, color: '#E11D48' },
          { label: 'Avg ⭐', value: stats.avgRating, color: '#FACC15' },
          { label: 'Bug', value: stats.bug, color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-slate-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari feedback atau username..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {/* Status filter */}
        <button onClick={() => setFilterStatus('semua')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            filterStatus === 'semua' ? 'bg-[#E11D48] text-white' : 'bg-white/5 text-slate-500'
          }`}>
          Semua Status
        </button>
        {Object.entries(statusConfig).map(([key, val]) => (
          <button key={key} onClick={() => setFilterStatus(filterStatus === key ? 'semua' : key)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border"
            style={filterStatus === key
              ? { backgroundColor: val.bg, borderColor: val.color, color: val.color }
              : { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: '#64748b' }
            }>
            {val.label}
          </button>
        ))}
        <div className="w-px bg-white/10 flex-shrink-0" />
        {Object.entries(kategoriConfig).map(([key, val]) => (
          <button key={key} onClick={() => setFilterKategori(filterKategori === key ? 'semua' : key)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border"
            style={filterKategori === key
              ? { backgroundColor: val.color + '15', borderColor: val.color, color: val.color }
              : { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: '#64748b' }
            }>
            {val.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-600 mb-3">{filtered.length} feedback ditemukan</p>

      {/* Feedback list */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="glass rounded-xl h-20 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-600 text-sm">Belum ada feedback</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((fb, i) => {
            const st = statusConfig[fb.status]
            const kt = kategoriConfig[fb.kategori as keyof typeof kategoriConfig]
            return (
              <motion.button
                key={fb.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedFeedback(fb)}
                className="w-full glass rounded-xl px-4 py-3 text-left hover:border-white/15 transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Rating */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black"
                    style={{ background: '#FACC1515', color: '#FACC15' }}>
                    {fb.rating}⭐
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold">{fb.username || 'Anonim'}</span>
                      {kt && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{ background: kt.color + '15', color: kt.color }}>
                          {kt.label}
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{fb.deskripsi}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{formatDate(fb.created_at)}</p>
                  </div>

                  {fb.image_url && (
                    <img src={fb.image_url} alt=""
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/10" />
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4"
            onClick={() => setSelectedFeedback(null)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden"
              style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              <div className="px-5 pt-2 pb-6 max-h-[80vh] overflow-y-auto space-y-4">

                {/* Header detail */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Detail Feedback
                    </h3>
                    <p className="text-xs text-slate-500">{formatDate(selectedFeedback.created_at)}</p>
                  </div>
                  <button onClick={() => setSelectedFeedback(null)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                    <X size={16} />
                  </button>
                </div>

                {/* Info user */}
                <div className="glass rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Dari</span>
                    <span className="text-sm font-semibold">{selectedFeedback.username || 'Anonim'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Rating</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={14}
                          className={s <= selectedFeedback.rating
                            ? 'text-[#FACC15] fill-[#FACC15]' : 'text-slate-700'} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Kategori</span>
                    <span className="text-xs font-medium"
                      style={{ color: kategoriConfig[selectedFeedback.kategori as keyof typeof kategoriConfig]?.color }}>
                      {kategoriConfig[selectedFeedback.kategori as keyof typeof kategoriConfig]?.label}
                    </span>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="glass rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-2">Deskripsi</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{selectedFeedback.deskripsi}</p>
                </div>

                {/* Screenshot */}
                {selectedFeedback.image_url && (
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-2">Screenshot</p>
                    <img src={selectedFeedback.image_url} alt="screenshot"
                      className="w-full rounded-xl border border-white/10" />
                    <a href={selectedFeedback.image_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 mt-2 text-xs text-blue-400 hover:underline">
                      <ExternalLink size={11} /> Buka gambar penuh
                    </a>
                  </div>
                )}

                {/* Update Status */}
                <div>
                  <p className="text-xs text-slate-500 mb-2 font-medium">Ubah Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(statusConfig).map(([key, val]) => (
                      <motion.button
                        key={key}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleUpdateStatus(selectedFeedback.id, key)}
                        disabled={updating === selectedFeedback.id}
                        className="py-2.5 rounded-xl text-xs font-bold border-2 transition-all disabled:opacity-50"
                        style={selectedFeedback.status === key
                          ? { borderColor: val.color, backgroundColor: val.bg, color: val.color }
                          : { borderColor: 'rgba(255,255,255,0.08)', color: '#64748b', backgroundColor: 'transparent' }
                        }
                      >
                        {updating === selectedFeedback.id && selectedFeedback.status !== key
                          ? '...' : val.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setSelectedFeedback(null)}
                  className="w-full py-3 border border-white/10 rounded-xl text-sm text-slate-500 hover:bg-white/5 transition-all">
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

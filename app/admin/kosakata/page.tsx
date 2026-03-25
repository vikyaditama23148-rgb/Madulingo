'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, ArrowLeft, X, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface VocabWord {
  id: string
  kata_madura: string
  kata_indonesia: string
  definisi: string
  kategori: string
  tingkat_bahasa: string
  kbbi_url: string | null
  audio_url: string | null
}

const kategoriColors: Record<string, string> = {
  sapaan:    '#E11D48',
  angka:     '#7C3AED',
  warna:     '#0EA5E9',
  tubuh:     '#F97316',
  alam:      '#34D399',
  keluarga:  '#FACC15',
  aktivitas: '#A78BFA',
  waktu:     '#FB923C',
  umum:      '#94A3B8',
}

export default function AdminKosakataPage() {
  const [words, setWords] = useState<VocabWord[]>([])
  const [filtered, setFiltered] = useState<VocabWord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  const fetchWords = async () => {
    const { data } = await supabase
      .from('vocabulary')
      .select('*')
      .order('kata_madura')
    if (data) { setWords(data); setFiltered(data) }
    setLoading(false)
  }

  useEffect(() => { fetchWords() }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(words); return }
    const q = search.toLowerCase()
    setFiltered(words.filter(w =>
      w.kata_madura.toLowerCase().includes(q) ||
      w.kata_indonesia.toLowerCase().includes(q) ||
      w.kategori.toLowerCase().includes(q)
    ))
  }, [search, words])

  const handleDelete = async (id: string, kata: string) => {
    if (!confirm(`Hapus kata "${kata}"?`)) return
    setDeleting(id)
    await supabase.from('vocabulary').delete().eq('id', id)
    await fetchWords()
    setDeleting(null)
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
              Kelola <span className="text-[#E11D48]">Kosakata</span>
            </h1>
            <p className="text-xs text-slate-500">{words.length} kata tersedia</p>
          </div>
        </div>
        <Link href="/admin/kosakata/tambah">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E11D48] rounded-xl text-sm font-semibold rose-glow"
          >
            <Plus size={16} /> Tambah
          </motion.button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari kata Madura atau Indonesia..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-600 mb-3">{filtered.length} kata ditemukan</p>

      {/* Word list */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="glass rounded-xl h-16 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-slate-600 text-sm">
            {search ? 'Kata tidak ditemukan' : 'Belum ada kosakata'}
          </p>
          {!search && (
            <Link href="/admin/kosakata/tambah">
              <button className="mt-4 px-5 py-2.5 bg-[#E11D48] rounded-xl text-sm font-semibold">
                Tambah Kata Pertama
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((word, i) => {
            const color = kategoriColors[word.kategori] || '#94A3B8'
            return (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="glass rounded-xl px-4 py-3 flex items-center gap-3"
              >
                {/* Kategori dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{word.kata_madura}</span>
                    <span className="text-slate-600 text-xs">→</span>
                    <span className="text-sm text-slate-300">{word.kata_indonesia}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: color + '15', color }}
                    >
                      {word.kategori}
                    </span>
                    <span className="text-[10px] text-slate-600">{word.tingkat_bahasa}</span>
                    {word.kbbi_url && (
                      <span className="text-[10px] text-blue-500">KBBI ✓</span>
                    )}
                    {word.audio_url && (
                      <span className="text-[10px] text-green-500">Audio ✓</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 flex-shrink-0">
                  <Link href={`/admin/kosakata/${word.id}`}>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    >
                      <Edit2 size={13} />
                    </motion.button>
                  </Link>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(word.id, word.kata_madura)}
                    disabled={deleting === word.id}
                    className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-all disabled:opacity-40"
                  >
                    <Trash2 size={13} />
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

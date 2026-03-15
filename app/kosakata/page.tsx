'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, BookOpen, X, ExternalLink, Volume2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface VocabWord {
  id: string
  kata_madura: string
  kata_indonesia: string
  definisi: string
  contoh_madura: string | null
  contoh_indonesia: string | null
  kategori: string
  tingkat_bahasa: string
  kbbi_url: string | null
  audio_url: string | null
}

// ── CONFIG ────────────────────────────────────────────────────────────────────
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const kategoriConfig: Record<string, { emoji: string; color: string }> = {
  sapaan:    { emoji: '👋', color: '#E11D48' },
  angka:     { emoji: '🔢', color: '#7C3AED' },
  warna:     { emoji: '🎨', color: '#0EA5E9' },
  tubuh:     { emoji: '🫀', color: '#F97316' },
  alam:      { emoji: '🌿', color: '#34D399' },
  keluarga:  { emoji: '👨‍👩‍👧', color: '#FACC15' },
  aktivitas: { emoji: '⚡', color: '#A78BFA' },
  waktu:     { emoji: '⏰', color: '#FB923C' },
  umum:      { emoji: '📝', color: '#94A3B8' },
}

const tingkatConfig: Record<string, { label: string; color: string }> = {
  'enjhem':      { label: 'Enjhem',      color: '#34D399' },
  'enggi-enten': { label: 'Enggi-Enten', color: '#FACC15' },
  'bhumajhân':   { label: 'Bhumajhân',   color: '#E11D48' },
}

// ── WORD CARD ─────────────────────────────────────────────────────────────────
function WordCard({ word, onSelect }: { word: VocabWord; onSelect: (w: VocabWord) => void }) {
  const kat = kategoriConfig[word.kategori] || kategoriConfig.umum
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(word)}
      className="w-full glass rounded-2xl p-4 text-left hover:border-white/20 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{kat.emoji}</span>
            <h3 className="font-bold text-base" style={{ fontFamily: 'Playfair Display, serif' }}>
              {word.kata_madura}
            </h3>
          </div>
          <p className="text-sm font-medium" style={{ color: kat.color }}>
            {word.kata_indonesia}
          </p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{word.definisi}</p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {word.audio_url && (
            <Volume2 size={14} className="text-slate-600" />
          )}
          {word.kbbi_url && (
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
              KBBI
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

// ── WORD DETAIL MODAL ─────────────────────────────────────────────────────────
function WordModal({ word, onClose }: { word: VocabWord; onClose: () => void }) {
  const kat = kategoriConfig[word.kategori] || kategoriConfig.umum
  const tingkat = tingkatConfig[word.tingkat_bahasa]

  const playAudio = () => {
    if (!word.audio_url) return
    new Audio(word.audio_url).play()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-lg glass-dark rounded-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4"
          style={{ background: `linear-gradient(to bottom, ${kat.color}15, transparent)` }}
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-4xl">{kat.emoji}</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <h2
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {word.kata_madura}
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-semibold" style={{ color: kat.color }}>
              {word.kata_indonesia}
            </span>
            {tingkat && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                style={{ borderColor: tingkat.color + '40', color: tingkat.color, backgroundColor: tingkat.color + '10' }}
              >
                {tingkat.label}
              </span>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Definisi */}
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Definisi</p>
            <p className="text-sm text-slate-300">{word.definisi}</p>
          </div>

          {/* Contoh kalimat */}
          {word.contoh_madura && (
            <div className="glass rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-2">Contoh Kalimat</p>
              <p className="text-sm font-semibold mb-1">🗣️ {word.contoh_madura}</p>
              {word.contoh_indonesia && (
                <p className="text-xs text-slate-400 italic">📝 {word.contoh_indonesia}</p>
              )}
            </div>
          )}

          {/* Kategori */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Kategori:</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full border"
              style={{ borderColor: kat.color + '40', color: kat.color, backgroundColor: kat.color + '10' }}
            >
              {kat.emoji} {word.kategori.charAt(0).toUpperCase() + word.kategori.slice(1)}
            </span>
          </div>

          {/* Audio */}
          {word.audio_url ? (
            <button
              onClick={playAudio}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E11D48]/30 bg-[#E11D48]/10 text-[#E11D48] text-sm font-semibold hover:bg-[#E11D48]/20 transition-all"
            >
              <Volume2 size={16} />
              Dengarkan Pengucapan
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/8 text-slate-700 text-sm">
              <Volume2 size={16} />
              Audio belum tersedia
            </div>
          )}

          {/* KBBI Link */}
          {word.kbbi_url ? (
            <a
              href={word.kbbi_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition-all"
            >
              <BookOpen size={16} />
              Lihat di KBBI Resmi
              <ExternalLink size={12} />
            </a>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/8 text-slate-700 text-sm">
              <BookOpen size={16} />
              Tidak tersedia di KBBI
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 border border-white/10 rounded-xl text-sm hover:bg-white/5 transition-all text-slate-400"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function KosakataPage() {
  const [words, setWords] = useState<VocabWord[]>([])
  const [filtered, setFiltered] = useState<VocabWord[]>([])
  const [search, setSearch] = useState('')
  const [activeLetter, setActiveLetter] = useState<string | null>(null)
  const [activeKategori, setActiveKategori] = useState<string | null>(null)
  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchMode, setSearchMode] = useState<'madura' | 'indonesia'>('madura')

  const supabase = createClient()

  useEffect(() => {
    const fetchWords = async () => {
      const { data } = await supabase
        .from('vocabulary')
        .select('*')
        .order('kata_madura')
      if (data) {
        setWords(data)
        setFiltered(data)
      }
      setLoading(false)
    }
    fetchWords()
  }, [])

  const applyFilter = useCallback((
    q: string,
    letter: string | null,
    kat: string | null,
    mode: 'madura' | 'indonesia'
  ) => {
    let result = [...words]
    if (q) {
      result = result.filter(w =>
        mode === 'madura'
          ? w.kata_madura.toLowerCase().includes(q.toLowerCase())
          : w.kata_indonesia.toLowerCase().includes(q.toLowerCase())
      )
    }
    if (letter) {
      result = result.filter(w =>
        w.kata_madura.toUpperCase().startsWith(letter)
      )
    }
    if (kat) {
      result = result.filter(w => w.kategori === kat)
    }
    setFiltered(result)
  }, [words])

  useEffect(() => {
    applyFilter(search, activeLetter, activeKategori, searchMode)
  }, [search, activeLetter, activeKategori, searchMode, applyFilter])

  const handleLetterClick = (letter: string) => {
    const newLetter = activeLetter === letter ? null : letter
    setActiveLetter(newLetter)
    setSearch('')
  }

  const clearFilters = () => {
    setSearch('')
    setActiveLetter(null)
    setActiveKategori(null)
  }

  const availableLetters = new Set(words.map(w => w.kata_madura[0].toUpperCase()))

  return (
    <div className="min-h-screen bg-[#0F172A] text-white px-4 py-8 max-w-2xl mx-auto">

      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-8 transition-colors group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Kembali
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#E11D48]/20 rounded-xl flex items-center justify-center">
            <BookOpen size={20} className="text-[#E11D48]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Kosakata <span className="text-[#E11D48]">Madura</span>
            </h1>
            <p className="text-slate-500 text-xs">{words.length} kata tersedia</p>
          </div>
        </div>
      </motion.div>

      {/* Search mode toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-3"
      >
        {(['madura', 'indonesia'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setSearchMode(mode)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              searchMode === mode
                ? 'bg-[#E11D48] text-white'
                : 'bg-white/5 text-slate-500'
            }`}
          >
            {mode === 'madura' ? '🗣️ Cari Kata Madura' : '🇮🇩 Cari Kata Indonesia'}
          </button>
        ))}
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative mb-4"
      >
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveLetter(null) }}
          placeholder={searchMode === 'madura' ? 'Cari kata Madura...' : 'Cari kata Indonesia...'}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </motion.div>

      {/* Alphabet browse */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <p className="text-xs text-slate-600 mb-2">Browse per huruf:</p>
        <div className="flex flex-wrap gap-1.5">
          {ALPHABET.map(letter => {
            const hasWords = availableLetters.has(letter)
            const isActive = activeLetter === letter
            return (
              <button
                key={letter}
                onClick={() => hasWords && handleLetterClick(letter)}
                disabled={!hasWords}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#E11D48] text-white rose-glow'
                    : hasWords
                    ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                    : 'bg-white/2 text-slate-700 cursor-not-allowed'
                }`}
              >
                {letter}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Kategori filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide"
      >
        <button
          onClick={() => setActiveKategori(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            !activeKategori ? 'bg-[#E11D48] text-white' : 'bg-white/5 text-slate-500'
          }`}
        >
          Semua
        </button>
        {Object.entries(kategoriConfig).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setActiveKategori(activeKategori === key ? null : key)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeKategori === key ? 'text-white' : 'bg-white/5 text-slate-500'
            }`}
            style={activeKategori === key ? { backgroundColor: val.color } : {}}
          >
            {val.emoji} {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Results count & clear */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500">
          {filtered.length} kata ditemukan
        </p>
        {(search || activeLetter || activeKategori) && (
          <button onClick={clearFilters} className="text-xs text-[#E11D48] hover:underline">
            Reset filter
          </button>
        )}
      </div>

      {/* Word list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((word, i) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <WordCard word={word} onSelect={setSelectedWord} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-slate-600 text-sm">Kata tidak ditemukan</p>
          <p className="text-slate-700 text-xs mt-1">Coba kata lain atau reset filter</p>
        </div>
      )}

      {/* Word detail modal */}
      <AnimatePresence>
        {selectedWord && (
          <WordModal word={selectedWord} onClose={() => setSelectedWord(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

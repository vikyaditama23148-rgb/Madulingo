'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, BookOpen, ChevronRight, ChevronLeft,
  ScrollText, Globe, Share2, Star, Clock,
  X, Sparkles, BookMarked
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/userStore'

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface Story {
  id: string
  title_id: string
  title_en: string
  title_madura: string
  district: string
  cover_image_url: string | null
  synopsis_id: string
  synopsis_en: string
  synopsis_madura: string
  xp_reward: number
  read_time_minutes: number
  tags: string[]
  order_index: number
}

interface Paragraph {
  id: string
  story_id: string
  order_index: number
  text_id: string
  text_en: string
  text_madura: string
  vocabulary_highlights: VocabHighlight[]
}

interface VocabHighlight {
  kata_madura: string
  kata_id: string
  arti: string
}

type Lang = 'id' | 'en' | 'madura'
type Tab = 'wiki' | 'cerita'

// ── CONFIG ────────────────────────────────────────────────────────────────────
const districtColor: Record<string, string> = {
  Bangkalan: '#E11D48',
  Sampang:   '#7C3AED',
  Pamekasan: '#0EA5E9',
  Sumenep:   '#FACC15',
}

const langConfig: Record<Lang, { label: string; flag: string }> = {
  id:     { label: 'Indonesia', flag: '🇮🇩' },
  en:     { label: 'English',   flag: '🇬🇧' },
  madura: { label: 'Madura',    flag: '🏝️'  },
}

const districts = [
  {
    name: 'Bangkalan', slug: 'bangkalan', emoji: '🌅', color: '#E11D48',
    tagline: 'Pintu Gerbang Madura',
    desc: 'Kabupaten paling barat Madura, rumah Jembatan Suramadu dan tradisi pesisir yang kaya.',
    highlights: ['Jembatan Suramadu', 'Bebek Songkem', 'Pantai Rongkang'],
  },
  {
    name: 'Sampang', slug: 'sampang', emoji: '🎭', color: '#7C3AED',
    tagline: 'Tanah Seni & Garam',
    desc: 'Sentra produksi garam terbesar Madura dengan kekayaan seni tari dan kuliner laut yang unik.',
    highlights: ['Garam Madura', 'Pantai Camplong', 'Lorjuk'],
  },
  {
    name: 'Pamekasan', slug: 'pamekasan', emoji: '👑', color: '#0EA5E9',
    tagline: 'Kota Batik & Karapan',
    desc: 'Pusat budaya Madura, terkenal dengan Batik Tulis dan tradisi Karapan Sapi yang mendunia.',
    highlights: ['Karapan Sapi', 'Batik Tulis', 'Api Abadi'],
  },
  {
    name: 'Sumenep', slug: 'sumenep', emoji: '🏛️', color: '#FACC15',
    tagline: 'Pusaka Budaya Tertinggi',
    desc: 'Ujung timur Madura dengan warisan kerajaan berusia ratusan tahun dan 126 pulau eksotis.',
    highlights: ['Keraton Sumenep', 'Batik Gentongan', '126 Pulau'],
  },
]

const wikiCategories = [
  { key: 'sejarah',    label: 'Sejarah',    emoji: '📜' },
  { key: 'budaya',     label: 'Budaya',     emoji: '🎭' },
  { key: 'kuliner',    label: 'Kuliner',    emoji: '🍜' },
  { key: 'wisata',     label: 'Wisata',     emoji: '🗺️' },
  { key: 'keunggulan', label: 'Keunggulan', emoji: '⭐' },
]

// ── STORY CARD ────────────────────────────────────────────────────────────────
function StoryCard({ story, onSelect }: { story: Story; onSelect: (s: Story) => void }) {
  const color = districtColor[story.district] || '#E11D48'
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(story)}
      className="w-full glass rounded-2xl overflow-hidden text-left group hover:border-white/20 transition-all"
    >
      {story.cover_image_url ? (
        <img src={story.cover_image_url} alt={story.title_id} className="w-full h-40 object-cover" />
      ) : (
        <div
          className="w-full h-40 flex items-center justify-center text-6xl"
          style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)` }}
        >
          📖
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
            style={{ borderColor: color + '40', color, backgroundColor: color + '10' }}
          >
            {story.district}
          </span>
          <div className="flex items-center gap-1 text-slate-600 text-[10px]">
            <Clock size={10} /> {story.read_time_minutes} menit
          </div>
        </div>
        <h3 className="font-bold text-base leading-snug mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
          {story.title_id}
        </h3>
        <p className="text-xs text-slate-400 italic mb-2 line-clamp-1">{story.title_madura}</p>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{story.synopsis_id}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/8">
          <div className="flex gap-1 flex-wrap">
            {story.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] bg-white/5 text-slate-600 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[#FACC15] text-[10px] font-semibold">
            <Star size={10} className="fill-[#FACC15]" /> +{story.xp_reward} XP
          </div>
        </div>
      </div>
    </motion.button>
  )
}

// ── STORY READER ──────────────────────────────────────────────────────────────
function StoryReader({ story, onClose }: { story: Story; onClose: () => void }) {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [lang, setLang] = useState<Lang>('id')
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showVocab, setShowVocab] = useState(false)
  const [finished, setFinished] = useState(false)
  const [xpGiven, setXpGiven] = useState(false)
  const [loading, setLoading] = useState(true)
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const supabase = createClient()
  const { profile, updateXP } = useUserStore()
  const color = districtColor[story.district] || '#E11D48'

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('story_paragraphs')
        .select('*')
        .eq('story_id', story.id)
        .order('order_index')
      if (data) setParagraphs(data)
      setLoading(false)
    }
    fetch()
  }, [story.id])

  useEffect(() => {
    if (!paragraphs.length) return
    const p = paragraphs[currentIdx]
    const text = lang === 'id' ? p.text_id : lang === 'en' ? p.text_en : p.text_madura
    setDisplayedText('')
    setIsTyping(true)
    setShowVocab(false)
    let i = 0
    typingRef.current = setInterval(() => {
      if (i < text.length) { setDisplayedText(text.slice(0, i + 1)); i++ }
      else { setIsTyping(false); clearInterval(typingRef.current!) }
    }, 22)
    return () => { if (typingRef.current) clearInterval(typingRef.current) }
  }, [currentIdx, lang, paragraphs])

  const skipTyping = () => {
    if (!isTyping) return
    if (typingRef.current) clearInterval(typingRef.current)
    const p = paragraphs[currentIdx]
    setDisplayedText(lang === 'id' ? p.text_id : lang === 'en' ? p.text_en : p.text_madura)
    setIsTyping(false)
  }

  const handleNext = async () => {
    if (isTyping) { skipTyping(); return }
    if (currentIdx < paragraphs.length - 1) {
      setCurrentIdx(i => i + 1)
    } else {
      setFinished(true)
      if (profile && !xpGiven) {
        await supabase.from('profiles').update({ xp: profile.xp + story.xp_reward }).eq('id', profile.id)
        updateXP(story.xp_reward)
        setXpGiven(true)
      }
    }
  }

  const handleShare = async () => {
    const text = `Saya baru membaca "${story.title_id}" di MaduLingo! 📖\n\nPlatform belajar bahasa & budaya Madura 🏝️\n\n#MaduLingo #BudayaMadura`
    if (navigator.share) { await navigator.share({ title: story.title_id, text }) }
    else { await navigator.clipboard.writeText(text); alert('Teks berhasil disalin!') }
  }

  const progress = paragraphs.length > 0 ? ((currentIdx + 1) / paragraphs.length) * 100 : 0
  const vocab = paragraphs[currentIdx]?.vocabulary_highlights || []

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0F172A] flex items-center justify-center z-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#E11D48] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 bg-[#0F172A] z-50 flex items-center justify-center px-4"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-80 h-80 rounded-full opacity-10 blur-[80px]" style={{ backgroundColor: color }} />
        </div>
        <div className="text-center max-w-sm relative z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="text-7xl mb-6">🎉</motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Cerita Selesai!
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-slate-400 text-sm mb-6">
            Kamu telah membaca<br /><strong className="text-white">{story.title_id}</strong>
          </motion.p>
          {profile && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Star size={20} className="text-[#FACC15] fill-[#FACC15]" />
                <span className="text-2xl font-bold text-[#FACC15]">+{story.xp_reward} XP</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">ditambahkan ke profilmu!</p>
            </motion.div>
          )}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="flex gap-3">
            <button onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 text-sm hover:bg-white/5 transition-all">
              <Share2 size={15} /> Bagikan
            </button>
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: color }}>
              Kembali
            </button>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-[#0F172A] z-50 flex flex-col">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] opacity-[0.06]"
          style={{ backgroundColor: color }} />
      </div>

      {/* Header */}
      <div className="px-4 pt-6 pb-3 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
          <p className="text-xs text-slate-500 truncate max-w-[180px]">{story.title_id}</p>
          <button onClick={handleShare} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            <Share2 size={18} />
          </button>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
            animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-600">{currentIdx + 1} / {paragraphs.length}</span>
          <span className="text-[10px] text-slate-600">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Lang switcher */}
      <div className="px-4 mb-4 relative z-10">
        <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl">
          {(Object.keys(langConfig) as Lang[]).map(l => (
            <button key={l} onClick={() => setLang(l)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${lang === l ? 'text-white' : 'text-slate-600'}`}
              style={lang === l ? { backgroundColor: color } : {}}>
              <span>{langConfig[l].flag}</span>
              <span className="hidden sm:block">{langConfig[l].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Story text */}
      <div className="flex-1 px-4 flex flex-col justify-center relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={currentIdx}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-3xl p-6 relative" onClick={skipTyping}>
            <div className="absolute top-4 left-5 text-6xl font-bold opacity-10 leading-none"
              style={{ color, fontFamily: 'serif' }}>"</div>
            <p className="text-white text-lg leading-relaxed relative z-10"
              style={{ fontFamily: lang === 'madura' ? 'serif' : 'DM Sans, sans-serif' }}>
              {displayedText}
              {isTyping && (
                <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-0.5 h-5 bg-white ml-0.5 align-middle" />
              )}
            </p>
            {!isTyping && <p className="text-[10px] text-slate-600 mt-3 text-right">Ketuk untuk melanjutkan...</p>}
          </motion.div>
        </AnimatePresence>

        {/* Vocab */}
        {!isTyping && vocab.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-3">
            <button onClick={() => setShowVocab(!showVocab)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-2">
              <Sparkles size={12} style={{ color }} />
              {vocab.length} kosakata baru
              <ChevronRight size={12} className={`transition-transform ${showVocab ? 'rotate-90' : ''}`} />
            </button>
            <AnimatePresence>
              {showVocab && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex gap-2 flex-wrap">
                    {vocab.map((v, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl px-3 py-2">
                        <p className="text-xs font-bold" style={{ color }}>{v.kata_madura}</p>
                        <p className="text-[10px] text-slate-400">{v.kata_id} · {v.arti}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-4 pb-8 pt-4 flex gap-3 relative z-10">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => currentIdx > 0 && setCurrentIdx(i => i - 1)}
          disabled={currentIdx === 0}
          className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center text-slate-500 disabled:opacity-30 hover:bg-white/5 transition-all">
          <ChevronLeft size={20} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleNext}
          className="flex-1 h-12 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all"
          style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}40` }}>
          {isTyping ? 'Lewati →'
            : currentIdx < paragraphs.length - 1 ? <><BookOpen size={16} /> Selanjutnya</>
            : <><Star size={16} /> Selesai & Klaim XP</>}
        </motion.button>
      </div>
    </motion.div>
  )
}

// ── CERITA TAB ────────────────────────────────────────────────────────────────
function CeritaTab() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [filterDistrict, setFilterDistrict] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('stories').select('*').order('order_index')
      if (data) setStories(data)
      setLoading(false)
    }
    fetch()
  }, [])

  const filtered = filterDistrict ? stories.filter(s => s.district === filterDistrict) : stories

  return (
    <div>
      <div className="glass rounded-2xl p-4 mb-5 border-l-2 border-[#FACC15]">
        <div className="flex items-center gap-2 mb-1">
          <BookMarked size={16} className="text-[#FACC15]" />
          <p className="text-sm font-semibold text-[#FACC15]">Cerita Rakyat Interaktif</p>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Baca cerita rakyat Madura dalam format visual novel. Tersedia dalam 3 bahasa dan dapatkan XP setiap cerita selesai!
        </p>
      </div>

      {/* District filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        <button onClick={() => setFilterDistrict(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${!filterDistrict ? 'bg-[#E11D48] text-white' : 'bg-white/5 text-slate-500'}`}>
          Semua
        </button>
        {Object.keys(districtColor).map(d => (
          <button key={d} onClick={() => setFilterDistrict(filterDistrict === d ? null : d)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={filterDistrict === d
              ? { backgroundColor: districtColor[d], color: '#fff' }
              : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
            {d}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="glass rounded-2xl h-64 animate-pulse" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((story, i) => (
            <motion.div key={story.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <StoryCard story={story} onSelect={setSelectedStory} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📖</div>
          <p className="text-slate-600 text-sm">Belum ada cerita tersedia</p>
        </div>
      )}

      <AnimatePresence>
        {selectedStory && <StoryReader story={selectedStory} onClose={() => setSelectedStory(null)} />}
      </AnimatePresence>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function WikiPage() {
  const [activeTab, setActiveTab] = useState<Tab>('wiki')

  return (
    <div className="min-h-screen bg-[#0F172A] text-white px-4 py-8 max-w-2xl mx-auto">

      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-8 transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Kembali
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#E11D48]/20 rounded-xl flex items-center justify-center">
            <BookOpen size={20} className="text-[#E11D48]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Madu<span className="text-[#E11D48]">Wiki</span>
            </h1>
            <p className="text-slate-500 text-xs">Ensiklopedia & Cerita Rakyat Madura</p>
          </div>
        </div>
      </motion.div>

      {/* Main Tab */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6 p-1 bg-white/5 rounded-2xl">
        <button onClick={() => setActiveTab('wiki')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'wiki' ? 'bg-[#E11D48] text-white' : 'text-slate-500'}`}>
          <BookOpen size={15} /> Ensiklopedia
        </button>
        <button onClick={() => setActiveTab('cerita')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'cerita' ? 'bg-[#E11D48] text-white' : 'text-slate-500'}`}>
          <ScrollText size={15} /> Cerita Rakyat
        </button>
      </motion.div>

      {/* Wiki Tab */}
      {activeTab === 'wiki' && (
        <motion.div key="wiki" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex gap-2 flex-wrap mb-6">
            {wikiCategories.map(c => (
              <span key={c.key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400">
                <span>{c.emoji}</span>{c.label}
              </span>
            ))}
          </div>
          <div className="space-y-4">
            {districts.map((d, i) => (
              <motion.div key={d.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link href={`/wiki/${d.slug}`}>
                  <motion.div whileTap={{ scale: 0.98 }}
                    className="glass rounded-2xl p-5 hover:border-white/20 transition-all group"
                    style={{ borderLeft: `3px solid ${d.color}` }}>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                        style={{ backgroundColor: d.color + '15' }}>{d.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h2 className="font-bold text-lg">{d.name}</h2>
                          <ChevronRight size={18} className="text-slate-600 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-xs font-medium mb-2" style={{ color: d.color }}>{d.tagline}</p>
                        <p className="text-slate-400 text-sm leading-relaxed mb-3">{d.desc}</p>
                        <div className="flex gap-2 flex-wrap">
                          {d.highlights.map(h => (
                            <span key={h} className="text-[10px] px-2 py-0.5 rounded-full border"
                              style={{ borderColor: d.color + '40', color: d.color, backgroundColor: d.color + '10' }}>{h}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-slate-700 text-xs mt-8">
            Konten MaduWiki dikurasi dari sumber terpercaya & pengetahuan lokal
          </p>
        </motion.div>
      )}

      {/* Cerita Tab */}
      {activeTab === 'cerita' && (
        <motion.div key="cerita" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}>
          <CeritaTab />
        </motion.div>
      )}
    </div>
  )
}

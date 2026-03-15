'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface WikiArticle {
  id: string
  district: string
  category: string
  title: string
  summary: string
  content: string
  image_url: string | null
  source: string
  order_index: number
}

// ── CONFIG ────────────────────────────────────────────────────────────────────
const districtConfig: Record<string, { emoji: string; color: string; tagline: string }> = {
  bangkalan:  { emoji: '🌅', color: '#E11D48', tagline: 'Pintu Gerbang Madura' },
  sampang:    { emoji: '🎭', color: '#7C3AED', tagline: 'Tanah Seni & Garam' },
  pamekasan:  { emoji: '👑', color: '#0EA5E9', tagline: 'Kota Batik & Karapan' },
  sumenep:    { emoji: '🏛️', color: '#FACC15', tagline: 'Pusaka Budaya Tertinggi' },
}

const categories = [
  { key: 'sejarah',    label: 'Sejarah',    emoji: '📜' },
  { key: 'budaya',     label: 'Budaya',     emoji: '🎭' },
  { key: 'kuliner',    label: 'Kuliner',    emoji: '🍜' },
  { key: 'wisata',     label: 'Wisata',     emoji: '🗺️' },
  { key: 'keunggulan', label: 'Keunggulan', emoji: '⭐' },
]

// ── ARTICLE CARD ──────────────────────────────────────────────────────────────
function ArticleCard({
  article,
  color,
  onSelect,
}: {
  article: WikiArticle
  color: string
  onSelect: (a: WikiArticle) => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(article)}
      className="w-full glass rounded-2xl p-4 text-left hover:border-white/20 transition-all group"
    >
      {/* Image placeholder / actual image */}
      {article.image_url ? (
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full h-36 object-cover rounded-xl mb-3"
        />
      ) : (
        <div
          className="w-full h-28 rounded-xl mb-3 flex items-center justify-center text-4xl"
          style={{ backgroundColor: color + '15' }}
        >
          {categories.find(c => c.key === article.category)?.emoji || '📄'}
        </div>
      )}

      <h3 className="font-semibold text-sm leading-snug mb-1.5">{article.title}</h3>
      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{article.summary}</p>

      <div className="flex items-center justify-between mt-3">
        <span
          className="text-[10px] px-2 py-0.5 rounded-full border"
          style={{ borderColor: color + '40', color, backgroundColor: color + '10' }}
        >
          {article.source === 'wikipedia' ? '🌐 Wikipedia' : '✍️ Redaksi'}
        </span>
        <span className="text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors">
          Baca selengkapnya →
        </span>
      </div>
    </motion.button>
  )
}

// ── ARTICLE MODAL ─────────────────────────────────────────────────────────────
function ArticleModal({
  article,
  color,
  onClose,
}: {
  article: WikiArticle
  color: string
  onClose: () => void
}) {
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
        className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto glass-dark rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        {article.image_url ? (
          <img src={article.image_url} alt={article.title} className="w-full h-48 object-cover rounded-t-3xl" />
        ) : (
          <div
            className="w-full h-32 rounded-t-3xl flex items-center justify-center text-6xl"
            style={{ backgroundColor: color + '20' }}
          >
            {categories.find(c => c.key === article.category)?.emoji || '📄'}
          </div>
        )}

        <div className="p-5">
          {/* Category badge */}
          <span
            className="text-[10px] px-2 py-0.5 rounded-full border mb-3 inline-block"
            style={{ borderColor: color + '40', color, backgroundColor: color + '10' }}
          >
            {categories.find(c => c.key === article.category)?.emoji}{' '}
            {categories.find(c => c.key === article.category)?.label}
          </span>

          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {article.title}
          </h2>

          <p className="text-slate-400 text-sm italic mb-4 leading-relaxed border-l-2 pl-3" style={{ borderColor: color }}>
            {article.summary}
          </p>

          <div className="h-px bg-white/10 mb-4" />

          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {article.content}
          </p>

          {/* Source */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-600">
              {article.source === 'wikipedia' ? '🌐 Sumber: Wikipedia' : '✍️ Sumber: Redaksi MaduWiki'}
            </span>
          </div>
        </div>

        {/* Close button */}
        <div className="sticky bottom-0 p-4 bg-gradient-to-t from-[#0F172A] to-transparent">
          <button
            onClick={onClose}
            className="w-full py-3 border border-white/20 rounded-xl text-sm hover:bg-white/5 transition-all"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function WikiDistrictPage() {
  const params = useParams()
  const slug = params.district as string
  const config = districtConfig[slug]

  const [articles, setArticles] = useState<WikiArticle[]>([])
  const [activeCategory, setActiveCategory] = useState('sejarah')
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const districtName = slug.charAt(0).toUpperCase() + slug.slice(1)

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('district', districtName)
        .order('order_index')

      if (data) setArticles(data)
      setLoading(false)
    }
    fetchArticles()
  }, [slug])

  const filtered = articles.filter(a => a.category === activeCategory)

  if (!config) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-slate-500">
        Kabupaten tidak ditemukan
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white max-w-2xl mx-auto">

      {/* Hero header */}
      <div
        className="px-4 pt-8 pb-6"
        style={{ background: `linear-gradient(to bottom, ${config.color}15, transparent)` }}
      >
        <Link
          href="/wiki"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-6 transition-colors group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          MaduWiki
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
            style={{ backgroundColor: config.color + '20' }}
          >
            {config.emoji}
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              {districtName}
            </h1>
            <p className="text-sm font-medium mt-0.5" style={{ color: config.color }}>
              {config.tagline}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Category tabs */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((c) => {
            const isActive = activeCategory === c.key
            const count = articles.filter(a => a.category === c.key).length
            return (
              <motion.button
                key={c.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(c.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'text-white'
                    : 'bg-white/5 text-slate-500 hover:text-slate-300'
                }`}
                style={isActive ? { backgroundColor: config.color, boxShadow: `0 0 15px ${config.color}40` } : {}}
              >
                <span>{c.emoji}</span>
                {c.label}
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20' : 'bg-white/10'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Articles */}
      <div className="px-4 pb-24">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="glass rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 gap-4"
            >
              {filtered.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  color={config.color}
                  onSelect={setSelectedArticle}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-slate-600 text-sm">Konten belum tersedia</p>
            <p className="text-slate-700 text-xs mt-1">Segera hadir...</p>
          </div>
        )}
      </div>

      {/* Article modal */}
      <AnimatePresence>
        {selectedArticle && (
          <ArticleModal
            article={selectedArticle}
            color={config.color}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

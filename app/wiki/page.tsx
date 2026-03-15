'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react'

const districts = [
  {
    name: 'Bangkalan',
    slug: 'bangkalan',
    emoji: '🌅',
    color: '#E11D48',
    tagline: 'Pintu Gerbang Madura',
    desc: 'Kabupaten paling barat Madura, rumah Jembatan Suramadu dan tradisi pesisir yang kaya.',
    highlights: ['Jembatan Suramadu', 'Bebek Songkem', 'Pantai Rongkang'],
  },
  {
    name: 'Sampang',
    slug: 'sampang',
    emoji: '🎭',
    color: '#7C3AED',
    tagline: 'Tanah Seni & Garam',
    desc: 'Sentra produksi garam terbesar Madura dengan kekayaan seni tari dan kuliner laut yang unik.',
    highlights: ['Garam Madura', 'Pantai Camplong', 'Lorjuk'],
  },
  {
    name: 'Pamekasan',
    slug: 'pamekasan',
    emoji: '👑',
    color: '#0EA5E9',
    tagline: 'Kota Batik & Karapan',
    desc: 'Pusat budaya Madura, terkenal dengan Batik Tulis dan tradisi Karapan Sapi yang mendunia.',
    highlights: ['Karapan Sapi', 'Batik Tulis', 'Api Abadi'],
  },
  {
    name: 'Sumenep',
    slug: 'sumenep',
    emoji: '🏛️',
    color: '#FACC15',
    tagline: 'Pusaka Budaya Tertinggi',
    desc: 'Ujung timur Madura dengan warisan kerajaan berusia ratusan tahun dan 126 pulau eksotis.',
    highlights: ['Keraton Sumenep', 'Batik Gentongan', '126 Pulau'],
  },
]

const categories = [
  { key: 'sejarah', label: 'Sejarah', emoji: '📜' },
  { key: 'budaya', label: 'Budaya', emoji: '🎭' },
  { key: 'kuliner', label: 'Kuliner', emoji: '🍜' },
  { key: 'wisata', label: 'Wisata', emoji: '🗺️' },
  { key: 'keunggulan', label: 'Keunggulan', emoji: '⭐' },
]

export default function WikiPage() {
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#E11D48]/20 rounded-xl flex items-center justify-center">
            <BookOpen size={20} className="text-[#E11D48]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Madu<span className="text-[#E11D48]">Wiki</span>
            </h1>
            <p className="text-slate-500 text-xs">Ensiklopedia Budaya Madura</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          Jelajahi kekayaan sejarah, budaya, kuliner, wisata, dan keunggulan
          dari 4 kabupaten di Pulau Madura.
        </p>
      </motion.div>

      {/* Category pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 flex-wrap mb-8"
      >
        {categories.map((c) => (
          <span
            key={c.key}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400"
          >
            <span>{c.emoji}</span>
            {c.label}
          </span>
        ))}
      </motion.div>

      {/* District cards */}
      <div className="space-y-4">
        {districts.map((d, i) => (
          <motion.div
            key={d.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.2 }}
          >
            <Link href={`/wiki/${d.slug}`}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="glass rounded-2xl p-5 hover:border-white/20 transition-all group"
                style={{ borderLeft: `3px solid ${d.color}` }}
              >
                <div className="flex items-start gap-4">
                  {/* Emoji */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ backgroundColor: d.color + '15' }}
                  >
                    {d.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="font-bold text-lg">{d.name}</h2>
                      <ChevronRight
                        size={18}
                        className="text-slate-600 group-hover:text-slate-300 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                    <p className="text-xs font-medium mb-2" style={{ color: d.color }}>
                      {d.tagline}
                    </p>
                    <p className="text-slate-400 text-sm leading-relaxed mb-3">
                      {d.desc}
                    </p>
                    {/* Highlight pills */}
                    <div className="flex gap-2 flex-wrap">
                      {d.highlights.map((h) => (
                        <span
                          key={h}
                          className="text-[10px] px-2 py-0.5 rounded-full border"
                          style={{ borderColor: d.color + '40', color: d.color, backgroundColor: d.color + '10' }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-slate-700 text-xs mt-10"
      >
        Konten MaduWiki dikurasi dari sumber terpercaya & pengetahuan lokal
      </motion.p>
    </div>
  )
}

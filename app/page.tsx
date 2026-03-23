'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Trophy, Zap, Star, ArrowRight, Globe, MessageCircle, BookMarked, ScrollText } from 'lucide-react'

const features = [
  { icon: BookOpen, title: 'Pelajaran Interaktif', desc: 'Quiz seru dengan suara & gambar', color: '#E11D48' },
  { icon: Trophy, title: 'Sistem Gamifikasi', desc: 'XP, koin, level, dan streak harian', color: '#FACC15' },
  { icon: Zap, title: 'Belajar Cepat', desc: 'Metode spaced repetition modern', color: '#7C3AED' },
  { icon: Star, title: 'Koleksi Pusaka', desc: 'Kumpulkan kartu budaya Madura', color: '#0EA5E9' },
]

const districts = [
  { name: 'Bangkalan', emoji: '🌅', color: '#E11D48' },
  { name: 'Sampang', emoji: '🎭', color: '#7C3AED' },
  { name: 'Pamekasan', emoji: '👑', color: '#0EA5E9' },
  { name: 'Sumenep', emoji: '🏛️', color: '#FACC15' },
]

const exploreLinks = [
  {
    href: '/wiki',
    emoji: '📚',
    title: 'MaduWiki',
    desc: 'Ensiklopedia budaya & sejarah Madura',
    color: '#0EA5E9',
  },
  {
    href: '/kosakata',
    emoji: '📖',
    title: 'Kosakata',
    desc: 'Kamus dua arah + Aksara Hanacaraka',
    color: '#7C3AED',
  },
  {
    href: '/tanya-tetua',
    emoji: '👴',
    title: 'Tanya Tetua',
    desc: 'Tanya AI Kiai Madura tentang budaya Madura',
    color: '#F97316',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-[#E11D48] opacity-[0.07] blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm mb-8"
          >
            <Globe size={14} className="text-[#FACC15]" />
            <span className="text-slate-300">Platform Belajar Budaya Madura #1</span>
          </motion.div>

          <h1
            className="text-6xl md:text-8xl font-bold mb-6 leading-none"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            <span className="text-white">Madu</span>
            <span className="text-[#E11D48]">Lingo</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-4 font-light">
            Belajar bahasa dan budaya Madura dengan cara yang
          </p>
          <p className="text-2xl md:text-3xl font-semibold text-[#FACC15] mb-10">
            menyenangkan & gamified 🎮
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 bg-[#E11D48] hover:bg-[#BE123C] rounded-2xl font-semibold text-white transition-all rose-glow"
              >
                Mulai Belajar Gratis <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold border border-white/20 hover:bg-white/5 transition-all"
              >
                Masuk
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 mt-16 flex-wrap justify-center"
        >
          {districts.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
            >
              <span>{d.emoji}</span>
              <span className="text-sm text-slate-300">{d.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-4 py-20 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-3xl font-bold text-center mb-12"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Kenapa <span className="text-[#E11D48]">MaduLingo</span>?
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: f.color + '20', color: f.color }}
              >
                <f.icon size={24} />
              </div>
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── EXPLORE SECTION ── */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Jelajahi <span className="text-[#FACC15]">Lebih Jauh</span>
          </h2>
          <p className="text-slate-500 text-sm">
            Fitur unggulan untuk memperdalam pengetahuan budaya Madura
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exploreLinks.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass rounded-2xl p-6 h-full cursor-pointer group transition-all hover:border-white/20"
                  style={{ borderLeft: `3px solid ${item.color}` }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
                    style={{ backgroundColor: item.color + '15' }}
                  >
                    {item.emoji}
                  </div>
                  <h3
                    className="font-bold text-lg mb-1"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {item.desc}
                  </p>
                  <div
                    className="flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all"
                    style={{ color: item.color }}
                  >
                    Buka sekarang
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="text-center py-10 border-t border-white/5 text-slate-600 text-sm">
        <p>© 2025 MaduLingo · Dibuat dengan ❤️ untuk Madura</p>
        <Link
          href="/developer"
          className="inline-flex items-center gap-1.5 mt-3 text-slate-700 hover:text-slate-400 transition-colors text-xs"
        >
          <span>👨‍💻</span> Tentang Developer
        </Link>
      </footer>

    </div>
  )
}

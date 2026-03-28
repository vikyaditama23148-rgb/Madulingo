'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

// ── QUOTES MADURA ─────────────────────────────────────────────────────────────
const quotes = [
  { madura: 'Ango\'an poteya tolang, etembheng poteya mata.', indonesia: 'Lebih baik putih tulang, daripada putih mata.' },
  { madura: 'Becce\' kalabun taman, becce\' oreng taman kanca.', indonesia: 'Indahnya taman karena bunganya, indahnya manusia karena temannya.' },
  { madura: 'Mon tak oning, tanya; mon tak bisa, balajhar.', indonesia: 'Jika tidak tahu, bertanya; jika tidak bisa, belajar.' },
]

// ── FITUR APP ─────────────────────────────────────────────────────────────────
const fitur = [
  { emoji: '📚', judul: 'Belajar Interaktif', deskripsi: 'Quiz seru & cerita rakyat 3 bahasa dari 4 kabupaten Madura' },
  { emoji: '🏆', judul: 'Gamifikasi', deskripsi: 'Kumpulkan XP, koin, hati, dan pusaka budaya langka' },
  { emoji: '🤖', judul: 'Tanya Tetua AI', deskripsi: 'Bertanya pada Kiai Madura virtual kapan saja' },
  { emoji: '🎬', judul: 'MaduTube', deskripsi: 'Video budaya, tradisi, dan wisata Madura' },
]

// ── KABUPATEN ─────────────────────────────────────────────────────────────────
const kabupaten = [
  { nama: 'Bangkalan', emoji: '🌊', color: '#0EA5E9', pos: { top: '42%', left: '12%' } },
  { nama: 'Sampang',   emoji: '🌾', color: '#34D399', pos: { top: '38%', left: '35%' } },
  { nama: 'Pamekasan', emoji: '🦅', color: '#FACC15', pos: { top: '34%', left: '57%' } },
  { nama: 'Sumenep',   emoji: '👑', color: '#E11D48', pos: { top: '30%', left: '76%' } },
]

// ── STEP CONFIG ───────────────────────────────────────────────────────────────
const TOTAL_STEPS = 4 // intro, peta, fitur, quote

interface Props {
  onComplete: () => void
}

export default function OnboardingCinematic({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [fiturIdx, setFiturIdx] = useState(0)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [kabupatenHover, setKabupatenHover] = useState<string | null>(null)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const router = useRouter()

  // Generate particles sekali saja di client
  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 4 + 3,
      }))
    )
  }, [])

  // Auto advance fitur
  useEffect(() => {
    if (step !== 2) return
    const t = setInterval(() => setFiturIdx(i => (i + 1) % fitur.length), 2500)
    return () => clearInterval(t)
  }, [step])

  // Auto advance quote
  useEffect(() => {
    if (step !== 3) return
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % quotes.length), 4000)
    return () => clearInterval(t)
  }, [step])

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1)
  }

  const handleComplete = () => {
    localStorage.setItem('madulingo_onboarded', 'true')
    onComplete()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ background: '#0F172A' }}
    >
      {/* ── BACKGROUND PARTICLES ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: '#E11D48',
              opacity: 0.15,
            }}
            animate={{ y: [-20, 20, -20], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Batik radial gradient */}
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, #E11D4808 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #FACC1508 0%, transparent 60%)',
          }}
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5 z-10">
        <motion.div
          className="h-full bg-gradient-to-r from-[#E11D48] to-[#FACC15]"
          animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* ── STEP DOTS ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === step ? 24 : 6, opacity: i <= step ? 1 : 0.3 }}
            transition={{ duration: 0.3 }}
            className="h-1.5 rounded-full bg-[#E11D48]"
          />
        ))}
      </div>

      {/* ── SKIP ── */}
      <button
        onClick={handleComplete}
        className="absolute top-4 right-4 z-10 text-xs text-slate-600 hover:text-slate-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
      >
        Lewati →
      </button>

      {/* ══════════════════════════════════════════
          STEP 0 — INTRO SPLASH
      ══════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          >
            {/* Logo animasi */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
              className="relative mb-8"
            >
              {/* Ring luar */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 -m-4 rounded-full border border-dashed border-[#E11D48]/20"
              />
              {/* Ring tengah */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 -m-2 rounded-full border border-dotted border-[#FACC15]/20"
              />

              <div className="w-28 h-28 rounded-3xl flex items-center justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #E11D48, #9F1239)' }}>
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 9px)',
                  }}
                />
                <span className="text-5xl relative z-10">🏝️</span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <h1 className="text-5xl font-black mb-2 tracking-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}>
                Madu<span className="text-[#E11D48]">Lingo</span>
              </h1>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#E11D48]" />
                <p className="text-xs text-[#FACC15] font-semibold tracking-widest uppercase">
                  Jelajahi Budaya Madura
                </p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#E11D48]" />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                Platform gamifikasi belajar bahasa & budaya Madura yang seru, interaktif, dan berkesan.
              </p>
            </motion.div>

            {/* Floating emojis */}
            {['🎭', '🥁', '⛵', '🌺', '📜'].map((emoji, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl select-none pointer-events-none"
                style={{
                  left: `${10 + i * 20}%`,
                  top: `${15 + (i % 2) * 60}%`,
                }}
                animate={{
                  y: [-10, 10, -10],
                  rotate: [-5, 5, -5],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
              >
                {emoji}
              </motion.span>
            ))}

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="mt-10 relative group"
            >
              <div className="absolute inset-0 rounded-2xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #E11D48, #FACC15)' }} />
              <div className="relative px-10 py-4 rounded-2xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #E11D48, #9F1239)' }}>
                ✨ Mulai Perjalanan
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            STEP 1 — PETA MADURA
        ══════════════════════════════════════════ */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <p className="text-xs text-[#FACC15] font-semibold tracking-widest uppercase mb-2">Mengenal Madura</p>
              <h2 className="text-3xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>
                4 Kabupaten,<br />
                <span className="text-[#E11D48]">Satu Jiwa</span>
              </h2>
            </motion.div>

            {/* Peta SVG Madura */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', damping: 20 }}
              className="relative w-full max-w-sm h-48 mb-6"
            >
              {/* Shape pulau Madura (simplified SVG) */}
              <svg viewBox="0 0 400 160" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 20px #E11D4830)' }}>
                <defs>
                  <linearGradient id="pulaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                {/* Outline pulau */}
                <path
                  d="M30,90 Q50,60 80,55 Q120,45 160,48 Q200,45 240,42 Q280,38 320,45 Q360,50 375,70 Q385,85 370,100 Q350,115 310,112 Q270,118 230,115 Q190,118 150,115 Q110,118 80,108 Q50,105 30,90 Z"
                  fill="url(#pulaGrad)"
                  stroke="#E11D48"
                  strokeWidth="1.5"
                  filter="url(#glow)"
                />
                {/* Divider garis kabupaten */}
                {[118, 215, 295].map((x, i) => (
                  <line key={i} x1={x} y1="50" x2={x} y2="112" stroke="#FACC15" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.4" />
                ))}
                {/* Label kabupaten */}
                {[
                  { x: 72, label: 'BKL' },
                  { x: 162, label: 'SMP' },
                  { x: 252, label: 'PMK' },
                  { x: 335, label: 'SNP' },
                ].map((item, i) => (
                  <text key={i} x={item.x} y="84" textAnchor="middle" fill="#94A3B8" fontSize="10" fontWeight="bold">
                    {item.label}
                  </text>
                ))}
              </svg>

              {/* Kabupaten pins */}
              {kabupaten.map((kab, i) => (
                <motion.button
                  key={kab.nama}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.15, type: 'spring' }}
                  onMouseEnter={() => setKabupatenHover(kab.nama)}
                  onMouseLeave={() => setKabupatenHover(null)}
                  className="absolute flex flex-col items-center"
                  style={{ ...kab.pos, transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div
                    animate={{ scale: kabupatenHover === kab.nama ? 1.3 : 1 }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg border-2"
                    style={{ background: kab.color + '20', borderColor: kab.color }}
                  >
                    {kab.emoji}
                  </motion.div>
                  <AnimatePresence>
                    {kabupatenHover === kab.nama && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute -top-8 whitespace-nowrap text-[10px] font-bold px-2 py-1 rounded-lg"
                        style={{ background: kab.color, color: '#fff' }}
                      >
                        {kab.nama}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* Pulse ring */}
                  <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    className="absolute w-8 h-8 rounded-full"
                    style={{ border: `1px solid ${kab.color}` }}
                  />
                </motion.button>
              ))}
            </motion.div>

            {/* Kabupaten list */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-sm mb-8">
              {kabupaten.map((kab, i) => (
                <motion.div
                  key={kab.nama}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="text-center p-2 rounded-xl"
                  style={{ background: kab.color + '10', border: `1px solid ${kab.color}30` }}
                >
                  <p className="text-lg mb-0.5">{kab.emoji}</p>
                  <p className="text-[9px] font-bold" style={{ color: kab.color }}>{kab.nama}</p>
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="px-10 py-3.5 rounded-2xl font-bold text-sm text-white rose-glow"
              style={{ background: 'linear-gradient(135deg, #E11D48, #9F1239)' }}
            >
              Selanjutnya →
            </motion.button>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            STEP 2 — FITUR APP
        ══════════════════════════════════════════ */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-10"
            >
              <p className="text-xs text-[#FACC15] font-semibold tracking-widest uppercase mb-2">Yang Bisa Kamu Lakukan</p>
              <h2 className="text-3xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>
                Semua Ada di<br />
                <span className="text-[#E11D48]">MaduLingo</span>
              </h2>
            </motion.div>

            {/* Featured fitur (auto-rotate) */}
            <div className="relative w-full max-w-sm h-44 mb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={fiturIdx}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 rounded-3xl p-6 flex flex-col items-center justify-center text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(225,29,72,0.15), rgba(15,23,42,0.8))',
                    border: '1px solid rgba(225,29,72,0.2)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    {fitur[fiturIdx].emoji}
                  </motion.div>
                  <h3 className="text-xl font-black mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {fitur[fiturIdx].judul}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {fitur[fiturIdx].deskripsi}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots indicator */}
            <div className="flex gap-2 mb-8">
              {fitur.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setFiturIdx(i)}
                  animate={{ width: i === fiturIdx ? 20 : 6, backgroundColor: i === fiturIdx ? '#E11D48' : '#334155' }}
                  transition={{ duration: 0.3 }}
                  className="h-1.5 rounded-full"
                />
              ))}
            </div>

            {/* Mini grid semua fitur */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-sm mb-8">
              {fitur.map((f, i) => (
                <motion.button
                  key={f.judul}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  onClick={() => setFiturIdx(i)}
                  className="p-2 rounded-xl text-center transition-all"
                  style={{
                    background: fiturIdx === i ? 'rgba(225,29,72,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${fiturIdx === i ? '#E11D48' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <p className="text-xl mb-0.5">{f.emoji}</p>
                  <p className="text-[9px] text-slate-500 font-medium leading-tight">{f.judul}</p>
                </motion.button>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="px-10 py-3.5 rounded-2xl font-bold text-sm text-white rose-glow"
              style={{ background: 'linear-gradient(135deg, #E11D48, #9F1239)' }}
            >
              Selanjutnya →
            </motion.button>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            STEP 3 — QUOTE + CTA AKHIR
        ══════════════════════════════════════════ */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          >
            {/* Dekorasi atas */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute top-16 right-8 w-20 h-20 rounded-full border border-dashed border-[#FACC15]/15"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-32 left-6 w-14 h-14 rounded-full border border-dotted border-[#E11D48]/15"
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <p className="text-xs text-[#FACC15] font-semibold tracking-widest uppercase mb-2">Kata Bijak Madura</p>
              <div className="w-8 h-0.5 bg-[#E11D48] mx-auto" />
            </motion.div>

            {/* Quote card */}
            <div className="relative w-full max-w-sm h-48 mb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIdx}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 rounded-3xl p-6 flex flex-col justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(250,204,21,0.08), rgba(225,29,72,0.08))',
                    border: '1px solid rgba(250,204,21,0.15)',
                  }}
                >
                  {/* Tanda kutip dekorasi */}
                  <span className="absolute top-4 left-5 text-4xl text-[#FACC15] opacity-20 font-serif leading-none">"</span>
                  <span className="absolute bottom-4 right-5 text-4xl text-[#FACC15] opacity-20 font-serif leading-none rotate-180">"</span>

                  <p className="text-base font-bold mb-3 leading-relaxed px-2"
                    style={{ fontFamily: 'Playfair Display, serif', color: '#FACC15' }}>
                    {quotes[quoteIdx].madura}
                  </p>
                  <p className="text-xs text-slate-400 italic px-2">
                    {quotes[quoteIdx].indonesia}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Quote dots */}
            <div className="flex gap-2 mb-10">
              {quotes.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: i === quoteIdx ? 1 : 0.3, scale: i === quoteIdx ? 1.3 : 1 }}
                  className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"
                />
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-sm space-y-3"
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleComplete}
                className="w-full relative group py-4 rounded-2xl font-black text-base text-white overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #E11D48, #9F1239)' }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #9F1239, #E11D48)' }}
                />
                <span className="relative">🚀 Mulai Belajar Sekarang</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleComplete}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm text-slate-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Masuk ke Akun Saya
              </motion.button>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-[10px] text-slate-700 tracking-widest uppercase"
            >
              Lestarikan Budaya · Kuasai Bahasa · Banggakan Madura
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

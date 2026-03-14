'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  ExternalLink,
  CheckCircle2,
  Clock,
  BookMarked,
  Linkedin,
  Instagram,
  MapPin,
  GraduationCap,
  Crown,
  Users,
  Sparkles,
} from 'lucide-react'

// ── DATA ──────────────────────────────────────────────────────────────────────

const developer = {
  name: 'Viky Aditama',
  role: 'Fullstack Developer & Educator',
  bio: 'Saya bukan orang terkenal juga bukan orang yang berpengaruh, tapi setidaknya apa yang saya buat detik ini akan dikenal suatu saat di masa depan.',
  location: 'Sumenep, Madura',
  avatar: 'VA',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/viky-aditama', icon: Linkedin, color: '#0A66C2' },
    { label: 'Instagram', href: 'https://www.instagram.com/vkyadtm', icon: Instagram, color: '#E1306C' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@vixssy.x', icon: null, tiktokSvg: true, color: '#ffffff' },
    { label: 'Email', href: 'mailto:vikyaditama23148@gmail.com', icon: Mail, color: '#E11D48' },
  ],
}

const roles = [
  { icon: GraduationCap, label: 'Calon Guru Sekolah Dasar', color: '#60A5FA' },
  { icon: Crown, label: 'Duta Kampus Univ. PGRI Sumenep 2023/2026', color: '#FACC15' },
  { icon: Sparkles, label: 'Duta Budaya Madura 2024/2025', color: '#E11D48' },
  { icon: Users, label: 'Ketua Umum KEMUT Group', color: '#34D399' },
]

const techStack = [
  { name: 'Next.js 15', category: 'Frontend', color: '#ffffff', emoji: '▲' },
  { name: 'TypeScript', category: 'Language', color: '#3B82F6', emoji: '⟨⟩' },
  { name: 'Tailwind CSS', category: 'Styling', color: '#38BDF8', emoji: '🎨' },
  { name: 'Framer Motion', category: 'Animation', color: '#A78BFA', emoji: '✦' },
  { name: 'Supabase', category: 'Backend', color: '#3ECF8E', emoji: '⚡' },
  { name: 'PostgreSQL', category: 'Database', color: '#60A5FA', emoji: '🗄️' },
  { name: 'Zustand', category: 'State', color: '#FB923C', emoji: '⚙️' },
  { name: 'Vercel', category: 'Deploy', color: '#ffffff', emoji: '🚀' },
  { name: 'PWA', category: 'Mobile', color: '#34D399', emoji: '📱' },
  { name: 'Git & GitHub', category: 'Version Control', color: '#F97316', emoji: '🔀' },
]

const features = [
  { name: 'Landing Page & Branding', status: 'done' },
  { name: 'Autentikasi (Email & Google)', status: 'done' },
  { name: 'Auto-create profil saat signup', status: 'done' },
  { name: 'Dashboard Bento Grid', status: 'done' },
  { name: 'Jalur Madura (4 Kabupaten)', status: 'done' },
  { name: 'Quiz Engine (Multiple Choice)', status: 'done' },
  { name: 'Word Sort Quiz', status: 'done' },
  { name: 'Sistem XP & Level Otomatis', status: 'done' },
  { name: 'Sistem Hati (Hearts/Lives)', status: 'done' },
  { name: 'Koin & Reward', status: 'done' },
  { name: 'Leaderboard Real-time', status: 'done' },
  { name: 'Pusaka Cards (Collectibles)', status: 'done' },
  { name: 'PWA (Installable)', status: 'done' },
  { name: 'Row Level Security (RLS)', status: 'done' },
  { name: 'Match the Image Quiz', status: 'wip' },
  { name: 'Web Speech API (Pronunciation)', status: 'wip' },
  { name: 'Audio Pronunciation (.mp3)', status: 'wip' },
  { name: 'Daily Streak System', status: 'wip' },
  { name: 'Notifikasi & Reminder', status: 'planned' },
  { name: 'Mode Offline (Service Worker)', status: 'planned' },
  { name: 'Admin Panel Konten', status: 'planned' },
  { name: 'Animasi Level-Up Cinematic', status: 'planned' },
]

const statusConfig = {
  done: { label: 'Selesai', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  wip:  { label: 'Proses',  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   icon: Clock },
  planned: { label: 'Rencana', color: 'text-slate-500', bg: 'bg-white/3 border-white/8', icon: BookMarked },
}

const doneCount    = features.filter(f => f.status === 'done').length
const wipCount     = features.filter(f => f.status === 'wip').length
const plannedCount = features.filter(f => f.status === 'planned').length
const progressPct  = Math.round((doneCount / features.length) * 100)

// ── TIKTOK ICON ───────────────────────────────────────────────────────────────
function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  )
}

// ── ANIMATION VARIANT (FIX: gunakan 'easeOut' string, bukan array angka) ──────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.5,
      ease: 'easeOut',   // ← PERBAIKAN: string bukan [0.22, 1, 0.36, 1]
    },
  }),
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white px-4 py-8 max-w-2xl mx-auto">

      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-10 transition-colors group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke MaduLingo
        </Link>
      </motion.div>

      {/* ── HERO PROFILE ── */}
      <motion.section initial="hidden" animate="show" className="mb-10">

        <motion.div custom={0} variants={fadeUp} className="flex items-start gap-5 mb-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E11D48] to-[#9F1239] flex items-center justify-center text-2xl font-bold shadow-lg rose-glow">
              {developer.avatar}
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#0F172A]" />
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-3xl font-bold leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              {developer.name}
            </h1>
            <p className="text-[#E11D48] text-sm font-medium mt-0.5">{developer.role}</p>
            <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-xs">
              <MapPin size={12} />
              {developer.location}
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div custom={1} variants={fadeUp}>
          <div className="glass rounded-2xl px-5 py-4 border-l-2 border-[#E11D48]">
            <p className="text-slate-300 text-sm leading-relaxed italic">
              &ldquo;{developer.bio}&rdquo;
            </p>
          </div>
        </motion.div>
      </motion.section>

      {/* ── IDENTITAS ── */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
        <motion.h2 custom={0} variants={fadeUp} className="section-title">Identitas</motion.h2>
        <div className="grid grid-cols-1 gap-2">
          {roles.map((r, i) => (
            <motion.div key={r.label} custom={i + 1} variants={fadeUp} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: r.color + '18', color: r.color }}>
                <r.icon size={16} />
              </div>
              <span className="text-sm text-slate-300">{r.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── TECH STACK ── */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
        <motion.h2 custom={0} variants={fadeUp} className="section-title">Tech Stack</motion.h2>
        <div className="flex flex-wrap gap-2">
          {techStack.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i * 0.5 + 1}
              variants={fadeUp}
              className="glass rounded-xl px-3.5 py-2 flex items-center gap-2 cursor-default"
            >
              <span className="text-base leading-none">{t.emoji}</span>
              <div>
                <p className="text-xs font-semibold" style={{ color: t.color }}>{t.name}</p>
                <p className="text-[10px] text-slate-600">{t.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── FITUR & PROGRES ── */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
        <motion.h2 custom={0} variants={fadeUp} className="section-title">Fitur & Progres</motion.h2>

        {/* Overview card */}
        <motion.div custom={1} variants={fadeUp} className="glass rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">Progress Keseluruhan</span>
            <span className="text-2xl font-bold text-[#FACC15]">{progressPct}%</span>
          </div>
          <div className="h-2.5 bg-white/8 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #E11D48, #FACC15)' }}
              initial={{ width: 0 }}
              whileInView={{ width: `${progressPct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { count: doneCount,    label: 'Selesai', color: '#34D399' },
              { count: wipCount,     label: 'Proses',  color: '#FBBF24' },
              { count: plannedCount, label: 'Rencana', color: '#475569' },
            ].map(s => (
              <div key={s.label} className="bg-white/3 rounded-xl py-2.5">
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.count}</p>
                <p className="text-[10px] text-slate-600">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature list */}
        <div className="space-y-1.5">
          {features.map((f, i) => {
            const cfg = statusConfig[f.status as keyof typeof statusConfig]
            return (
              <motion.div
                key={f.name}
                custom={i * 0.3 + 2}
                variants={fadeUp}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${cfg.bg}`}
              >
                <cfg.icon size={14} className={cfg.color} />
                <span className={`text-sm flex-1 ${f.status === 'planned' ? 'text-slate-600' : 'text-slate-300'}`}>
                  {f.name}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* ── KONTRIBUTOR ── */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
        <motion.h2 custom={0} variants={fadeUp} className="section-title">Kontributor</motion.h2>
        <motion.div custom={1} variants={fadeUp}>
          <div className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#9F1239] flex items-center justify-center text-lg font-bold flex-shrink-0 rose-glow">
              VA
            </div>
            <div>
              <p className="font-semibold">{developer.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">Founder · Designer · Developer</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[10px] bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20 px-2 py-0.5 rounded-full">Solo Project</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Active</span>
              </div>
            </div>
          </div>
          <p className="text-center text-slate-700 text-xs mt-4 py-3 border border-dashed border-white/8 rounded-xl">
            Tertarik berkontribusi? Hubungi via email atau LinkedIn 👇
          </p>
        </motion.div>
      </motion.section>

      {/* ── SOSIAL MEDIA ── */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
        <motion.h2 custom={0} variants={fadeUp} className="section-title">Hubungi Saya</motion.h2>
        <div className="grid grid-cols-2 gap-3">
          {developer.socials.map((s, i) => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              custom={i + 1}
              variants={fadeUp}
              whileTap={{ scale: 0.96 }}
              className="glass rounded-xl px-4 py-3.5 flex items-center gap-3 hover:border-white/20 transition-all group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: s.color + '18', color: s.color }}
              >
                {s.tiktokSvg
                  ? <TikTokIcon size={16} />
                  : s.icon ? <s.icon size={16} /> : null
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-[10px] text-slate-600 truncate">
                  {s.href.replace('mailto:', '').replace('https://', '')}
                </p>
              </div>
              <ExternalLink size={12} className="text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0" />
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* ── FOOTER ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center py-6 border-t border-white/5"
      >
        <p className="text-slate-700 text-xs">
          MaduLingo · Dibuat dengan <span className="text-[#E11D48]">❤️</span> oleh{' '}
          <span className="text-slate-500">Viky Aditama</span> untuk Madura
        </p>
      </motion.footer>

      <style jsx global>{`
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.875rem;
          padding-left: 0.75rem;
          border-left: 2px solid #E11D48;
        }
      `}</style>
    </div>
  )
}
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Search, BookOpen, X, ExternalLink, Volume2, ScrollText } from 'lucide-react'
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
  enjak_iya: string | null
  engghi_enten: string | null
  engghi_bhunten: string | null
  kbbi_url: string | null
  audio_url: string | null
}

// ── HANACARAKA DATA ───────────────────────────────────────────────────────────

const sejarahHanacaraka = `Aksara Hanacaraka (juga dikenal sebagai Aksara Jawa) adalah sistem tulisan abugida yang telah digunakan di Pulau Jawa dan Madura selama berabad-abad. Aksara ini berkembang dari aksara Brahmi India melalui aksara Pallawa dan Kawi.

Di Pulau Madura, aksara ini dikenal dengan nama Aksara Carakan Madura dan memiliki kemiripan dengan aksara Jawa, namun dengan beberapa perbedaan dalam bentuk dan penggunaannya yang disesuaikan dengan fonetik bahasa Madura.

Nama "Hanacaraka" sendiri berasal dari lima aksara pertama: Ha-Na-Ca-Ra-Ka, yang menurut legenda merupakan pesan dari Ki Ageng Sela yang bermakna "ada utusan (yang) berperang".

Aksara ini ditulis dari kiri ke kanan dan termasuk jenis aksara silabis (setiap aksara mewakili suku kata dengan vokal inheren "a"). Untuk mengubah bunyi vokal, digunakan tanda baca khusus yang disebut Sandhangan.

Saat ini aksara Hanacaraka masih dipelajari di sekolah-sekolah di Jawa dan Madura sebagai bagian dari muatan lokal, dan telah mendapat pengakuan resmi dalam standar Unicode sejak tahun 2008.`

const aksaraUtama = [
  { aksara: 'ꦲ', latin: 'ha', contoh: 'hawa', arti: 'udara' },
  { aksara: 'ꦤ', latin: 'na', contoh: 'nasi', arti: 'nasi' },
  { aksara: 'ꦕ', latin: 'ca', contoh: 'cabe', arti: 'cabai' },
  { aksara: 'ꦫ', latin: 'ra', contoh: 'ratu', arti: 'ratu' },
  { aksara: 'ꦏ', latin: 'ka', contoh: 'kali', arti: 'sungai' },
  { aksara: 'ꦢ', latin: 'da', contoh: 'dara', arti: 'merpati' },
  { aksara: 'ꦠ', latin: 'ta', contoh: 'tali', arti: 'tali' },
  { aksara: 'ꦱ', latin: 'sa', contoh: 'sapi', arti: 'sapi' },
  { aksara: 'ꦮ', latin: 'wa', contoh: 'watu', arti: 'batu' },
  { aksara: 'ꦭ', latin: 'la', contoh: 'laut', arti: 'laut' },
  { aksara: 'ꦥ', latin: 'pa', contoh: 'pari', arti: 'padi' },
  { aksara: 'ꦝ', latin: 'dha', contoh: 'dhara', arti: 'tanah' },
  { aksara: 'ꦗ', latin: 'ja', contoh: 'jamu', arti: 'jamu' },
  { aksara: 'ꦪ', latin: 'ya', contoh: 'yuda', arti: 'perang' },
  { aksara: 'ꦚ', latin: 'nya', contoh: 'nyawa', arti: 'nyawa' },
  { aksara: 'ꦩ', latin: 'ma', contoh: 'mata', arti: 'mata' },
  { aksara: 'ꦒ', latin: 'ga', contoh: 'gajah', arti: 'gajah' },
  { aksara: 'ꦧ', latin: 'ba', contoh: 'batu', arti: 'batu' },
  { aksara: 'ꦛ', latin: 'tha', contoh: 'thari', arti: 'menari' },
  { aksara: 'ꦔ', latin: 'nga', contoh: 'ngaji', arti: 'mengaji' },
]

const sandhangan = [
  {
    nama: 'Wulu',
    simbol: 'ꦶ',
    fungsi: 'Mengubah vokal menjadi "i"',
    contoh: 'ꦏꦶ',
    baca: 'ki',
    keterangan: 'Ditulis di atas aksara',
  },
  {
    nama: 'Suku',
    simbol: 'ꦸ',
    fungsi: 'Mengubah vokal menjadi "u"',
    contoh: 'ꦏꦸ',
    baca: 'ku',
    keterangan: 'Ditulis di bawah aksara',
  },
  {
    nama: 'Taling',
    simbol: 'ꦺ',
    fungsi: 'Mengubah vokal menjadi "e" (terbuka)',
    contoh: 'ꦺꦏ',
    baca: 'ke',
    keterangan: 'Ditulis di depan aksara',
  },
  {
    nama: 'Pepet',
    simbol: 'ꦼ',
    fungsi: 'Mengubah vokal menjadi "ê" (schwa)',
    contoh: 'ꦏꦼ',
    baca: 'kê',
    keterangan: 'Ditulis di atas aksara',
  },
  {
    nama: 'Layar',
    simbol: 'ꦂ',
    fungsi: 'Menambahkan konsonan "r" di akhir suku kata',
    contoh: 'ꦏꦂ',
    baca: 'kar',
    keterangan: 'Ditulis di atas aksara',
  },
  {
    nama: 'Wignyan',
    simbol: 'ꦃ',
    fungsi: 'Menambahkan konsonan "h" di akhir suku kata',
    contoh: 'ꦏꦃ',
    baca: 'kah',
    keterangan: 'Ditulis setelah aksara',
  },
  {
    nama: 'Cecak',
    simbol: 'ꦁ',
    fungsi: 'Menambahkan konsonan "ng" di akhir suku kata',
    contoh: 'ꦏꦁ',
    baca: 'kang',
    keterangan: 'Ditulis di atas aksara',
  },
  {
    nama: 'Pangkon',
    simbol: 'ꦀ',
    fungsi: 'Mematikan vokal (konsonan tanpa vokal)',
    contoh: 'ꦏ꧀',
    baca: 'k',
    keterangan: 'Ditulis setelah aksara',
  },
]

// ── KUIS DATA (hanya yang valid) ──────────────────────────────────────────────
const kuisData = [
  { soal: 'ꦲ', jawaban: 'ha', pilihan: ['ha', 'na', 'ca', 'ra'] },
  { soal: 'ꦤ', jawaban: 'na', pilihan: ['ka', 'na', 'da', 'ta'] },
  { soal: 'ꦕ', jawaban: 'ca', pilihan: ['ra', 'pa', 'ca', 'ja'] },
  { soal: 'ꦫ', jawaban: 'ra', pilihan: ['ra', 'sa', 'wa', 'la'] },
  { soal: 'ꦏ', jawaban: 'ka', pilihan: ['ma', 'ga', 'ba', 'ka'] },
  { soal: 'ꦢ', jawaban: 'da', pilihan: ['da', 'ta', 'sa', 'wa'] },
  { soal: 'ꦠ', jawaban: 'ta', pilihan: ['la', 'ta', 'pa', 'ja'] },
  { soal: 'ꦱ', jawaban: 'sa', pilihan: ['sa', 'ya', 'nya', 'ma'] },
  { soal: 'ꦮ', jawaban: 'wa', pilihan: ['nga', 'ga', 'wa', 'ba'] },
  { soal: 'ꦭ', jawaban: 'la', pilihan: ['la', 'dha', 'tha', 'nga'] },
  { soal: 'ꦥ', jawaban: 'pa', pilihan: ['pa', 'ja', 'ya', 'nya'] },
  { soal: 'ꦩ', jawaban: 'ma', pilihan: ['ma', 'ga', 'ba', 'tha'] },
]

// ── VOCAB CONFIG ──────────────────────────────────────────────────────────────
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
  'enjak-iya':      { label: 'Enjak-Iya',      color: '#34D399' },
  'engghi-enten': { label: 'Engghi-Enten', color: '#FACC15' },
  'engghi-bhunten':   { label: 'Engghi-Bhunten',   color: '#E11D48' },
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
          <p className="text-sm font-medium" style={{ color: kat.color }}>{word.kata_indonesia}</p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{word.definisi}</p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {word.audio_url && <Volume2 size={14} className="text-slate-600" />}
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

// ── WORD MODAL ────────────────────────────────────────────────────────────────
function WordModal({ word, onClose }: { word: VocabWord; onClose: () => void }) {
  const kat = kategoriConfig[word.kategori] || kategoriConfig.umum

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-lg glass-dark rounded-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="glass rounded-xl p-4">
  <p className="text-xs text-slate-500 mb-3">Tingkat Bahasa</p>
  <div className="space-y-2">
    {[
      { label: 'Enjak-Iya',       color: '#34D399', value: word.enjak_iya },
      { label: 'Engghi-Enten',    color: '#FACC15', value: word.engghi_enten },
      { label: 'Engghi-Bhunten',  color: '#E11D48', value: word.engghi_bhunten },
    ].map(t => (
      <div key={t.label} className="flex items-center gap-3">
        <span className="text-xs font-bold w-32 flex-shrink-0"
          style={{ color: t.color }}>
          {t.label}
        </span>
        <span className="text-sm text-white font-semibold">
          {t.value || <span className="text-slate-600 font-normal italic">—</span>}
        </span>
      </div>
    ))}
  </div>
</div>

        <div className="px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Definisi</p>
            <p className="text-sm text-slate-300">{word.definisi}</p>
          </div>

          {word.contoh_madura && (
            <div className="glass rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-2">Contoh Kalimat</p>
              <p className="text-sm font-semibold mb-1">🗣️ {word.contoh_madura}</p>
              {word.contoh_indonesia && (
                <p className="text-xs text-slate-400 italic">📝 {word.contoh_indonesia}</p>
              )}
            </div>
          )}

          {word.audio_url ? (
            <button
              onClick={() => new Audio(word.audio_url!).play()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E11D48]/30 bg-[#E11D48]/10 text-[#E11D48] text-sm font-semibold hover:bg-[#E11D48]/20 transition-all"
            >
              <Volume2 size={16} /> Dengarkan Pengucapan
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/8 text-slate-700 text-sm">
              <Volume2 size={16} /> Audio belum tersedia
            </div>
          )}

          {word.kbbi_url ? (
            <a href={word.kbbi_url} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition-all">
              <BookOpen size={16} /> Lihat di KBBI Resmi <ExternalLink size={12} />
            </a>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/8 text-slate-700 text-sm">
              <BookOpen size={16} /> Tidak tersedia di KBBI
            </div>
          )}

          <button onClick={onClose}
            className="w-full py-3 border border-white/10 rounded-xl text-sm hover:bg-white/5 transition-all text-slate-400">
            Tutup
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── HANACARAKA TAB ────────────────────────────────────────────────────────────
function HanacarakaTab() {
  const [activeSection, setActiveSection] = useState<'sejarah' | 'aksara' | 'sandhangan' | 'kuis'>('sejarah')
  const [kuisIdx, setKuisIdx] = useState(0)
  const [shuffledKuis] = useState(() => [...kuisData].sort(() => Math.random() - 0.5))
  const [dipilih, setDipilih] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [kuisSelesai, setKuisSelesai] = useState(false)

  const sections = [
    { key: 'sejarah',    label: 'Sejarah',    emoji: '📜' },
    { key: 'aksara',     label: '20 Aksara',  emoji: '✍️' },
    { key: 'sandhangan', label: 'Sandhangan', emoji: '◌' },
    { key: 'kuis',       label: 'Kuis',       emoji: '🎯' },
  ]

  const handleJawab = (pilihan: string) => {
    if (dipilih) return
    setDipilih(pilihan)
    if (pilihan === shuffledKuis[kuisIdx].jawaban) setScore(s => s + 1)
  }

  const handleNext = () => {
    if (kuisIdx < shuffledKuis.length - 1) {
      setKuisIdx(i => i + 1)
      setDipilih(null)
    } else {
      setKuisSelesai(true)
    }
  }

  const resetKuis = () => {
    setKuisIdx(0)
    setDipilih(null)
    setScore(0)
    setKuisSelesai(false)
  }

  return (
    <div>
      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key as any)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeSection === s.key
                ? 'bg-[#E11D48] text-white'
                : 'bg-white/5 text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>{s.emoji}</span> {s.label}
          </button>
        ))}
      </div>

      {/* SEJARAH */}
      {activeSection === 'sejarah' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#E11D48]/20 rounded-xl flex items-center justify-center text-2xl">
                📜
              </div>
              <div>
                <h2 className="font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Sejarah Aksara Hanacaraka
                </h2>
                <p className="text-xs text-slate-500">Warisan budaya Jawa & Madura</p>
              </div>
            </div>
            {sejarahHanacaraka.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm text-slate-300 leading-relaxed mb-3 last:mb-0">
                {para}
              </p>
            ))}
          </div>

          {/* Info box */}
          <div className="glass rounded-2xl p-4 border-l-2 border-[#FACC15]">
            <p className="text-xs text-[#FACC15] font-semibold mb-1">💡 Tahukah kamu?</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aksara Hanacaraka telah resmi terdaftar dalam standar Unicode sejak tahun 2008
              dengan kode blok U+A980–U+A9DF, memastikan aksara ini dapat ditampilkan
              di seluruh perangkat digital modern.
            </p>
          </div>
        </motion.div>
      )}

      {/* 20 AKSARA UTAMA */}
      {activeSection === 'aksara' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Hanacaraka terdiri dari 20 aksara dasar. Setiap aksara secara inheren mengandung
            vokal "a" kecuali dimodifikasi dengan sandhangan.
          </p>

          <div className="grid grid-cols-4 gap-2">
            {aksaraUtama.map((item, i) => (
              <motion.div
                key={item.latin}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="glass rounded-2xl p-3 text-center"
              >
                <div
                  className="text-4xl mb-1 font-bold"
                  style={{ fontFamily: 'serif', color: '#E11D48' }}
                >
                  {item.aksara}
                </div>
                <p className="text-xs font-bold text-white">{item.latin}</p>
                <div className="mt-1.5 pt-1.5 border-t border-white/10">
                  <p className="text-[10px] text-slate-500">{item.contoh}</p>
                  <p className="text-[10px] text-slate-600">{item.arti}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass rounded-xl p-4 mt-4 border-l-2 border-[#E11D48]">
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-[#E11D48] font-semibold">Urutan:</span>{' '}
              ha-na-ca-ra-ka / da-ta-sa-wa-la / pa-dha-ja-ya-nya / ma-ga-ba-tha-nga
            </p>
          </div>
        </motion.div>
      )}

      {/* SANDHANGAN */}
      {activeSection === 'sandhangan' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Sandhangan adalah tanda diakritik yang digunakan untuk mengubah bunyi vokal
            inheren "a" pada aksara dasar menjadi vokal lain, atau menambahkan konsonan
            penutup suku kata.
          </p>

          <div className="space-y-3">
            {sandhangan.map((item, i) => (
              <motion.div
                key={item.nama}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-center gap-4">
                  {/* Simbol besar */}
                  <div className="w-14 h-14 bg-[#E11D48]/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl" style={{ color: '#E11D48' }}>{item.simbol}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-sm">{item.nama}</h3>
                      <span className="text-xs text-slate-600">{item.keterangan}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{item.fungsi}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl" style={{ fontFamily: 'serif' }}>{item.contoh}</span>
                        <span className="text-xs text-[#FACC15] font-semibold">= "{item.baca}"</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass rounded-xl p-4 mt-4 border-l-2 border-[#FACC15]">
            <p className="text-xs text-[#FACC15] font-semibold mb-1">⚠️ Catatan Penting</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Penggunaan sandhangan dalam aksara Madura dapat sedikit berbeda dengan aksara Jawa.
              Konten ini akan diverifikasi lebih lanjut bersama ahli bahasa Madura.
            </p>
          </div>
        </motion.div>
      )}

      {/* KUIS */}
      {activeSection === 'kuis' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {kuisSelesai ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">
                {score >= 10 ? '🏆' : score >= 7 ? '⭐' : '📚'}
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Kuis Selesai!
              </h3>
              <p className="text-slate-400 mb-2">Skor kamu</p>
              <p className="text-5xl font-bold text-[#FACC15] mb-1">{score}</p>
              <p className="text-slate-500 text-sm mb-6">dari {shuffledKuis.length} soal</p>

              <div className="glass rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-slate-500 mb-1">Keterangan:</p>
                {score >= 10 && <p className="text-sm text-emerald-400">🏆 Luar biasa! Kamu sangat menguasai aksara Hanacaraka!</p>}
                {score >= 7 && score < 10 && <p className="text-sm text-[#FACC15]">⭐ Bagus! Terus berlatih untuk hasil lebih baik.</p>}
                {score < 7 && <p className="text-sm text-slate-400">📚 Pelajari lagi aksara dasar, kamu pasti bisa!</p>}
              </div>

              <button
                onClick={resetKuis}
                className="w-full py-3 bg-[#E11D48] rounded-xl font-semibold text-sm rose-glow"
              >
                Ulangi Kuis
              </button>
            </div>
          ) : (
            <div>
              {/* Progress */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">
                  Soal {kuisIdx + 1} / {shuffledKuis.length}
                </span>
                <span className="text-xs text-[#FACC15] font-semibold">
                  Skor: {score}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
                <motion.div
                  className="h-full bg-[#E11D48] rounded-full"
                  animate={{ width: `${((kuisIdx + 1) / shuffledKuis.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Soal */}
              <div className="glass rounded-2xl p-6 text-center mb-5">
                <p className="text-xs text-slate-500 mb-3">Aksara ini berbunyi apa?</p>
                <div
                  className="text-8xl font-bold"
                  style={{ fontFamily: 'serif', color: '#E11D48' }}
                >
                  {shuffledKuis[kuisIdx].soal}
                </div>
              </div>

              {/* Pilihan */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {shuffledKuis[kuisIdx].pilihan.map(p => {
                  const isSelected = dipilih === p
                  const isCorrect = p === shuffledKuis[kuisIdx].jawaban
                  let style = 'bg-white/5 border-white/10 text-white'
                  if (dipilih) {
                    if (isCorrect) style = 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    else if (isSelected) style = 'bg-red-500/20 border-red-500 text-red-400'
                    else style = 'bg-white/3 border-white/5 text-slate-600'
                  }
                  return (
                    <motion.button
                      key={p}
                      whileTap={{ scale: dipilih ? 1 : 0.95 }}
                      onClick={() => handleJawab(p)}
                      className={`py-3 rounded-xl border font-bold text-lg transition-all ${style}`}
                    >
                      {p}
                    </motion.button>
                  )
                })}
              </div>

              {/* Feedback & next */}
              <AnimatePresence>
                {dipilih && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className={`rounded-xl p-3 mb-3 ${
                      dipilih === shuffledKuis[kuisIdx].jawaban
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                      <p className={`text-sm font-semibold ${
                        dipilih === shuffledKuis[kuisIdx].jawaban ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {dipilih === shuffledKuis[kuisIdx].jawaban
                          ? '✅ Benar!'
                          : `❌ Jawaban benar: ${shuffledKuis[kuisIdx].jawaban}`
                        }
                      </p>
                    </div>
                    <button
                      onClick={handleNext}
                      className="w-full py-3 bg-[#E11D48] rounded-xl font-semibold text-sm rose-glow"
                    >
                      {kuisIdx < shuffledKuis.length - 1 ? 'Soal Berikutnya →' : 'Lihat Hasil 🎉'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function KosakataPage() {
  const [activeTab, setActiveTab] = useState<'kosakata' | 'hanacaraka'>('kosakata')
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
      const { data } = await supabase.from('vocabulary').select('*').order('kata_madura')
      if (data) { setWords(data); setFiltered(data) }
      setLoading(false)
    }
    fetchWords()
  }, [])

  const applyFilter = useCallback((q: string, letter: string | null, kat: string | null, mode: 'madura' | 'indonesia') => {
    let result = [...words]
    if (q) {
      result = result.filter(w =>
        mode === 'madura'
          ? w.kata_madura.toLowerCase().includes(q.toLowerCase())
          : w.kata_indonesia.toLowerCase().includes(q.toLowerCase())
      )
    }
    if (letter) result = result.filter(w => w.kata_madura.toUpperCase().startsWith(letter))
    if (kat) result = result.filter(w => w.kategori === kat)
    setFiltered(result)
  }, [words])

  useEffect(() => {
    applyFilter(search, activeLetter, activeKategori, searchMode)
  }, [search, activeLetter, activeKategori, searchMode, applyFilter])

  const availableLetters = new Set(words.map(w => w.kata_madura[0].toUpperCase()))

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

      {/* Main Tab Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6 p-1 bg-white/5 rounded-2xl"
      >
        <button
          onClick={() => setActiveTab('kosakata')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'kosakata' ? 'bg-[#E11D48] text-white shadow-lg' : 'text-slate-500'
          }`}
        >
          <BookOpen size={15} /> Kosakata
        </button>
        <button
          onClick={() => setActiveTab('hanacaraka')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'hanacaraka' ? 'bg-[#E11D48] text-white shadow-lg' : 'text-slate-500'
          }`}
        >
          <ScrollText size={15} /> Hanacaraka
        </button>
      </motion.div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">

        {/* KOSAKATA TAB */}
        {activeTab === 'kosakata' && (
          <motion.div
            key="kosakata"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Search mode toggle */}
            <div className="flex gap-2 mb-3">
              {(['madura', 'indonesia'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setSearchMode(mode)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    searchMode === mode ? 'bg-[#E11D48] text-white' : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {mode === 'madura' ? '🗣️ Cari Kata Madura' : '🇮🇩 Cari Kata Indonesia'}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-4">
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
            </div>

            {/* Alphabet */}
            <div className="mb-4">
              <p className="text-xs text-slate-600 mb-2">Browse per huruf:</p>
              <div className="flex flex-wrap gap-1.5">
                {ALPHABET.map(letter => {
                  const hasWords = availableLetters.has(letter)
                  const isActive = activeLetter === letter
                  return (
                    <button
                      key={letter}
                      onClick={() => hasWords && (setActiveLetter(activeLetter === letter ? null : letter), setSearch(''))}
                      disabled={!hasWords}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        isActive ? 'bg-[#E11D48] text-white rose-glow'
                          : hasWords ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                          : 'bg-white/2 text-slate-700 cursor-not-allowed'
                      }`}
                    >
                      {letter}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Kategori filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
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
            </div>

            {/* Results */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500">{filtered.length} kata ditemukan</p>
              {(search || activeLetter || activeKategori) && (
                <button
                  onClick={() => { setSearch(''); setActiveLetter(null); setActiveKategori(null) }}
                  className="text-xs text-[#E11D48] hover:underline"
                >
                  Reset filter
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="glass rounded-2xl h-20 animate-pulse" />)}
              </div>
            ) : filtered.length > 0 ? (
              <div className="space-y-2">
                {filtered.map((word, i) => (
                  <motion.div key={word.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <WordCard word={word} onSelect={setSelectedWord} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-slate-600 text-sm">Kata tidak ditemukan</p>
              </div>
            )}
          </motion.div>
        )}

        {/* HANACARAKA TAB */}
        {activeTab === 'hanacaraka' && (
          <motion.div
            key="hanacaraka"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <HanacarakaTab />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word modal */}
      <AnimatePresence>
        {selectedWord && <WordModal word={selectedWord} onClose={() => setSelectedWord(null)} />}
      </AnimatePresence>
    </div>
  )
}

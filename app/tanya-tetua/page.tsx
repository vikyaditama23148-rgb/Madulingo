'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Send, Sparkles, Clock, Trash2,
  BookOpen, ChevronDown, Star, History, TrendingUp,
  RefreshCw, AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/userStore'

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'tetua'
  text: string
  from_cache?: boolean
  timestamp: Date
}

interface PopularQuestion {
  pertanyaan: string
  hit_count: number
  kategori: string
}

interface HistoryItem {
  id: string
  pertanyaan: string
  jawaban: string
  from_cache: boolean
  created_at: string
}

// ── LIMITS ────────────────────────────────────────────────────────────────────
const GUEST_LIMIT = 3
const USER_LIMIT = 20

// ── SUGGESTED QUESTIONS ───────────────────────────────────────────────────────
const SUGGESTED = [
  'Apa itu Karapan Sapi?',
  'Bagaimana cara salam dalam bahasa Madura?',
  'Apa makanan khas Madura?',
  'Ceritakan tentang Batik Madura',
  'Apa keunikan Sumenep?',
  'Bagaimana sejarah Jembatan Suramadu?',
]

// ── PARTICLE BACKGROUND ───────────────────────────────────────────────────────
function ParticlesBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: i % 3 === 0 ? '#E11D48' : i % 3 === 1 ? '#FACC15' : '#F97316',
            opacity: 0.3,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ── MESSAGE BUBBLE ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl"
          style={{ background: 'linear-gradient(135deg, #92400e, #78350f)', boxShadow: '0 0 15px rgba(146,64,14,0.4)' }}>
          👴
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'rounded-tr-sm text-white'
              : 'rounded-tl-sm text-slate-100'
          }`}
          style={
            isUser
              ? { background: 'linear-gradient(135deg, #E11D48, #9F1239)' }
              : { background: 'linear-gradient(135deg, rgba(146,64,14,0.3), rgba(120,53,15,0.2))', border: '1px solid rgba(146,64,14,0.3)' }
          }
        >
          {msg.text}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2">
          {!isUser && msg.from_cache && (
            <span className="flex items-center gap-1 text-[10px] text-amber-600">
              <BookOpen size={9} /> Dari pustakawan
            </span>
          )}
          <span className="text-[10px] text-slate-700">
            {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function TanyaTetuaPage() {
  const { profile } = useUserStore()
  const supabase = createClient()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activePanel, setActivePanel] = useState<'chat' | 'popular' | 'history'>('chat')
  const [popular, setPopular] = useState<PopularQuestion[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [usageCount, setUsageCount] = useState(0)
  const [guestCount, setGuestCount] = useState(0)
  const [error, setError] = useState('')
  const [showSuggested, setShowSuggested] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const isLoggedIn = !!profile
  const limit = isLoggedIn ? USER_LIMIT : GUEST_LIMIT
  const used = isLoggedIn ? usageCount : guestCount
  const remaining = limit - used
  const limitReached = remaining <= 0

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load data
  useEffect(() => {
    loadPopular()
    if (profile) {
      loadUsage()
      loadHistory()
    }
    // Load guest count from localStorage
    const saved = localStorage.getItem('tanya_tetua_guest')
    if (saved) setGuestCount(parseInt(saved) || 0)
  }, [profile])

  const loadPopular = async () => {
    const res = await fetch('/api/tanya-tetua?type=popular')
    const { data } = await res.json()
    if (data) setPopular(data)
  }

  const loadUsage = async () => {
    if (!profile) return
    const res = await fetch(`/api/tanya-tetua?type=usage&userId=${profile.id}`)
    const { count } = await res.json()
    setUsageCount(count || 0)
  }

  const loadHistory = async () => {
    if (!profile) return
    const res = await fetch(`/api/tanya-tetua?type=history&userId=${profile.id}`)
    const { data } = await res.json()
    if (data) setHistory(data)
  }

  const clearHistory = async () => {
    if (!profile) return
    if (!confirm('Hapus semua riwayat chat?')) return
    await supabase.from('ai_chat_history').delete().eq('user_id', profile.id)
    setHistory([])
  }

  const handleSend = async (question?: string) => {
    const text = question || input.trim()
    if (!text || loading) return
    if (limitReached) {
      setError(isLoggedIn
        ? `Jatah harianmu sudah habis (${limit} chat/hari). Kembali lagi besok pukul 00.00 WIB! 🌙`
        : `Kamu sudah menggunakan ${GUEST_LIMIT} chat gratis. Login untuk mendapat ${USER_LIMIT} chat/hari! 🔑`
      )
      return
    }

    setInput('')
    setError('')
    setShowSuggested(false)
    setLoading(true)

    // Tambah pesan user
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await fetch('/api/tanya-tetua', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pertanyaan: text,
          userId: profile?.id || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setError(data.message || 'Jatah chat habis')
        } else {
          setError(data.error || 'Terjadi kesalahan')
        }
        setLoading(false)
        return
      }

      // Tambah pesan tetua
      const tetuaMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'tetua',
        text: data.jawaban,
        from_cache: data.from_cache,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, tetuaMsg])

      // Update usage
      if (data.jatah_digunakan) {
        if (isLoggedIn) {
          setUsageCount(prev => prev + 1)
        } else {
          const newCount = guestCount + 1
          setGuestCount(newCount)
          localStorage.setItem('tanya_tetua_guest', String(newCount))
        }
      }

      // Refresh history
      if (isLoggedIn) loadHistory()

    } catch {
      setError('Gagal terhubung ke server. Coba lagi!')
    }

    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen text-white flex flex-col" style={{
      background: 'linear-gradient(180deg, #1a0a00 0%, #0F172A 40%, #0a0f1e 100%)'
    }}>
      {/* Particles */}
      <ParticlesBg />

      {/* Batik overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #FACC15 0px, #FACC15 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(-45deg, #E11D48 0px, #E11D48 1px, transparent 1px, transparent 20px)`,
        }}
      />

      {/* ── HEADER ── */}
      <div className="relative z-10 px-4 pt-6 pb-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={20} />
          </Link>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            {([
              { key: 'chat', icon: '💬', label: 'Chat' },
              { key: 'popular', icon: '🔥', label: 'Populer' },
              { key: 'history', icon: '📜', label: 'Riwayat' },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActivePanel(tab.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activePanel === tab.key ? 'text-white' : 'text-slate-500'
                }`}
                style={activePanel === tab.key ? { backgroundColor: 'rgba(146,64,14,0.6)' } : {}}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          {/* Elder avatar */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl mb-3 relative"
            style={{
              background: 'linear-gradient(135deg, #92400e, #78350f)',
              boxShadow: '0 0 30px rgba(146,64,14,0.5), 0 0 60px rgba(146,64,14,0.2)',
            }}
          >
            👴
            {/* Glow ring */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl border-2"
              style={{ borderColor: '#FACC15' }}
            />
          </motion.div>

          <h1 className="text-2xl font-bold mb-0.5" style={{ fontFamily: 'Playfair Display, serif' }}>
            Tanya <span style={{ color: '#FACC15' }}>Tetua</span>
          </h1>
          <p className="text-xs text-slate-500">Kiai Madura · Penjaga Ilmu Budaya</p>

          {/* Usage bar */}
          <div className="mt-3 flex items-center gap-2 justify-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Sparkles size={11} style={{ color: '#FACC15' }} />
              <span className={remaining <= 2 ? 'text-red-400' : 'text-slate-300'}>
                {isLoggedIn ? `${remaining}/${limit} chat tersisa hari ini` : `${remaining}/${limit} chat gratis`}
              </span>
            </div>
            {!isLoggedIn && (
              <Link href="/login">
                <span className="text-[10px] px-2 py-1 rounded-full text-amber-400 border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 transition-all cursor-pointer">
                  Login → {USER_LIMIT} chat/hari
                </span>
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 relative z-10 px-4 max-w-2xl mx-auto w-full flex flex-col overflow-hidden">

        {/* CHAT PANEL */}
        {activePanel === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-hide">

              {/* Welcome message */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl"
                    style={{ background: 'linear-gradient(135deg, #92400e, #78350f)' }}>
                    👴
                  </div>
                  <div className="flex-1 px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed text-slate-100"
                    style={{ background: 'linear-gradient(135deg, rgba(146,64,14,0.3), rgba(120,53,15,0.2))', border: '1px solid rgba(146,64,14,0.3)' }}>
                    <p className="mb-2">
                      <em>"Anakku, selamat datang di ruang ilmu."</em>
                    </p>
                    <p className="text-slate-400 text-xs">
                      Aku Kiai Madura, penjaga ilmu budaya Madura. Tanyakan padaku tentang bahasa, tradisi, sejarah, kuliner, atau apapun tentang Tanah Madura yang mulia ini.
                    </p>
                  </div>
                </motion.div>
              )}

              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

              {/* Loading */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl"
                    style={{ background: 'linear-gradient(135deg, #92400e, #78350f)' }}>
                    👴
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
                    style={{ background: 'rgba(146,64,14,0.2)', border: '1px solid rgba(146,64,14,0.3)' }}>
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: '#FACC15' }}
                          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                      <span className="text-xs text-slate-500 ml-1">Tetua sedang berpikir...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2 px-4 py-3 rounded-2xl text-sm"
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-xs leading-relaxed">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions */}
            <AnimatePresence>
              {showSuggested && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-3"
                >
                  <p className="text-xs text-slate-600 mb-2">Pertanyaan yang sering ditanyakan:</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {SUGGESTED.map((q, i) => (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSend(q)}
                        disabled={limitReached}
                        className="flex-shrink-0 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white transition-all disabled:opacity-40"
                        style={{ backgroundColor: 'rgba(146,64,14,0.15)', border: '1px solid rgba(146,64,14,0.3)' }}
                      >
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input area */}
            <div className="pb-6">
              <div className="flex gap-2 items-end p-1 rounded-2xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={limitReached ? 'Jatah chat habis...' : 'Tanyakan tentang Madura...'}
                  disabled={limitReached || loading}
                  rows={1}
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none resize-none disabled:opacity-40"
                  style={{ maxHeight: '100px', minHeight: '40px' }}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading || limitReached}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5 transition-all disabled:opacity-30"
                  style={{
                    background: input.trim() && !loading && !limitReached
                      ? 'linear-gradient(135deg, #92400e, #78350f)'
                      : 'rgba(255,255,255,0.05)',
                    boxShadow: input.trim() ? '0 0 15px rgba(146,64,14,0.4)' : 'none'
                  }}
                >
                  <Send size={16} />
                </motion.button>
              </div>
              <p className="text-[10px] text-slate-700 text-center mt-1.5">
                Enter untuk kirim · Shift+Enter untuk baris baru
              </p>
            </div>
          </div>
        )}

        {/* POPULAR PANEL */}
        {activePanel === 'popular' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-8">
            <p className="text-sm text-slate-400 mb-4">
              Pertanyaan yang paling sering ditanyakan kepada Kiai Madura:
            </p>
            {popular.length === 0 ? (
              <div className="text-center py-10 text-slate-600">
                <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada data populer</p>
              </div>
            ) : (
              <div className="space-y-2">
                {popular.map((item, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setActivePanel('chat'); handleSend(item.pertanyaan) }}
                    className="w-full text-left p-4 rounded-2xl flex items-center gap-3 hover:border-amber-800/40 transition-all"
                    style={{ backgroundColor: 'rgba(146,64,14,0.1)', border: '1px solid rgba(146,64,14,0.2)' }}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: 'rgba(146,64,14,0.3)', color: '#FACC15' }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 line-clamp-2">{item.pertanyaan}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        🔥 {item.hit_count}x ditanyakan · {item.kategori}
                      </p>
                    </div>
                    <Send size={14} className="text-slate-600 flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* HISTORY PANEL */}
        {activePanel === 'history' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-8">
            {!isLoggedIn ? (
              <div className="text-center py-16">
                <History size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-slate-500 text-sm mb-3">Login untuk melihat riwayat chat</p>
                <Link href="/login">
                  <button className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'linear-gradient(135deg, #92400e, #78350f)' }}>
                    Login Sekarang
                  </button>
                </Link>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-16 text-slate-600">
                <History size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada riwayat chat</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-400">{history.length} riwayat chat</p>
                  <button onClick={clearHistory}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 size={12} /> Hapus Semua
                  </button>
                </div>
                <div className="space-y-3">
                  {history.map((item, i) => (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="p-4 rounded-2xl"
                      style={{ backgroundColor: 'rgba(146,64,14,0.08)', border: '1px solid rgba(146,64,14,0.15)' }}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: 'rgba(146,64,14,0.3)', color: '#FACC15' }}>
                          Kamu
                        </span>
                        <p className="text-sm text-slate-300 flex-1">{item.pertanyaan}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                          style={{ backgroundColor: 'rgba(120,53,15,0.4)', color: '#F97316' }}>
                          Tetua
                        </span>
                        <p className="text-xs text-slate-500 line-clamp-2 flex-1">{item.jawaban}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock size={9} className="text-slate-700" />
                        <span className="text-[10px] text-slate-700">
                          {new Date(item.created_at).toLocaleString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        {item.from_cache && (
                          <span className="text-[10px] text-amber-700 flex items-center gap-0.5">
                            <BookOpen size={8} /> Dari pustakawan
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

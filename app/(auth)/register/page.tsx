'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Chrome, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  const handleGoogleRegister = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-bold mb-2">Cek Email Kamu!</h2>
          <p className="text-slate-400 mb-6">
            Kami kirim link verifikasi ke <strong className="text-white">{email}</strong>
          </p>
          <Link href="/login" className="text-[#E11D48] hover:underline text-sm">
            Kembali ke halaman masuk
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-[#E11D48] opacity-[0.06] blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm transition-colors">
          <ArrowLeft size={16} />
          Kembali
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Bergabung! 🎉
          </h1>
          <p className="text-slate-400">Mulai perjalanan belajar bahasa Madura-mu</p>
        </div>

        <div className="glass rounded-2xl p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Nama</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkapmu"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@kamu.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  minLength={6}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E11D48] hover:bg-[#BE123C] rounded-xl font-semibold text-sm transition-all disabled:opacity-50 rose-glow"
            >
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-600">atau</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleRegister}
            className="w-full py-3 rounded-xl font-semibold text-sm border border-white/10 hover:bg-white/5 flex items-center justify-center gap-2 transition-all"
          >
            <Chrome size={16} />
            Daftar dengan Google
          </motion.button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-[#E11D48] hover:underline">
            Masuk
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

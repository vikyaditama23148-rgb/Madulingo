'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Chrome, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
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
        {/* Back button */}
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm transition-colors">
          <ArrowLeft size={16} />
          Kembali
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span className="text-[#E11D48]">Madu</span>Lingo
          </h1>
          <p className="text-slate-400">Selamat datang kembali! 👋</p>
        </div>

        {/* Glass card */}
        <div className="glass rounded-2xl p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E11D48] hover:bg-[#BE123C] rounded-xl font-semibold text-sm transition-all disabled:opacity-50 rose-glow"
            >
              {loading ? 'Memuat...' : 'Masuk'}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-600">atau</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            className="w-full py-3 rounded-xl font-semibold text-sm border border-white/10 hover:bg-white/5 flex items-center justify-center gap-2 transition-all"
          >
            <Chrome size={16} />
            Masuk dengan Google
          </motion.button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-[#E11D48] hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

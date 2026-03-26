'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Shield, Lock } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied' | 'not_logged_in'>('checking')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const check = async () => {
      // Cek apakah sudah login
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setStatus('not_logged_in')
        router.push('/login')
        return
      }

      // Cek apakah is_admin = true
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, username')
        .eq('id', user.id)
        .single()

      if (profile?.is_admin === true) {
        setStatus('allowed')
      } else {
        setStatus('denied')
      }
    }
    check()
  }, [])

  // Loading
  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-[#E11D48] border-t-transparent rounded-full mx-auto mb-3"
          />
          <p className="text-slate-500 text-sm">Memeriksa akses...</p>
        </div>
      </div>
    )
  }

  // Bukan admin
  if (status === 'denied') {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Akses Ditolak</h2>
          <p className="text-slate-400 text-sm mb-6">
            Kamu tidak memiliki izin untuk mengakses halaman admin.
            Hubungi administrator jika kamu merasa ini keliru.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#E11D48] rounded-xl text-sm font-semibold rose-glow"
          >
            Kembali ke Beranda
          </button>
        </motion.div>
      </div>
    )
  }

  if (status !== 'allowed') return null

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Admin top bar */}
      <div className="glass-dark border-b border-white/8 px-4 py-3 flex items-center gap-2">
        <Shield size={16} className="text-[#E11D48]" />
        <span className="text-sm font-semibold">MaduLingo Admin</span>
        <span className="text-xs text-slate-500 ml-2">Panel Kelola Konten</span>
      </div>
      {children}
    </div>
  )
}

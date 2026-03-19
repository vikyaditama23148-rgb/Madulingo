'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setAllowed(true)
      }
      setChecking(false)
    }
    check()
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#E11D48] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!allowed) return null

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

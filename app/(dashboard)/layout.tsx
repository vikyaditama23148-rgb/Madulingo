'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutDashboard, Map, Trophy, Package, BookOpen, Languages } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/userStore'

const navItems = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Beranda'  },
  { href: '/learn',        icon: Map,             label: 'Belajar'  },
  { href: '/wiki',         icon: BookOpen,        label: 'Wiki'     },
  { href: '/kosakata',     icon: Languages,       label: 'Kosakata' },
  { href: '/leaderboard',  icon: Trophy,          label: 'Papan'    },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { setProfile } = useUserStore()
  const supabase = createClient()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) setProfile(profile)
    }
    loadUser()
  }, [])

  return (
    <div className="min-h-screen bg-[#0F172A] pb-24">
      {children}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4">
        <div className="glass-dark rounded-2xl flex items-center gap-1 px-2 py-2 w-full max-w-sm">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#E11D48] text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="text-[9px] font-medium">{item.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

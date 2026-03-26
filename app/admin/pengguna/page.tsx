'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, X, Users, Star, Flame, Shield, ShieldOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  username: string
  avatar_url: string | null
  xp: number
  coins: number
  level: number
  streak: number
  is_admin: boolean
  created_at: string
}

function getLevelTitle(level: number): string {
  const titles = ['Pemula', 'Pelajar', 'Santri', 'Pengenal', 'Ahli Bahasa', 'Duta Budaya', 'Empu Madura', 'Penjaga Tradisi', 'Maestro', 'Legenda Madura']
  return titles[Math.min(level - 1, titles.length - 1)]
}

export default function AdminPenggunaPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filtered, setFiltered] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('xp', { ascending: false })
    if (data) { setUsers(data); setFiltered(data) }
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(users); return }
    const q = search.toLowerCase()
    setFiltered(users.filter(u => u.username.toLowerCase().includes(q)))
  }, [search, users])

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`${currentStatus ? 'Cabut' : 'Berikan'} hak admin untuk user ini?`)) return
    setTogglingId(userId)
    await supabase.from('profiles').update({ is_admin: !currentStatus }).eq('id', userId)
    await fetchUsers()
    setTogglingId(null)
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Kelola <span className="text-[#E11D48]">Pengguna</span>
            </h1>
            <p className="text-xs text-slate-500">{users.length} pengguna terdaftar</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total User', value: users.length, color: '#34D399' },
          { label: 'Admin', value: users.filter(u => u.is_admin).length, color: '#E11D48' },
          { label: 'Aktif (streak > 0)', value: users.filter(u => u.streak > 0).length, color: '#FACC15' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-3 text-center">
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari username..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors" />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            <X size={14} />
          </button>
        )}
      </div>

      <p className="text-xs text-slate-600 mb-3">{filtered.length} pengguna ditemukan</p>

      {/* User list */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="glass rounded-xl h-16 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-slate-600 text-sm">Belum ada pengguna</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user, i) => (
            <motion.div key={user.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className={`glass rounded-xl px-4 py-3 flex items-center gap-3 ${user.is_admin ? 'border-l-2 border-[#E11D48]' : ''}`}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#9F1239] flex items-center justify-center text-sm font-bold flex-shrink-0">
                {user.username[0]?.toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{user.username}</p>
                  {user.is_admin && (
                    <span className="text-[10px] bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Star size={9} className="text-[#FACC15]" />
                    {user.xp} XP · Lv.{user.level} {getLevelTitle(user.level)}
                  </span>
                  {user.streak > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-orange-400">
                      <Flame size={9} /> {user.streak} hari
                    </span>
                  )}
                </div>
              </div>

              {/* Toggle admin */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleAdmin(user.id, user.is_admin)}
                disabled={togglingId === user.id}
                title={user.is_admin ? 'Cabut hak admin' : 'Jadikan admin'}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0 ${
                  user.is_admin
                    ? 'bg-[#E11D48]/10 hover:bg-[#E11D48]/20 text-[#E11D48]'
                    : 'bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white'
                }`}
              >
                {user.is_admin ? <ShieldOff size={14} /> : <Shield size={14} />}
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Note */}
      <div className="glass rounded-xl p-4 mt-6 border-l-2 border-[#FACC15]">
        <p className="text-xs text-[#FACC15] font-semibold mb-1">💡 Kelola Hak Admin</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          Klik ikon <span className="text-white">🛡️</span> untuk memberikan hak admin kepada pengguna,
          atau klik <span className="text-white">🚫</span> untuk mencabut hak admin.
          Admin dapat mengakses seluruh panel pengelolaan konten.
        </p>
      </div>
    </div>
  )
}

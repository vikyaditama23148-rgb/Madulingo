'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Lock, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/userStore'

interface Collectible {
  id: string
  name: string
  image_url: string | null
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlock_condition: string
}

const rarityConfig = {
  common: { label: 'Biasa', color: '#94A3B8', bg: 'bg-slate-500/10 border-slate-500/20', glow: '' },
  rare: { label: 'Langka', color: '#60A5FA', bg: 'bg-blue-500/10 border-blue-500/20', glow: '0 0 15px rgba(96,165,250,0.3)' },
  epic: { label: 'Epik', color: '#A855F7', bg: 'bg-purple-500/10 border-purple-500/20', glow: '0 0 15px rgba(168,85,247,0.3)' },
  legendary: { label: 'Legendaris', color: '#FACC15', bg: 'bg-yellow-500/10 border-yellow-500/20', glow: '0 0 20px rgba(250,204,21,0.4)' },
}

const rarityEmojis: Record<string, string> = {
  Celurit: '⚔️',
  Batik: '🎨',
  Karapan: '🐂',
  Topeng: '🎭',
  Songket: '🪡',
}

function getEmoji(name: string): string {
  const key = Object.keys(rarityEmojis).find(k => name.includes(k))
  return key ? rarityEmojis[key] : '🏺'
}

export default function CollectiblesPage() {
  const { profile } = useUserStore()
  const [collectibles, setCollectibles] = useState<Collectible[]>([])
  const [ownedIds, setOwnedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Collectible | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!profile) return
    const fetchData = async () => {
      const [{ data: cols }, { data: inv }] = await Promise.all([
        supabase.from('collectibles').select('*').order('rarity'),
        supabase.from('user_inventory').select('collectible_id').eq('user_id', profile.id),
      ])
      if (cols) setCollectibles(cols)
      if (inv) setOwnedIds(inv.map((i: any) => i.collectible_id))
      setLoading(false)
    }
    fetchData()
  }, [profile])

  const owned = collectibles.filter(c => ownedIds.includes(c.id))
  const locked = collectibles.filter(c => !ownedIds.includes(c.id))

  return (
    <div className="px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
          <Sparkles size={20} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            Pusaka <span className="text-violet-400">Madura</span>
          </h1>
          <p className="text-slate-500 text-xs">Koleksi budaya Madura-mu</p>
        </div>
      </div>

      {/* Collection progress */}
      <div className="glass rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
        <span className="text-sm text-slate-400">Koleksi</span>
        <span className="font-bold text-[#FACC15]">
          {owned.length} / {collectibles.length}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-44 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Owned */}
          {owned.length > 0 && (
            <>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Dimiliki</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {owned.map((card, i) => {
                  const rarity = rarityConfig[card.rarity]
                  return (
                    <motion.button
                      key={card.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSelected(card)}
                      className={`card-shine rounded-2xl border p-4 text-left ${rarity.bg}`}
                      style={{ boxShadow: rarity.glow }}
                    >
                      <div className="text-4xl mb-3">{getEmoji(card.name)}</div>
                      <p className="font-semibold text-sm leading-snug">{card.name}</p>
                      <span
                        className="text-xs font-medium mt-1 block"
                        style={{ color: rarity.color }}
                      >
                        ✦ {rarity.label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </>
          )}

          {/* Locked */}
          {locked.length > 0 && (
            <>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Terkunci</p>
              <div className="grid grid-cols-2 gap-3">
                {locked.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-2xl border border-white/8 bg-white/3 p-4 opacity-50"
                  >
                    <div className="text-4xl mb-3 grayscale">
                      {getEmoji(card.name)}
                    </div>
                    <p className="font-semibold text-sm leading-snug text-slate-500">{card.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Lock size={10} className="text-slate-600" />
                      <span className="text-xs text-slate-600 truncate">{card.unlock_condition}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {collectibles.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p>Belum ada koleksi tersedia</p>
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4"
          onClick={() => setSelected(null)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            className="relative z-10 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div
              className={`card-shine rounded-3xl border p-6 ${rarityConfig[selected.rarity].bg}`}
              style={{ boxShadow: rarityConfig[selected.rarity].glow }}
            >
              <div className="text-7xl text-center mb-4">{getEmoji(selected.name)}</div>
              <h3 className="text-xl font-bold text-center mb-1">{selected.name}</h3>
              <p
                className="text-center text-sm font-medium mb-3"
                style={{ color: rarityConfig[selected.rarity].color }}
              >
                ✦ {rarityConfig[selected.rarity].label}
              </p>
              <p className="text-slate-400 text-sm text-center">{selected.description}</p>
              <button
                onClick={() => setSelected(null)}
                className="mt-5 w-full py-3 border border-white/20 rounded-xl text-sm hover:bg-white/5 transition-all"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, ArrowLeft, X, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface WikiArticle {
  id: string
  district: string
  category: string
  title: string
  summary: string
  source: string
  order_index: number
}

const districtColor: Record<string, string> = {
  Bangkalan: '#E11D48',
  Sampang:   '#7C3AED',
  Pamekasan: '#0EA5E9',
  Sumenep:   '#FACC15',
}

const categoryEmoji: Record<string, string> = {
  sejarah:    '📜',
  budaya:     '🎭',
  kuliner:    '🍜',
  wisata:     '🗺️',
  keunggulan: '⭐',
}

export default function AdminWikiPage() {
  const [articles, setArticles] = useState<WikiArticle[]>([])
  const [filtered, setFiltered] = useState<WikiArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('wiki_articles')
      .select('*')
      .order('district').order('category').order('order_index')
    if (data) { setArticles(data); setFiltered(data) }
    setLoading(false)
  }

  useEffect(() => { fetchArticles() }, [])

  useEffect(() => {
    let result = [...articles]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      )
    }
    if (filterDistrict) result = result.filter(a => a.district === filterDistrict)
    setFiltered(result)
  }, [search, filterDistrict, articles])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus artikel "${title}"?`)) return
    setDeleting(id)
    await supabase.from('wiki_articles').delete().eq('id', id)
    await fetchArticles()
    setDeleting(null)
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
              Kelola <span className="text-[#E11D48]">MaduWiki</span>
            </h1>
            <p className="text-xs text-slate-500">{articles.length} artikel tersedia</p>
          </div>
        </div>
        <Link href="/admin/wiki/tambah">
          <motion.button whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E11D48] rounded-xl text-sm font-semibold rose-glow">
            <Plus size={16} /> Tambah
          </motion.button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari judul artikel..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"><X size={14} /></button>}
      </div>

      {/* District filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        <button onClick={() => setFilterDistrict('')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${!filterDistrict ? 'bg-[#E11D48] text-white' : 'bg-white/5 text-slate-500'}`}>
          Semua
        </button>
        {Object.keys(districtColor).map(d => (
          <button key={d} onClick={() => setFilterDistrict(filterDistrict === d ? '' : d)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={filterDistrict === d
              ? { backgroundColor: districtColor[d], color: '#fff' }
              : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
            {d}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-600 mb-3">{filtered.length} artikel ditemukan</p>

      {/* Article list */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="glass rounded-xl h-16 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-slate-600 text-sm">Belum ada artikel wiki</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((article, i) => {
            const color = districtColor[article.district] || '#E11D48'
            return (
              <motion.div key={article.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="glass rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ borderLeft: `2px solid ${color}` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs">{categoryEmoji[article.category] || '📄'}</span>
                    <span className="font-semibold text-sm truncate">{article.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: color + '15', color }}>
                      {article.district}
                    </span>
                    <span className="text-[10px] text-slate-600 capitalize">{article.category}</span>
                    <span className="text-[10px] text-slate-700">#{article.order_index}</span>
                    {article.source === 'wikipedia' && <span className="text-[10px] text-blue-500">Wikipedia</span>}
                  </div>
                </div>

                <div className="flex gap-1.5 flex-shrink-0">
                  <Link href={`/admin/wiki/${article.id}`}>
                    <motion.button whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                      <Edit2 size={13} />
                    </motion.button>
                  </Link>
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(article.id, article.title)}
                    disabled={deleting === article.id}
                    className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-all disabled:opacity-40">
                    <Trash2 size={13} />
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

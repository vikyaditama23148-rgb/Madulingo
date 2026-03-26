'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Search, X, Trash2, Edit2,
  Plus, Save, BookOpen, TrendingUp, Brain
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface KBItem {
  id: string
  pertanyaan: string
  pertanyaan_normalized: string
  jawaban: string
  kategori: string
  keywords: string[]
  hit_count: number
  created_at: string
}

const KATEGORI = ['umum', 'sejarah', 'bahasa', 'budaya', 'kuliner', 'wisata', 'tokoh', 'geografi', 'ai-generated']

const kategoriColor: Record<string, string> = {
  umum:         '#94A3B8',
  sejarah:      '#FACC15',
  bahasa:       '#0EA5E9',
  budaya:       '#E11D48',
  kuliner:      '#F97316',
  wisata:       '#34D399',
  tokoh:        '#A78BFA',
  geografi:     '#60A5FA',
  'ai-generated': '#475569',
}

function InputField({ label, value, onChange, placeholder, multiline = false, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; multiline?: boolean; rows?: number
}) {
  const cls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors"
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1.5 block">{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={cls + ' resize-none'} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  )
}

export default function AdminTanyaTetuaPage() {
  const [items, setItems] = useState<KBItem[]>([])
  const [filtered, setFiltered] = useState<KBItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterKat, setFilterKat] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editing, setEditing] = useState<KBItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formPertanyaan, setFormPertanyaan] = useState('')
  const [formJawaban, setFormJawaban] = useState('')
  const [formKategori, setFormKategori] = useState('umum')
  const [formKeywords, setFormKeywords] = useState('')

  const supabase = createClient()

  const fetchItems = async () => {
    const { data } = await supabase
      .from('ai_knowledge_base')
      .select('*')
      .order('hit_count', { ascending: false })
    if (data) { setItems(data); setFiltered(data) }
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  useEffect(() => {
    let result = [...items]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(item =>
        item.pertanyaan.toLowerCase().includes(q) ||
        item.jawaban.toLowerCase().includes(q)
      )
    }
    if (filterKat) result = result.filter(item => item.kategori === filterKat)
    setFiltered(result)
  }, [search, filterKat, items])

  const resetForm = () => {
    setFormPertanyaan('')
    setFormJawaban('')
    setFormKategori('umum')
    setFormKeywords('')
    setEditing(null)
    setShowAddForm(false)
  }

  const openEdit = (item: KBItem) => {
    setEditing(item)
    setFormPertanyaan(item.pertanyaan)
    setFormJawaban(item.jawaban)
    setFormKategori(item.kategori)
    setFormKeywords(item.keywords?.join(', ') || '')
    setShowAddForm(true)
  }

  const handleSave = async () => {
    if (!formPertanyaan.trim() || !formJawaban.trim()) {
      alert('Pertanyaan dan jawaban wajib diisi!')
      return
    }
    setSaving(true)

    const normalized = formPertanyaan.toLowerCase().trim()
      .replace(/[?!.,]/g, '').replace(/\s+/g, ' ')
    const keywords = formKeywords.split(',').map(k => k.trim()).filter(Boolean)

    if (editing) {
      await supabase.from('ai_knowledge_base').update({
        pertanyaan: formPertanyaan.trim(),
        pertanyaan_normalized: normalized,
        jawaban: formJawaban.trim(),
        kategori: formKategori,
        keywords,
      }).eq('id', editing.id)
    } else {
      await supabase.from('ai_knowledge_base').insert({
        pertanyaan: formPertanyaan.trim(),
        pertanyaan_normalized: normalized,
        jawaban: formJawaban.trim(),
        kategori: formKategori,
        keywords,
        hit_count: 0,
      })
    }

    await fetchItems()
    resetForm()
    setSaving(false)
  }

  const handleDelete = async (id: string, pertanyaan: string) => {
    if (!confirm(`Hapus entri "${pertanyaan.substring(0, 50)}..."?`)) return
    setDeleting(id)
    await supabase.from('ai_knowledge_base').delete().eq('id', id)
    await fetchItems()
    setDeleting(null)
  }

  const aiGeneratedCount = items.filter(i => i.kategori === 'ai-generated').length
  const manualCount = items.filter(i => i.kategori !== 'ai-generated').length
  const totalHits = items.reduce((sum, i) => sum + i.hit_count, 0)

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
              Knowledge <span className="text-[#E11D48]">Base AI</span>
            </h1>
            <p className="text-xs text-slate-500">{items.length} entri tersimpan</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setShowAddForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E11D48] rounded-xl text-sm font-semibold rose-glow"
        >
          <Plus size={16} /> Tambah
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Manual', value: manualCount, color: '#34D399', icon: BookOpen },
          { label: 'AI Generated', value: aiGeneratedCount, color: '#475569', icon: Brain },
          { label: 'Total Terjawab', value: totalHits, color: '#FACC15', icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-3 text-center">
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div className="glass rounded-2xl p-5 space-y-3 border border-[#E11D48]/20">
              <p className="text-sm font-semibold text-[#E11D48]">
                {editing ? '✏️ Edit Entri' : '➕ Tambah Entri Baru'}
              </p>

              <InputField
                label="Pertanyaan"
                value={formPertanyaan}
                onChange={setFormPertanyaan}
                placeholder="contoh: Apa itu Karapan Sapi?"
              />
              <InputField
                label="Jawaban (tulis selengkap mungkin)"
                value={formJawaban}
                onChange={setFormJawaban}
                placeholder="Tulis jawaban yang akurat dan informatif..."
                multiline
                rows={5}
              />
              <InputField
                label="Keywords (pisah koma, untuk pencarian)"
                value={formKeywords}
                onChange={setFormKeywords}
                placeholder="karapan, sapi, tradisi, pamekasan"
              />

              {/* Kategori */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {KATEGORI.filter(k => k !== 'ai-generated').map(k => (
                    <button key={k} onClick={() => setFormKategori(k)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border capitalize transition-all ${
                        formKategori === k
                          ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]'
                          : 'border-white/10 bg-white/3 text-slate-500'
                      }`}>
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={resetForm}
                  className="flex-shrink-0 px-4 py-2.5 rounded-xl border border-white/20 text-sm hover:bg-white/5 transition-all">
                  Batal
                </button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 bg-[#E11D48] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 rose-glow disabled:opacity-50">
                  <Save size={14} />
                  {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah ke Knowledge Base'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari pertanyaan atau jawaban..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"><X size={14} /></button>}
      </div>

      {/* Kategori filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        <button onClick={() => setFilterKat('')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${!filterKat ? 'bg-[#E11D48] text-white' : 'bg-white/5 text-slate-500'}`}>
          Semua
        </button>
        {KATEGORI.map(k => (
          <button key={k} onClick={() => setFilterKat(filterKat === k ? '' : k)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all"
            style={filterKat === k
              ? { backgroundColor: kategoriColor[k], color: '#fff' }
              : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
            {k}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-600 mb-3">{filtered.length} entri ditemukan</p>

      {/* KB List */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="glass rounded-xl h-20 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Brain size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-slate-600 text-sm">Belum ada entri knowledge base</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => {
            const color = kategoriColor[item.kategori] || '#94A3B8'
            return (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="glass rounded-xl px-4 py-3 flex items-start gap-3"
                style={{ borderLeft: `2px solid ${color}` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug mb-1 line-clamp-2">
                    {item.pertanyaan}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1.5">
                    {item.jawaban}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                      style={{ backgroundColor: color + '15', color }}>
                      {item.kategori}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-600">
                      <TrendingUp size={9} /> {item.hit_count}x dijawab
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5 flex-shrink-0">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => openEdit(item)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <Edit2 size={13} />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(item.id, item.pertanyaan)}
                    disabled={deleting === item.id}
                    className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-all disabled:opacity-40">
                    <Trash2 size={13} />
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Info */}
      <div className="glass rounded-xl p-4 mt-6 border-l-2 border-[#FACC15]">
        <p className="text-xs text-[#FACC15] font-semibold mb-1">💡 Tentang Knowledge Base</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          Semakin banyak entri manual yang valid, semakin jarang API Gemini dipanggil.
          Entri berlabel <span className="text-slate-400">ai-generated</span> adalah jawaban otomatis dari Gemini yang sudah disimpan.
          Kamu bisa edit untuk memvalidasinya.
        </p>
      </div>
    </div>
  )
}

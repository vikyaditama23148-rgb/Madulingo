'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const DISTRICTS = ['Bangkalan', 'Sampang', 'Pamekasan', 'Sumenep']
const CATEGORIES = ['sejarah', 'budaya', 'kuliner', 'wisata', 'keunggulan']
const SOURCES = ['manual', 'wikipedia']

const districtColor: Record<string, string> = {
  Bangkalan: '#E11D48', Sampang: '#7C3AED', Pamekasan: '#0EA5E9', Sumenep: '#FACC15',
}

function InputField({ label, value, onChange, placeholder, required = false, multiline = false, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; required?: boolean; multiline?: boolean; rows?: number
}) {
  const cls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors"
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1.5 block">
        {label} {required && <span className="text-[#E11D48]">*</span>}
      </label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={cls + ' resize-none'} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  )
}

// ── TAMBAH PAGE ───────────────────────────────────────────────────────────────
export default function WikiFormPage() {
  const params = useParams()
  const router = useRouter()
  const articleId = params?.id as string | undefined
  const isEdit = !!articleId
  const supabase = createClient()

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [district, setDistrict] = useState('Bangkalan')
  const [category, setCategory] = useState('sejarah')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [source, setSource] = useState('manual')
  const [orderIndex, setOrderIndex] = useState('1')

  useEffect(() => {
    if (!isEdit) return
    const fetchArticle = async () => {
      const { data } = await supabase.from('wiki_articles').select('*').eq('id', articleId).single()
      if (data) {
        setTitle(data.title || '')
        setDistrict(data.district || 'Bangkalan')
        setCategory(data.category || 'sejarah')
        setSummary(data.summary || '')
        setContent(data.content || '')
        setImageUrl(data.image_url || '')
        setSource(data.source || 'manual')
        setOrderIndex(String(data.order_index || 1))
      }
      setLoading(false)
    }
    fetchArticle()
  }, [articleId])

  const handleSave = async () => {
    if (!title || !summary || !content) {
      alert('Harap isi judul, ringkasan, dan konten!')
      return
    }
    setSaving(true)

    const payload = {
      title: title.trim(),
      district,
      category,
      summary: summary.trim(),
      content: content.trim(),
      image_url: imageUrl.trim() || null,
      source,
      order_index: parseInt(orderIndex) || 1,
    }

    if (isEdit) {
      const { error } = await supabase.from('wiki_articles').update(payload).eq('id', articleId)
      if (error) alert('Gagal: ' + error.message)
      else { alert('✅ Artikel berhasil diperbarui!'); router.push('/admin/wiki') }
    } else {
      const { error } = await supabase.from('wiki_articles').insert(payload)
      if (error) alert('Gagal: ' + error.message)
      else router.push('/admin/wiki')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Hapus artikel "${title}"?`)) return
    await supabase.from('wiki_articles').delete().eq('id', articleId)
    router.push('/admin/wiki')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#E11D48] border-t-transparent rounded-full" />
      </div>
    )
  }

  const color = districtColor[district] || '#E11D48'

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto pb-32">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/wiki">
            <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              {isEdit ? 'Edit' : 'Tambah'} <span className="text-[#E11D48]">Artikel Wiki</span>
            </h1>
            <p className="text-xs text-slate-500">{isEdit ? title : 'Artikel baru'}</p>
          </div>
        </div>
        {isEdit && (
          <button onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs text-red-400 transition-all">
            <Trash2 size={13} /> Hapus
          </button>
        )}
      </div>

      <div className="space-y-4">

        {/* Judul */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>📝 Informasi Artikel</p>
          <InputField label="Judul Artikel" value={title} onChange={setTitle} placeholder="Sejarah Karapan Sapi" required />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Urutan (order)" value={orderIndex} onChange={setOrderIndex} placeholder="1" />
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Sumber</label>
              <div className="flex gap-2">
                {SOURCES.map(s => (
                  <button key={s} onClick={() => setSource(s)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all capitalize ${
                      source === s ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]' : 'border-white/10 bg-white/3 text-slate-500'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Kabupaten */}
        <div className="glass rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color }}>🏙️ Kabupaten</p>
          <div className="grid grid-cols-2 gap-2">
            {DISTRICTS.map(d => (
              <button key={d} onClick={() => setDistrict(d)}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  district === d
                    ? 'text-white'
                    : 'border-white/10 bg-white/3 text-slate-500'
                }`}
                style={district === d ? { borderColor: districtColor[d], backgroundColor: districtColor[d] + '20', color: districtColor[d] } : {}}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Kategori */}
        <div className="glass rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color }}>🏷️ Kategori</p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`py-2 rounded-xl text-xs font-medium border capitalize transition-all ${
                  category === c ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]' : 'border-white/10 bg-white/3 text-slate-500'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Konten */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>📄 Konten</p>
          <InputField label="Ringkasan (ditampilkan di kartu)" value={summary} onChange={setSummary}
            placeholder="Ringkasan singkat 1-2 kalimat..." multiline rows={2} required />
          <InputField label="Konten Lengkap (ditampilkan di modal)" value={content} onChange={setContent}
            placeholder="Tulis konten artikel selengkap mungkin..." multiline rows={6} required />
          <InputField label="URL Gambar (opsional)" value={imageUrl} onChange={setImageUrl}
            placeholder="https://xxx.supabase.co/storage/..." />
        </div>
      </div>

      {/* Save */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#0F172A] to-transparent">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Link href="/admin/wiki" className="flex-shrink-0">
            <button className="h-12 px-5 rounded-xl border border-white/20 text-sm hover:bg-white/5 transition-all">Batal</button>
          </Link>
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
            className="flex-1 h-12 bg-[#E11D48] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 rose-glow disabled:opacity-50">
            <Save size={16} />
            {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Artikel'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

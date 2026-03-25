'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const DISTRICTS = ['Bangkalan', 'Sampang', 'Pamekasan', 'Sumenep']
const CATEGORIES = ['sejarah', 'budaya', 'kuliner', 'wisata', 'keunggulan']
const SOURCES = ['manual', 'wikipedia']

const districtColor: Record<string, string> = {
  Bangkalan: '#E11D48',
  Sampang:   '#7C3AED',
  Pamekasan: '#0EA5E9',
  Sumenep:   '#FACC15',
}

function InputField({ label, value, onChange, placeholder, required = false, multiline = false, rows = 3 }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  multiline?: boolean
  rows?: number
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

export default function TambahWikiPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [district, setDistrict] = useState('Bangkalan')
  const [category, setCategory] = useState('sejarah')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [source, setSource] = useState('manual')
  const [orderIndex, setOrderIndex] = useState('1')

  const color = districtColor[district] || '#E11D48'

  const handleSave = async () => {
    if (!title.trim()) { alert('Judul artikel wajib diisi!'); return }
    if (!summary.trim()) { alert('Ringkasan wajib diisi!'); return }
    if (!content.trim()) { alert('Konten artikel wajib diisi!'); return }

    setSaving(true)

    const { error } = await supabase.from('wiki_articles').insert({
      title: title.trim(),
      district,
      category,
      summary: summary.trim(),
      content: content.trim(),
      image_url: imageUrl.trim() || null,
      source,
      order_index: parseInt(orderIndex) || 1,
    })

    if (error) {
      alert('Gagal menyimpan: ' + error.message)
      setSaving(false)
    } else {
      router.push('/admin/wiki')
    }
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto pb-32">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/wiki">
          <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            Tambah <span className="text-[#E11D48]">Artikel Wiki</span>
          </h1>
          <p className="text-xs text-slate-500">Artikel baru untuk MaduWiki</p>
        </div>
      </div>

      <div className="space-y-4">

        {/* Info artikel */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
            📝 Informasi Artikel
          </p>
          <InputField
            label="Judul Artikel"
            value={title}
            onChange={setTitle}
            placeholder="contoh: Sejarah Kerajaan Sumenep"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Urutan Tampil"
              value={orderIndex}
              onChange={setOrderIndex}
              placeholder="1"
            />
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Sumber</label>
              <div className="flex gap-2">
                {SOURCES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSource(s)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all capitalize ${
                      source === s
                        ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]'
                        : 'border-white/10 bg-white/3 text-slate-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Kabupaten */}
        <div className="glass rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color }}>
            🏙️ Kabupaten
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DISTRICTS.map(d => (
              <button
                key={d}
                onClick={() => setDistrict(d)}
                className="py-2.5 rounded-xl text-sm font-medium transition-all border"
                style={
                  district === d
                    ? { borderColor: districtColor[d], backgroundColor: districtColor[d] + '20', color: districtColor[d] }
                    : { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#64748b' }
                }
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Kategori */}
        <div className="glass rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color }}>
            🏷️ Kategori
          </p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`py-2 rounded-xl text-xs font-medium border capitalize transition-all ${
                  category === c
                    ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]'
                    : 'border-white/10 bg-white/3 text-slate-500'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Konten */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
            📄 Konten
          </p>
          <InputField
            label="Ringkasan (ditampilkan di kartu)"
            value={summary}
            onChange={setSummary}
            placeholder="Ringkasan singkat 1-2 kalimat tentang artikel ini..."
            multiline
            rows={2}
            required
          />
          <InputField
            label="Konten Lengkap (ditampilkan saat artikel dibuka)"
            value={content}
            onChange={setContent}
            placeholder="Tulis isi artikel selengkap dan seakurat mungkin..."
            multiline
            rows={8}
            required
          />
          <InputField
            label="URL Gambar (opsional)"
            value={imageUrl}
            onChange={setImageUrl}
            placeholder="https://xxx.supabase.co/storage/v1/object/public/..."
          />
        </div>

        {/* Preview info */}
        <div className="glass rounded-xl p-4 border-l-2 border-[#FACC15]">
          <p className="text-xs text-[#FACC15] font-semibold mb-1">💡 Tips Penulisan</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pastikan konten akurat dan dapat diverifikasi. Gunakan bahasa Indonesia yang baku dan mudah dipahami. Untuk konten berbahasa Madura, sertakan terjemahannya.
          </p>
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#0F172A] to-transparent">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Link href="/admin/wiki" className="flex-shrink-0">
            <button className="h-12 px-5 rounded-xl border border-white/20 text-sm hover:bg-white/5 transition-all">
              Batal
            </button>
          </Link>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-12 bg-[#E11D48] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 rose-glow disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Menyimpan...' : 'Tambah Artikel Wiki'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

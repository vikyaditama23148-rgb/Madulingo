'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const KATEGORI = ['sapaan', 'angka', 'warna', 'tubuh', 'alam', 'keluarga', 'aktivitas', 'waktu', 'umum']
const TINGKAT = ['enjhem', 'enggi-enten', 'bhumajhân']

function InputField({ label, value, onChange, placeholder, required = false, multiline = false }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; required?: boolean; multiline?: boolean
}) {
  const cls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors"
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1.5 block">
        {label} {required && <span className="text-[#E11D48]">*</span>}
      </label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2} className={cls + ' resize-none'} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  )
}

export default function EditKosakataPage() {
  const params = useParams()
  const router = useRouter()
  const wordId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [kataMadura, setKataMadura] = useState('')
  const [kataIndonesia, setKataIndonesia] = useState('')
  const [definisi, setDefinisi] = useState('')
  const [contohMadura, setContohMadura] = useState('')
  const [contohIndonesia, setContohIndonesia] = useState('')
  const [kategori, setKategori] = useState('umum')
  const [tingkat, setTingkat] = useState('enjhem')
  const [kbbiUrl, setKbbiUrl] = useState('')
  const [audioUrl, setAudioUrl] = useState('')

  useEffect(() => {
    const fetchWord = async () => {
      const { data } = await supabase.from('vocabulary').select('*').eq('id', wordId).single()
      if (data) {
        setKataMadura(data.kata_madura || '')
        setKataIndonesia(data.kata_indonesia || '')
        setDefinisi(data.definisi || '')
        setContohMadura(data.contoh_madura || '')
        setContohIndonesia(data.contoh_indonesia || '')
        setKategori(data.kategori || 'umum')
        setTingkat(data.tingkat_bahasa || 'enjhem')
        setKbbiUrl(data.kbbi_url || '')
        setAudioUrl(data.audio_url || '')
      }
      setLoading(false)
    }
    fetchWord()
  }, [wordId])

  const handleSave = async () => {
    if (!kataMadura || !kataIndonesia || !definisi) {
      alert('Harap isi kata Madura, kata Indonesia, dan definisi!')
      return
    }
    setSaving(true)

    const { error } = await supabase.from('vocabulary').update({
      kata_madura: kataMadura.trim(),
      kata_indonesia: kataIndonesia.trim(),
      definisi: definisi.trim(),
      contoh_madura: contohMadura.trim() || null,
      contoh_indonesia: contohIndonesia.trim() || null,
      kategori,
      tingkat_bahasa: tingkat,
      kbbi_url: kbbiUrl.trim() || null,
      audio_url: audioUrl.trim() || null,
    }).eq('id', wordId)

    if (error) alert('Gagal menyimpan: ' + error.message)
    else { alert('✅ Kata berhasil diperbarui!'); router.push('/admin/kosakata') }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Hapus kata "${kataMadura}"?`)) return
    await supabase.from('vocabulary').delete().eq('id', wordId)
    router.push('/admin/kosakata')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#E11D48] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto pb-32">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/kosakata">
            <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Edit <span className="text-[#E11D48]">{kataMadura}</span>
            </h1>
            <p className="text-xs text-slate-500">Perbarui informasi kata</p>
          </div>
        </div>
        <button onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs text-red-400 transition-all">
          <Trash2 size={13} /> Hapus
        </button>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider">📝 Kata</p>
          <InputField label="Kata Madura" value={kataMadura} onChange={setKataMadura} required />
          <InputField label="Kata Indonesia" value={kataIndonesia} onChange={setKataIndonesia} required />
          <InputField label="Definisi" value={definisi} onChange={setDefinisi} multiline required />
        </div>

        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider">💬 Contoh Kalimat</p>
          <InputField label="Contoh Bahasa Madura" value={contohMadura} onChange={setContohMadura} />
          <InputField label="Contoh Bahasa Indonesia" value={contohIndonesia} onChange={setContohIndonesia} />
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider mb-3">🏷️ Kategori</p>
          <div className="grid grid-cols-3 gap-2">
            {KATEGORI.map(k => (
              <button key={k} onClick={() => setKategori(k)}
                className={`py-2 rounded-xl text-xs font-medium transition-all border capitalize ${
                  kategori === k ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]' : 'border-white/10 bg-white/3 text-slate-500'
                }`}>
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider mb-3">📊 Tingkat Bahasa</p>
          <div className="grid grid-cols-3 gap-2">
            {TINGKAT.map(t => (
              <button key={t} onClick={() => setTingkat(t)}
                className={`py-2 rounded-xl text-xs font-medium transition-all border ${
                  tingkat === t ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]' : 'border-white/10 bg-white/3 text-slate-500'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider">🔗 Link</p>
          <InputField label="URL KBBI" value={kbbiUrl} onChange={setKbbiUrl}
            placeholder="https://kbbi.kemdikbud.go.id/entri/..." />
          <InputField label="URL Audio" value={audioUrl} onChange={setAudioUrl}
            placeholder="https://xxx.supabase.co/storage/..." />
        </div>
      </div>

      {/* Save */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#0F172A] to-transparent">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Link href="/admin/kosakata" className="flex-shrink-0">
            <button className="h-12 px-5 rounded-xl border border-white/20 text-sm hover:bg-white/5 transition-all">
              Batal
            </button>
          </Link>
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
            className="flex-1 h-12 bg-[#E11D48] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 rose-glow disabled:opacity-50">
            <Save size={16} />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Save } from 'lucide-react'
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

export default function TambahKosakataPage() {
  const router = useRouter()
  const supabase = createClient()
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

  const handleSave = async () => {
    if (!kataMadura || !kataIndonesia || !definisi) {
      alert('Harap isi kata Madura, kata Indonesia, dan definisi!')
      return
    }
    setSaving(true)

    // Auto-generate KBBI URL kalau kosong
    const finalKbbiUrl = kbbiUrl.trim() ||
      (kataIndonesia ? `https://kbbi.kemdikbud.go.id/entri/${kataIndonesia.toLowerCase().trim()}` : '')

    const { error } = await supabase.from('vocabulary').insert({
      kata_madura: kataMadura.trim(),
      kata_indonesia: kataIndonesia.trim(),
      definisi: definisi.trim(),
      contoh_madura: contohMadura.trim() || null,
      contoh_indonesia: contohIndonesia.trim() || null,
      kategori,
      tingkat_bahasa: tingkat,
      kbbi_url: finalKbbiUrl || null,
      audio_url: audioUrl.trim() || null,
    })

    if (error) {
      alert('Gagal menyimpan: ' + error.message)
    } else {
      router.push('/admin/kosakata')
    }
    setSaving(false)
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto pb-32">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/kosakata">
          <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            Tambah <span className="text-[#E11D48]">Kata Baru</span>
          </h1>
          <p className="text-xs text-slate-500">Isi dalam bahasa Madura dan Indonesia</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">

        {/* Kata utama */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider">📝 Kata</p>
          <InputField label="Kata Madura" value={kataMadura} onChange={setKataMadura} placeholder="contoh: mera" required />
          <InputField label="Kata Indonesia" value={kataIndonesia} onChange={setKataIndonesia} placeholder="contoh: merah" required />
          <InputField label="Definisi" value={definisi} onChange={setDefinisi} placeholder="contoh: warna seperti darah atau api" multiline required />
        </div>

        {/* Contoh kalimat */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider">💬 Contoh Kalimat (opsional)</p>
          <InputField label="Contoh Bahasa Madura" value={contohMadura} onChange={setContohMadura} placeholder="contoh: Bajuna mera" />
          <InputField label="Contoh Bahasa Indonesia" value={contohIndonesia} onChange={setContohIndonesia} placeholder="contoh: Bajunya merah" />
        </div>

        {/* Kategori */}
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider mb-3">🏷️ Kategori</p>
          <div className="grid grid-cols-3 gap-2">
            {KATEGORI.map(k => (
              <button
                key={k}
                onClick={() => setKategori(k)}
                className={`py-2 rounded-xl text-xs font-medium transition-all border capitalize ${
                  kategori === k
                    ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]'
                    : 'border-white/10 bg-white/3 text-slate-500 hover:text-slate-300'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Tingkat bahasa */}
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider mb-3">📊 Tingkat Bahasa</p>
          <div className="grid grid-cols-3 gap-2">
            {TINGKAT.map(t => (
              <button
                key={t}
                onClick={() => setTingkat(t)}
                className={`py-2 rounded-xl text-xs font-medium transition-all border ${
                  tingkat === t
                    ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]'
                    : 'border-white/10 bg-white/3 text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-2">Enjhem = kasar · Enggi-Enten = menengah · Bhumajhân = halus</p>
        </div>

        {/* Link & Audio */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider">🔗 Link (opsional)</p>
          <InputField
            label="URL KBBI (kosongkan untuk auto-generate)"
            value={kbbiUrl}
            onChange={setKbbiUrl}
            placeholder="https://kbbi.kemdikbud.go.id/entri/merah"
          />
          <InputField
            label="URL Audio Pronunciation"
            value={audioUrl}
            onChange={setAudioUrl}
            placeholder="https://xxx.supabase.co/storage/v1/object/public/audio/..."
          />
          {!kbbiUrl && kataIndonesia && (
            <p className="text-[10px] text-slate-600">
              Auto KBBI: kbbi.kemdikbud.go.id/entri/{kataIndonesia.toLowerCase()}
            </p>
          )}
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#0F172A] to-transparent">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Link href="/admin/kosakata" className="flex-shrink-0">
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
            {saving ? 'Menyimpan...' : 'Simpan Kata'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const DISTRICTS = ['Bangkalan', 'Sampang', 'Pamekasan', 'Sumenep']

interface ParagraphForm {
  text_id: string
  text_en: string
  text_madura: string
  vocab: { kata_madura: string; kata_id: string; arti: string }[]
}

function InputField({ label, value, onChange, placeholder, multiline = false, required = false }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
  required?: boolean
}) {
  const cls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors"
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1.5 block">
        {label} {required && <span className="text-[#E11D48]">*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cls + ' resize-none'}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  )
}

export default function TambahCeritaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [expandedPara, setExpandedPara] = useState<number | null>(0)

  // Story fields
  const [titleId, setTitleId] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [titleMadura, setTitleMadura] = useState('')
  const [district, setDistrict] = useState('Bangkalan')
  const [synopsisId, setSynopsisId] = useState('')
  const [synopsisEn, setSynopsisEn] = useState('')
  const [synopsisMadura, setSynopsisMadura] = useState('')
  const [xpReward, setXpReward] = useState('30')
  const [readTime, setReadTime] = useState('5')
  const [tags, setTags] = useState('')
  const [orderIndex, setOrderIndex] = useState('1')

  // Paragraphs
  const [paragraphs, setParagraphs] = useState<ParagraphForm[]>([
    { text_id: '', text_en: '', text_madura: '', vocab: [] }
  ])

  const addParagraph = () => {
    setParagraphs(prev => [...prev, { text_id: '', text_en: '', text_madura: '', vocab: [] }])
    setExpandedPara(paragraphs.length)
  }

  const removeParagraph = (i: number) => {
    setParagraphs(prev => prev.filter((_, idx) => idx !== i))
    setExpandedPara(null)
  }

  const updateParagraph = (i: number, field: keyof ParagraphForm, value: string) => {
    setParagraphs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  const addVocab = (paraIdx: number) => {
    setParagraphs(prev => prev.map((p, idx) =>
      idx === paraIdx
        ? { ...p, vocab: [...p.vocab, { kata_madura: '', kata_id: '', arti: '' }] }
        : p
    ))
  }

  const updateVocab = (paraIdx: number, vocabIdx: number, field: string, value: string) => {
    setParagraphs(prev => prev.map((p, idx) =>
      idx === paraIdx
        ? { ...p, vocab: p.vocab.map((v, vi) => vi === vocabIdx ? { ...v, [field]: value } : v) }
        : p
    ))
  }

  const removeVocab = (paraIdx: number, vocabIdx: number) => {
    setParagraphs(prev => prev.map((p, idx) =>
      idx === paraIdx ? { ...p, vocab: p.vocab.filter((_, vi) => vi !== vocabIdx) } : p
    ))
  }

  const handleSave = async () => {
    if (!titleId || !titleEn || !titleMadura || !synopsisId || !synopsisEn || !synopsisMadura) {
      alert('Harap isi semua field yang wajib diisi!')
      return
    }
    if (paragraphs.some(p => !p.text_id || !p.text_en || !p.text_madura)) {
      alert('Harap isi semua paragraf dalam 3 bahasa!')
      return
    }

    setSaving(true)

    // Insert story
    const { data: storyData, error: storyError } = await supabase
      .from('stories')
      .insert({
        title_id: titleId,
        title_en: titleEn,
        title_madura: titleMadura,
        district,
        synopsis_id: synopsisId,
        synopsis_en: synopsisEn,
        synopsis_madura: synopsisMadura,
        xp_reward: parseInt(xpReward) || 30,
        read_time_minutes: parseInt(readTime) || 5,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        order_index: parseInt(orderIndex) || 1,
      })
      .select()
      .single()

    if (storyError || !storyData) {
      alert('Gagal menyimpan cerita: ' + storyError?.message)
      setSaving(false)
      return
    }

    // Insert paragraphs
    const paraInserts = paragraphs.map((p, i) => ({
      story_id: storyData.id,
      order_index: i + 1,
      text_id: p.text_id,
      text_en: p.text_en,
      text_madura: p.text_madura,
      vocabulary_highlights: p.vocab.filter(v => v.kata_madura && v.kata_id && v.arti),
    }))

    const { error: paraError } = await supabase.from('story_paragraphs').insert(paraInserts)

    if (paraError) {
      alert('Cerita tersimpan tapi paragraf gagal: ' + paraError.message)
    } else {
      router.push('/admin/cerita')
    }

    setSaving(false)
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto pb-32">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/cerita">
          <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            Tambah <span className="text-[#E11D48]">Cerita Baru</span>
          </h1>
          <p className="text-xs text-slate-500">Isi semua field dalam 3 bahasa</p>
        </div>
      </div>

      {/* ── INFORMASI CERITA ── */}
      <div className="glass rounded-2xl p-5 mb-4">
        <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider mb-4">
          📖 Informasi Cerita
        </p>
        <div className="space-y-3">
          <InputField label="Judul (Indonesia)" value={titleId} onChange={setTitleId}
            placeholder="Asal Usul Karapan Sapi" required />
          <InputField label="Judul (English)" value={titleEn} onChange={setTitleEn}
            placeholder="The Origin of Bull Racing" required />
          <InputField label="Judul (Madura)" value={titleMadura} onChange={setTitleMadura}
            placeholder="Asale Karapan Sape" required />

          {/* District */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Kabupaten <span className="text-[#E11D48]">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {DISTRICTS.map(d => (
                <button
                  key={d}
                  onClick={() => setDistrict(d)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    district === d
                      ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]'
                      : 'border-white/10 bg-white/3 text-slate-500'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SINOPSIS ── */}
      <div className="glass rounded-2xl p-5 mb-4">
        <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider mb-4">
          📝 Sinopsis
        </p>
        <div className="space-y-3">
          <InputField label="Sinopsis (Indonesia)" value={synopsisId} onChange={setSynopsisId}
            placeholder="Kisah tentang..." multiline required />
          <InputField label="Sinopsis (English)" value={synopsisEn} onChange={setSynopsisEn}
            placeholder="A story about..." multiline required />
          <InputField label="Sinopsis (Madura)" value={synopsisMadura} onChange={setSynopsisMadura}
            placeholder="Carita tantang..." multiline required />
        </div>
      </div>

      {/* ── PENGATURAN ── */}
      <div className="glass rounded-2xl p-5 mb-4">
        <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider mb-4">
          ⚙️ Pengaturan
        </p>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="XP Reward" value={xpReward} onChange={setXpReward} placeholder="30" />
          <InputField label="Waktu Baca (menit)" value={readTime} onChange={setReadTime} placeholder="5" />
          <InputField label="Urutan (order)" value={orderIndex} onChange={setOrderIndex} placeholder="1" />
          <InputField label="Tags (pisah koma)" value={tags} onChange={setTags} placeholder="tradisi, sapi" />
        </div>
      </div>

      {/* ── PARAGRAF ── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">
            📄 Paragraf <span className="text-slate-500 font-normal">({paragraphs.length})</span>
          </p>
          <button onClick={addParagraph}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20 rounded-xl text-xs font-semibold hover:bg-[#E11D48]/20 transition-all">
            <Plus size={13} /> Tambah Paragraf
          </button>
        </div>

        <div className="space-y-3">
          {paragraphs.map((para, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden">
              {/* Paragraph header */}
              <button
                onClick={() => setExpandedPara(expandedPara === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#E11D48]/20 text-[#E11D48] text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-400 line-clamp-1">
                    {para.text_id || 'Paragraf belum diisi...'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {paragraphs.length > 1 && (
                    <button
                      onClick={e => { e.stopPropagation(); removeParagraph(i) }}
                      className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  {expandedPara === i ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </div>
              </button>

              {/* Paragraph content */}
              {expandedPara === i && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/8 pt-3">
                  <InputField label="Teks Indonesia" value={para.text_id}
                    onChange={v => updateParagraph(i, 'text_id', v)}
                    placeholder="Dahulu kala..." multiline required />
                  <InputField label="Teks English" value={para.text_en}
                    onChange={v => updateParagraph(i, 'text_en', v)}
                    placeholder="Long ago..." multiline required />
                  <InputField label="Teks Madura" value={para.text_madura}
                    onChange={v => updateParagraph(i, 'text_madura', v)}
                    placeholder="Kala biyen..." multiline required />

                  {/* Vocabulary highlights */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-slate-400">Kosakata Baru (opsional)</label>
                      <button onClick={() => addVocab(i)}
                        className="flex items-center gap-1 text-[10px] text-[#E11D48] hover:underline">
                        <Plus size={10} /> Tambah
                      </button>
                    </div>

                    {para.vocab.map((v, vi) => (
                      <div key={vi} className="grid grid-cols-3 gap-2 mb-2">
                        <input
                          value={v.kata_madura}
                          onChange={e => updateVocab(i, vi, 'kata_madura', e.target.value)}
                          placeholder="Kata Madura"
                          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#E11D48]"
                        />
                        <input
                          value={v.kata_id}
                          onChange={e => updateVocab(i, vi, 'kata_id', e.target.value)}
                          placeholder="Kata Indonesia"
                          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#E11D48]"
                        />
                        <div className="flex gap-1">
                          <input
                            value={v.arti}
                            onChange={e => updateVocab(i, vi, 'arti', e.target.value)}
                            placeholder="Definisi"
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#E11D48]"
                          />
                          <button onClick={() => removeVocab(i, vi)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#0F172A] to-transparent">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Link href="/admin/cerita" className="flex-shrink-0">
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
            {saving ? 'Menyimpan...' : `Simpan Cerita (${paragraphs.length} paragraf)`}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

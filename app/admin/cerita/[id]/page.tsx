'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Save, Plus, Trash2, ChevronDown,
  ChevronUp, GripVertical, Eye
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Story {
  id: string
  title_id: string
  title_en: string
  title_madura: string
  district: string
  synopsis_id: string
  synopsis_en: string
  synopsis_madura: string
  xp_reward: number
  read_time_minutes: number
  tags: string[]
  order_index: number
  cover_image_url: string | null
}

interface Paragraph {
  id: string
  order_index: number
  text_id: string
  text_en: string
  text_madura: string
  vocabulary_highlights: { kata_madura: string; kata_id: string; arti: string }[]
}

const DISTRICTS = ['Bangkalan', 'Sampang', 'Pamekasan', 'Sumenep']

function InputField({ label, value, onChange, placeholder, multiline = false, required = false }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; multiline?: boolean; required?: boolean
}) {
  const cls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors"
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1.5 block">
        {label} {required && <span className="text-[#E11D48]">*</span>}
      </label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls + ' resize-none'} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  )
}

export default function EditCeritaPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.id as string
  const supabase = createClient()

  const [story, setStory] = useState<Story | null>(null)
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedPara, setExpandedPara] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'info' | 'paragraf'>('info')

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

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from('stories').select('*').eq('id', storyId).single(),
        supabase.from('story_paragraphs').select('*').eq('story_id', storyId).order('order_index'),
      ])
      if (s) {
        setStory(s)
        setTitleId(s.title_id)
        setTitleEn(s.title_en)
        setTitleMadura(s.title_madura)
        setDistrict(s.district)
        setSynopsisId(s.synopsis_id)
        setSynopsisEn(s.synopsis_en)
        setSynopsisMadura(s.synopsis_madura)
        setXpReward(String(s.xp_reward))
        setReadTime(String(s.read_time_minutes))
        setTags(s.tags?.join(', ') || '')
        setOrderIndex(String(s.order_index))
      }
      if (p) setParagraphs(p)
      setLoading(false)
    }
    fetchData()
  }, [storyId])

  // ── STORY SAVE ─────────────────────────────────────────────────────────────
  const handleSaveStory = async () => {
    setSaving(true)
    const { error } = await supabase.from('stories').update({
      title_id: titleId, title_en: titleEn, title_madura: titleMadura,
      district, synopsis_id: synopsisId, synopsis_en: synopsisEn,
      synopsis_madura: synopsisMadura,
      xp_reward: parseInt(xpReward) || 30,
      read_time_minutes: parseInt(readTime) || 5,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      order_index: parseInt(orderIndex) || 1,
    }).eq('id', storyId)

    if (error) alert('Gagal menyimpan: ' + error.message)
    else alert('✅ Informasi cerita berhasil disimpan!')
    setSaving(false)
  }

  // ── PARAGRAPH ACTIONS ──────────────────────────────────────────────────────
  const handleAddParagraph = async () => {
    const newOrder = paragraphs.length + 1
    const { data, error } = await supabase.from('story_paragraphs').insert({
      story_id: storyId,
      order_index: newOrder,
      text_id: '',
      text_en: '',
      text_madura: '',
      vocabulary_highlights: [],
    }).select().single()

    if (data) {
      setParagraphs(prev => [...prev, data])
      setExpandedPara(data.id)
    }
    if (error) alert('Gagal tambah paragraf: ' + error.message)
  }

  const handleSaveParagraph = async (para: Paragraph) => {
    const { error } = await supabase.from('story_paragraphs').update({
      text_id: para.text_id,
      text_en: para.text_en,
      text_madura: para.text_madura,
      vocabulary_highlights: para.vocabulary_highlights,
    }).eq('id', para.id)

    if (error) alert('Gagal simpan paragraf: ' + error.message)
    else alert(`✅ Paragraf ${para.order_index} berhasil disimpan!`)
  }

  const handleDeleteParagraph = async (paraId: string, orderIdx: number) => {
    if (!confirm(`Hapus paragraf ${orderIdx}?`)) return
    await supabase.from('story_paragraphs').delete().eq('id', paraId)
    setParagraphs(prev => prev.filter(p => p.id !== paraId))
  }

  const updateParaField = (paraId: string, field: keyof Paragraph, value: string) => {
    setParagraphs(prev => prev.map(p => p.id === paraId ? { ...p, [field]: value } : p))
  }

  const addVocab = (paraId: string) => {
    setParagraphs(prev => prev.map(p =>
      p.id === paraId
        ? { ...p, vocabulary_highlights: [...p.vocabulary_highlights, { kata_madura: '', kata_id: '', arti: '' }] }
        : p
    ))
  }

  const updateVocab = (paraId: string, vi: number, field: string, value: string) => {
    setParagraphs(prev => prev.map(p =>
      p.id === paraId
        ? { ...p, vocabulary_highlights: p.vocabulary_highlights.map((v, i) => i === vi ? { ...v, [field]: value } : v) }
        : p
    ))
  }

  const removeVocab = (paraId: string, vi: number) => {
    setParagraphs(prev => prev.map(p =>
      p.id === paraId
        ? { ...p, vocabulary_highlights: p.vocabulary_highlights.filter((_, i) => i !== vi) }
        : p
    ))
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
          <Link href="/admin/cerita">
            <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Edit <span className="text-[#E11D48]">Cerita</span>
            </h1>
            <p className="text-xs text-slate-500 truncate max-w-[200px]">{story?.title_id}</p>
          </div>
        </div>
        <Link href="/wiki">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-slate-400 transition-all">
            <Eye size={13} /> Preview
          </button>
        </Link>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-5">
        <button onClick={() => setActiveSection('info')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${activeSection === 'info' ? 'bg-[#E11D48] text-white' : 'text-slate-500'}`}>
          📖 Info Cerita
        </button>
        <button onClick={() => setActiveSection('paragraf')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${activeSection === 'paragraf' ? 'bg-[#E11D48] text-white' : 'text-slate-500'}`}>
          📄 Paragraf ({paragraphs.length})
        </button>
      </div>

      {/* INFO SECTION */}
      {activeSection === 'info' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass rounded-2xl p-5 mb-4 space-y-3">
            <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider">📖 Judul</p>
            <InputField label="Judul Indonesia" value={titleId} onChange={setTitleId} required />
            <InputField label="Judul English" value={titleEn} onChange={setTitleEn} required />
            <InputField label="Judul Madura" value={titleMadura} onChange={setTitleMadura} required />
          </div>

          <div className="glass rounded-2xl p-5 mb-4">
            <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider mb-3">🏙️ Kabupaten</p>
            <div className="grid grid-cols-2 gap-2">
              {DISTRICTS.map(d => (
                <button key={d} onClick={() => setDistrict(d)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    district === d ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]' : 'border-white/10 bg-white/3 text-slate-500'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 mb-4 space-y-3">
            <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider">📝 Sinopsis</p>
            <InputField label="Sinopsis Indonesia" value={synopsisId} onChange={setSynopsisId} multiline required />
            <InputField label="Sinopsis English" value={synopsisEn} onChange={setSynopsisEn} multiline required />
            <InputField label="Sinopsis Madura" value={synopsisMadura} onChange={setSynopsisMadura} multiline required />
          </div>

          <div className="glass rounded-2xl p-5 mb-4">
            <p className="text-xs text-[#E11D48] font-semibold uppercase tracking-wider mb-3">⚙️ Pengaturan</p>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="XP Reward" value={xpReward} onChange={setXpReward} />
              <InputField label="Waktu Baca (menit)" value={readTime} onChange={setReadTime} />
              <InputField label="Urutan" value={orderIndex} onChange={setOrderIndex} />
              <InputField label="Tags (pisah koma)" value={tags} onChange={setTags} />
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSaveStory} disabled={saving}
            className="w-full h-12 bg-[#E11D48] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 rose-glow disabled:opacity-50">
            <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </motion.button>
        </motion.div>
      )}

      {/* PARAGRAF SECTION */}
      {activeSection === 'paragraf' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">{paragraphs.length} paragraf</p>
            <button onClick={handleAddParagraph}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20 rounded-xl text-xs font-semibold hover:bg-[#E11D48]/20 transition-all">
              <Plus size={13} /> Tambah Paragraf
            </button>
          </div>

          <div className="space-y-3">
            {paragraphs.map((para) => (
              <div key={para.id} className="glass rounded-2xl overflow-hidden">
                {/* Para header */}
                <div className="flex items-center gap-2 px-4 py-3">
                  <GripVertical size={14} className="text-slate-700 flex-shrink-0" />
                  <button
                    onClick={() => setExpandedPara(expandedPara === para.id ? null : para.id)}
                    className="flex-1 flex items-center gap-2 text-left"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#E11D48]/20 text-[#E11D48] text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {para.order_index}
                    </span>
                    <span className="text-sm text-slate-400 line-clamp-1 flex-1">
                      {para.text_id || 'Paragraf kosong...'}
                    </span>
                  </button>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleDeleteParagraph(para.id, para.order_index)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={13} />
                    </button>
                    <button onClick={() => setExpandedPara(expandedPara === para.id ? null : para.id)}
                      className="p-1.5 rounded-lg text-slate-500">
                      {expandedPara === para.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Para content */}
                <AnimatePresence>
                  {expandedPara === para.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-white/8 pt-3 space-y-3">
                        <InputField label="🇮🇩 Teks Indonesia" value={para.text_id}
                          onChange={v => updateParaField(para.id, 'text_id', v)} multiline required />
                        <InputField label="🇬🇧 Teks English" value={para.text_en}
                          onChange={v => updateParaField(para.id, 'text_en', v)} multiline required />
                        <InputField label="🏝️ Teks Madura" value={para.text_madura}
                          onChange={v => updateParaField(para.id, 'text_madura', v)} multiline required />

                        {/* Vocab */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-slate-400">✨ Kosakata Baru</label>
                            <button onClick={() => addVocab(para.id)}
                              className="flex items-center gap-1 text-[10px] text-[#E11D48] hover:underline">
                              <Plus size={10} /> Tambah
                            </button>
                          </div>
                          {para.vocabulary_highlights.map((v, vi) => (
                            <div key={vi} className="grid grid-cols-3 gap-2 mb-2">
                              <input value={v.kata_madura} onChange={e => updateVocab(para.id, vi, 'kata_madura', e.target.value)}
                                placeholder="Kata Madura"
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#E11D48]" />
                              <input value={v.kata_id} onChange={e => updateVocab(para.id, vi, 'kata_id', e.target.value)}
                                placeholder="Kata Indonesia"
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#E11D48]" />
                              <div className="flex gap-1">
                                <input value={v.arti} onChange={e => updateVocab(para.id, vi, 'arti', e.target.value)}
                                  placeholder="Definisi"
                                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-[#E11D48]" />
                                <button onClick={() => removeVocab(para.id, vi)}
                                  className="w-8 h-8 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-500/10 flex-shrink-0">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Save paragraph */}
                        <motion.button whileTap={{ scale: 0.98 }} onClick={() => handleSaveParagraph(para)}
                          className="w-full py-2.5 bg-[#E11D48]/10 border border-[#E11D48]/20 text-[#E11D48] rounded-xl text-sm font-semibold hover:bg-[#E11D48]/20 transition-all flex items-center justify-center gap-2">
                          <Save size={14} /> Simpan Paragraf {para.order_index}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

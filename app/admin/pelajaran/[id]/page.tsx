'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Save, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const DISTRICTS = ['Bangkalan', 'Sampang', 'Pamekasan', 'Sumenep']
const districtColor: Record<string, string> = {
  Bangkalan: '#E11D48', Sampang: '#7C3AED', Pamekasan: '#0EA5E9', Sumenep: '#FACC15',
}

interface QuizItem {
  type: 'multiple_choice' | 'word_sort'
  question: string
  options?: string[]
  words?: string[]
  answer: string | string[]
  audio: string | null
}

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
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls + ' resize-none'} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  )
}

export default function PelajaranFormPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params?.id as string | undefined
  const isEdit = !!lessonId && lessonId !== 'tambah'
  const supabase = createClient()

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(0)

  // Lesson fields
  const [title, setTitle] = useState('')
  const [district, setDistrict] = useState('Bangkalan')
  const [difficulty, setDifficulty] = useState('1')
  const [xpReward, setXpReward] = useState('20')
  const [coinReward, setCoinReward] = useState('10')
  const [orderIndex, setOrderIndex] = useState('1')
  const [description, setDescription] = useState('')
  const [quizzes, setQuizzes] = useState<QuizItem[]>([
    { type: 'multiple_choice', question: '', options: ['', '', '', ''], answer: '', audio: null }
  ])

  useEffect(() => {
    if (!isEdit) return
    const fetchLesson = async () => {
      const { data } = await supabase.from('lessons').select('*').eq('id', lessonId).single()
      if (data) {
        setTitle(data.title || '')
        setDistrict(data.district || 'Bangkalan')
        setDifficulty(String(data.difficulty || 1))
        setXpReward(String(data.xp_reward || 20))
        setCoinReward(String(data.coin_reward || 10))
        setOrderIndex(String(data.order_index || 1))
        setDescription(data.content_json?.description || '')
        setQuizzes(data.content_json?.quizzes || [])
      }
      setLoading(false)
    }
    fetchLesson()
  }, [lessonId])

  const addQuiz = () => {
    setQuizzes(prev => [...prev, { type: 'multiple_choice', question: '', options: ['', '', '', ''], answer: '', audio: null }])
    setExpandedQuiz(quizzes.length)
  }

  const removeQuiz = (i: number) => {
    setQuizzes(prev => prev.filter((_, idx) => idx !== i))
    setExpandedQuiz(null)
  }

  const updateQuiz = (i: number, field: string, value: any) => {
    setQuizzes(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q))
  }

  const updateOption = (quizIdx: number, optIdx: number, value: string) => {
    setQuizzes(prev => prev.map((q, i) => {
      if (i !== quizIdx) return q
      const newOptions = [...(q.options || ['', '', '', ''])]
      newOptions[optIdx] = value
      return { ...q, options: newOptions }
    }))
  }

  const handleSave = async () => {
    if (!title) { alert('Isi judul pelajaran!'); return }
    if (quizzes.some(q => !q.question)) { alert('Semua quiz harus ada pertanyaannya!'); return }
    setSaving(true)

    const contentJson = { description, quizzes }

    const payload = {
      title: title.trim(),
      district,
      difficulty: parseInt(difficulty) || 1,
      xp_reward: parseInt(xpReward) || 20,
      coin_reward: parseInt(coinReward) || 10,
      order_index: parseInt(orderIndex) || 1,
      content_json: contentJson,
    }

    if (isEdit) {
      const { error } = await supabase.from('lessons').update(payload).eq('id', lessonId)
      if (error) alert('Gagal: ' + error.message)
      else { alert('✅ Pelajaran berhasil diperbarui!'); router.push('/admin/pelajaran') }
    } else {
      const { error } = await supabase.from('lessons').insert(payload)
      if (error) alert('Gagal: ' + error.message)
      else router.push('/admin/pelajaran')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Hapus pelajaran "${title}"?`)) return
    await supabase.from('lessons').delete().eq('id', lessonId)
    router.push('/admin/pelajaran')
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
          <Link href="/admin/pelajaran">
            <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              {isEdit ? 'Edit' : 'Tambah'} <span className="text-[#E11D48]">Pelajaran</span>
            </h1>
            <p className="text-xs text-slate-500">{isEdit ? title : 'Pelajaran baru'}</p>
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

        {/* Info pelajaran */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>📚 Informasi Pelajaran</p>
          <InputField label="Judul Pelajaran" value={title} onChange={setTitle} placeholder="Salam & Sapaan" required />
          <InputField label="Deskripsi Singkat" value={description} onChange={setDescription} placeholder="Belajar salam dalam bahasa Madura" multiline />
        </div>

        {/* Kabupaten */}
        <div className="glass rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color }}>🏙️ Kabupaten</p>
          <div className="grid grid-cols-2 gap-2">
            {DISTRICTS.map(d => (
              <button key={d} onClick={() => setDistrict(d)}
                className="py-2.5 rounded-xl text-sm font-medium transition-all border"
                style={district === d
                  ? { borderColor: districtColor[d], backgroundColor: districtColor[d] + '20', color: districtColor[d] }
                  : { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#64748b' }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Pengaturan */}
        <div className="glass rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color }}>⚙️ Pengaturan</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <InputField label="XP Reward" value={xpReward} onChange={setXpReward} placeholder="20" />
            <InputField label="Koin Reward" value={coinReward} onChange={setCoinReward} placeholder="10" />
            <InputField label="Urutan" value={orderIndex} onChange={setOrderIndex} placeholder="1" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Tingkat Kesulitan</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setDifficulty(String(n))}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${
                    difficulty === String(n) ? 'border-[#FACC15] bg-[#FACC15]/10 text-[#FACC15]' : 'border-white/10 bg-white/3 text-slate-500'
                  }`}>
                  {'⭐'.repeat(n)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">🎯 Quiz <span className="text-slate-500 font-normal">({quizzes.length})</span></p>
            <button onClick={addQuiz}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20 rounded-xl text-xs font-semibold hover:bg-[#E11D48]/20 transition-all">
              <Plus size={13} /> Tambah Quiz
            </button>
          </div>

          <div className="space-y-3">
            {quizzes.map((quiz, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                {/* Quiz header */}
                <button
                  onClick={() => setExpandedQuiz(expandedQuiz === i ? null : i)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all"
                >
                  <span className="w-6 h-6 rounded-full bg-[#E11D48]/20 text-[#E11D48] text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-400 flex-1 text-left line-clamp-1">
                    {quiz.question || 'Quiz belum diisi...'}
                  </span>
                  <span className="text-[10px] text-slate-600 flex-shrink-0">{quiz.type}</span>
                  {quizzes.length > 1 && (
                    <button onClick={e => { e.stopPropagation(); removeQuiz(i) }}
                      className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 flex-shrink-0">
                      <Trash2 size={12} />
                    </button>
                  )}
                  {expandedQuiz === i ? <ChevronUp size={14} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />}
                </button>

                <AnimatePresence>
                  {expandedQuiz === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-white/8">
                      <div className="px-4 pb-4 pt-3 space-y-3">
                        {/* Type toggle */}
                        <div className="flex gap-2">
                          {(['multiple_choice', 'word_sort'] as const).map(t => (
                            <button key={t} onClick={() => updateQuiz(i, 'type', t)}
                              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                                quiz.type === t ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]' : 'border-white/10 bg-white/3 text-slate-500'
                              }`}>
                              {t === 'multiple_choice' ? '🔘 Pilihan Ganda' : '🔤 Susun Kata'}
                            </button>
                          ))}
                        </div>

                        <InputField label="Pertanyaan" value={quiz.question}
                          onChange={v => updateQuiz(i, 'question', v)} placeholder="Apa arti kata...?" required />

                        {quiz.type === 'multiple_choice' && (
                          <>
                            <div>
                              <label className="text-xs text-slate-400 mb-1.5 block">Pilihan Jawaban <span className="text-[#E11D48]">*</span></label>
                              <div className="space-y-2">
                                {(quiz.options || ['', '', '', '']).map((opt, oi) => (
                                  <input key={oi} value={opt} onChange={e => updateOption(i, oi, e.target.value)}
                                    placeholder={`Pilihan ${oi + 1}`}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors" />
                                ))}
                              </div>
                            </div>
                            <InputField label="Jawaban Benar (harus sama persis dengan salah satu pilihan)"
                              value={quiz.answer as string} onChange={v => updateQuiz(i, 'answer', v)}
                              placeholder="Pilihan A" required />
                          </>
                        )}

                        {quiz.type === 'word_sort' && (
                          <>
                            <InputField label="Kata-kata (pisah koma, contoh: Sengko'', bade, dhateng)"
                              value={(quiz.words || []).join(', ')}
                              onChange={v => updateQuiz(i, 'words', v.split(',').map(w => w.trim()))}
                              placeholder="Sengko'', bade, dhateng, saniki" required />
                            <InputField label="Urutan Jawaban Benar (pisah koma)"
                              value={Array.isArray(quiz.answer) ? quiz.answer.join(', ') : quiz.answer}
                              onChange={v => updateQuiz(i, 'answer', v.split(',').map(w => w.trim()))}
                              placeholder="Sengko'', bade, dhateng" required />
                          </>
                        )}

                        <InputField label="URL Audio (opsional)"
                          value={quiz.audio || ''} onChange={v => updateQuiz(i, 'audio', v || null)}
                          placeholder="https://xxx.supabase.co/storage/..." />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#0F172A] to-transparent">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Link href="/admin/pelajaran" className="flex-shrink-0">
            <button className="h-12 px-5 rounded-xl border border-white/20 text-sm hover:bg-white/5 transition-all">Batal</button>
          </Link>
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
            className="flex-1 h-12 bg-[#E11D48] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 rose-glow disabled:opacity-50">
            <Save size={16} />
            {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : `Tambah Pelajaran (${quizzes.length} quiz)`}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

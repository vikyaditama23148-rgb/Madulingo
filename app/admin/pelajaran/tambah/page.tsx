'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const DISTRICTS = ['Bangkalan', 'Sampang', 'Pamekasan', 'Sumenep']
const districtColor: Record<string, string> = {
  Bangkalan: '#E11D48',
  Sampang:   '#7C3AED',
  Pamekasan: '#0EA5E9',
  Sumenep:   '#FACC15',
}

interface QuizItem {
  type: 'multiple_choice' | 'word_sort'
  question: string
  options: string[]
  words: string[]
  answer: string | string[]
  audio: string | null
}

function InputField({ label, value, onChange, placeholder, required = false, multiline = false }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  multiline?: boolean
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

const defaultQuiz = (): QuizItem => ({
  type: 'multiple_choice',
  question: '',
  options: ['', '', '', ''],
  words: [],
  answer: '',
  audio: null,
})

export default function TambahPelajaranPage() {
  const router = useRouter()
  const supabase = createClient()
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
  const [quizzes, setQuizzes] = useState<QuizItem[]>([defaultQuiz()])

  const color = districtColor[district] || '#E11D48'

  // ── QUIZ HELPERS ──────────────────────────────────────────────────────────
  const addQuiz = () => {
    setQuizzes(prev => [...prev, defaultQuiz()])
    setExpandedQuiz(quizzes.length)
  }

  const removeQuiz = (i: number) => {
    setQuizzes(prev => prev.filter((_, idx) => idx !== i))
    setExpandedQuiz(null)
  }

  const updateQuiz = (i: number, field: keyof QuizItem, value: any) => {
    setQuizzes(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q))
  }

  const updateOption = (quizIdx: number, optIdx: number, value: string) => {
    setQuizzes(prev => prev.map((q, i) => {
      if (i !== quizIdx) return q
      const newOptions = [...q.options]
      newOptions[optIdx] = value
      return { ...q, options: newOptions }
    }))
  }

  // ── SAVE ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim()) { alert('Judul pelajaran wajib diisi!'); return }
    if (quizzes.some(q => !q.question.trim())) { alert('Semua quiz harus ada pertanyaannya!'); return }
    if (quizzes.some(q => q.type === 'multiple_choice' && !q.answer)) {
      alert('Semua quiz pilihan ganda harus ada jawaban benarnya!')
      return
    }

    setSaving(true)

    const contentJson = {
      description: description.trim(),
      quizzes: quizzes.map(q => ({
        type: q.type,
        question: q.question.trim(),
        ...(q.type === 'multiple_choice' ? {
          options: q.options.filter(o => o.trim()),
          answer: q.answer,
        } : {
          words: q.words,
          answer: q.answer,
        }),
        audio: q.audio || null,
      }))
    }

    const { error } = await supabase.from('lessons').insert({
      title: title.trim(),
      district,
      difficulty: parseInt(difficulty) || 1,
      xp_reward: parseInt(xpReward) || 20,
      coin_reward: parseInt(coinReward) || 10,
      order_index: parseInt(orderIndex) || 1,
      content_json: contentJson,
    })

    if (error) {
      alert('Gagal menyimpan: ' + error.message)
      setSaving(false)
    } else {
      router.push('/admin/pelajaran')
    }
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto pb-32">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/pelajaran">
          <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            Tambah <span className="text-[#E11D48]">Pelajaran Baru</span>
          </h1>
          <p className="text-xs text-slate-500">Buat pelajaran beserta quiz-nya</p>
        </div>
      </div>

      <div className="space-y-4">

        {/* Info pelajaran */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
            📚 Informasi Pelajaran
          </p>
          <InputField
            label="Judul Pelajaran"
            value={title}
            onChange={setTitle}
            placeholder="contoh: Salam & Sapaan"
            required
          />
          <InputField
            label="Deskripsi Singkat"
            value={description}
            onChange={setDescription}
            placeholder="contoh: Belajar cara menyapa dalam bahasa Madura"
            multiline
          />
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

        {/* Pengaturan */}
        <div className="glass rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color }}>
            ⚙️ Pengaturan
          </p>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <InputField label="XP Reward" value={xpReward} onChange={setXpReward} placeholder="20" />
            <InputField label="Koin Reward" value={coinReward} onChange={setCoinReward} placeholder="10" />
            <InputField label="Urutan" value={orderIndex} onChange={setOrderIndex} placeholder="1" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Tingkat Kesulitan</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setDifficulty(String(n))}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                    difficulty === String(n)
                      ? 'border-[#FACC15] bg-[#FACC15]/10 text-[#FACC15]'
                      : 'border-white/10 bg-white/3 text-slate-500'
                  }`}
                >
                  {n}⭐
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quiz items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">
              🎯 Quiz <span className="text-slate-500 font-normal">({quizzes.length} soal)</span>
            </p>
            <button
              onClick={addQuiz}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20 rounded-xl text-xs font-semibold hover:bg-[#E11D48]/20 transition-all"
            >
              <Plus size={13} /> Tambah Soal
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
                    {quiz.question || 'Soal belum diisi...'}
                  </span>
                  <span className="text-[10px] text-slate-600 flex-shrink-0 hidden sm:block">
                    {quiz.type === 'multiple_choice' ? '🔘 Pilihan Ganda' : '🔤 Susun Kata'}
                  </span>
                  {quizzes.length > 1 && (
                    <button
                      onClick={e => { e.stopPropagation(); removeQuiz(i) }}
                      className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 flex-shrink-0 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                  {expandedQuiz === i
                    ? <ChevronUp size={14} className="text-slate-500 flex-shrink-0" />
                    : <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />
                  }
                </button>

                {/* Quiz content */}
                <AnimatePresence>
                  {expandedQuiz === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-white/8"
                    >
                      <div className="px-4 pb-4 pt-3 space-y-3">

                        {/* Type toggle */}
                        <div className="flex gap-2">
                          {(['multiple_choice', 'word_sort'] as const).map(t => (
                            <button
                              key={t}
                              onClick={() => updateQuiz(i, 'type', t)}
                              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                                quiz.type === t
                                  ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]'
                                  : 'border-white/10 bg-white/3 text-slate-500'
                              }`}
                            >
                              {t === 'multiple_choice' ? '🔘 Pilihan Ganda' : '🔤 Susun Kata'}
                            </button>
                          ))}
                        </div>

                        {/* Pertanyaan */}
                        <InputField
                          label="Pertanyaan"
                          value={quiz.question}
                          onChange={v => updateQuiz(i, 'question', v)}
                          placeholder="contoh: Apa arti kata 'mera' dalam bahasa Indonesia?"
                          required
                        />

                        {/* Multiple choice */}
                        {quiz.type === 'multiple_choice' && (
                          <>
                            <div>
                              <label className="text-xs text-slate-400 mb-1.5 block">
                                Pilihan Jawaban <span className="text-[#E11D48]">*</span>
                              </label>
                              <div className="space-y-2">
                                {quiz.options.map((opt, oi) => (
                                  <div key={oi} className="flex items-center gap-2">
                                    <span className="text-xs text-slate-600 w-4 flex-shrink-0">{oi + 1}.</span>
                                    <input
                                      value={opt}
                                      onChange={e => updateOption(i, oi, e.target.value)}
                                      placeholder={`Pilihan ${oi + 1}`}
                                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-[#E11D48] transition-colors"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 mb-1.5 block">
                                Jawaban Benar <span className="text-[#E11D48]">*</span>
                                <span className="text-slate-600 ml-1">(harus sama persis dengan salah satu pilihan)</span>
                              </label>
                              <input
                                value={quiz.answer as string}
                                onChange={e => updateQuiz(i, 'answer', e.target.value)}
                                placeholder="contoh: Merah"
                                className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
                              />
                            </div>
                          </>
                        )}

                        {/* Word sort */}
                        {quiz.type === 'word_sort' && (
                          <>
                            <div>
                              <label className="text-xs text-slate-400 mb-1.5 block">
                                Kata-kata yang tersedia <span className="text-[#E11D48]">*</span>
                                <span className="text-slate-600 ml-1">(pisah dengan koma)</span>
                              </label>
                              <input
                                value={Array.isArray(quiz.words) ? quiz.words.join(', ') : ''}
                                onChange={e => updateQuiz(i, 'words', e.target.value.split(',').map(w => w.trim()).filter(Boolean))}
                                placeholder="contoh: Sengko'', bade, dhateng, saniki, muleh"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-[#E11D48] transition-colors"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 mb-1.5 block">
                                Urutan Jawaban Benar <span className="text-[#E11D48]">*</span>
                                <span className="text-slate-600 ml-1">(pisah dengan koma, urutan yang benar)</span>
                              </label>
                              <input
                                value={Array.isArray(quiz.answer) ? quiz.answer.join(', ') : ''}
                                onChange={e => updateQuiz(i, 'answer', e.target.value.split(',').map(w => w.trim()).filter(Boolean))}
                                placeholder="contoh: Sengko'', bade, dhateng"
                                className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
                              />
                            </div>
                          </>
                        )}

                        {/* Audio */}
                        <div>
                          <label className="text-xs text-slate-400 mb-1.5 block">
                            URL Audio Pronunciaton <span className="text-slate-600">(opsional)</span>
                          </label>
                          <input
                            value={quiz.audio || ''}
                            onChange={e => updateQuiz(i, 'audio', e.target.value || null)}
                            placeholder="https://xxx.supabase.co/storage/v1/object/public/audio/..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-[#E11D48] transition-colors"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="glass rounded-xl p-4 border-l-2 border-[#FACC15]">
          <p className="text-xs text-[#FACC15] font-semibold mb-1">💡 Tips Membuat Quiz</p>
          <ul className="text-xs text-slate-500 space-y-1 leading-relaxed">
            <li>• Jawaban benar harus sama persis dengan salah satu pilihan (termasuk huruf besar/kecil)</li>
            <li>• Minimal 2 pilihan, disarankan 4 pilihan untuk pilihan ganda</li>
            <li>• Untuk susun kata, pastikan semua kata jawaban ada di daftar kata yang tersedia</li>
          </ul>
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#0F172A] to-transparent">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Link href="/admin/pelajaran" className="flex-shrink-0">
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
            {saving ? 'Menyimpan...' : `Tambah Pelajaran (${quizzes.length} soal)`}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, CheckCircle, XCircle, Timer } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/userStore'

type QuizItem = {
  type: 'multiple_choice' | 'word_sort' | 'fill_blank' | 'true_false'
  question: string
  options?: string[]
  words?: string[]
  answer: string | string[] | boolean
  hint?: string
  timer?: number
  audio?: string | null
}

export default function LessonPage() {
  const router = useRouter()
  const params = useParams()
  const lessonId = params.lessonId as string
  const supabase = createClient()
  const { profile, hearts, loseHeart, updateXP, updateCoins } = useUserStore()

  const [lesson, setLesson] = useState<any>(null)
  const [quizzes, setQuizzes] = useState<QuizItem[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)

  // Multiple choice
  const [selected, setSelected] = useState<string | null>(null)

  // Word sort
  const [sortedWords, setSortedWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])

  // Fill blank
  const [fillInput, setFillInput] = useState('')

  // True false
  const [timeLeft, setTimeLeft] = useState<number>(5)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLesson = async () => {
      const { data } = await supabase.from('lessons').select('*').eq('id', lessonId).single()
      if (data) {
        setLesson(data)
        setQuizzes(data.content_json.quizzes || [])
      }
      setLoading(false)
    }
    fetchLesson()
  }, [lessonId])

  // Reset state saat ganti soal
  useEffect(() => {
    const q = quizzes[currentIdx]
    if (!q) return

    setSelected(null)
    setAnswered(false)
    setIsCorrect(false)
    setFillInput('')

    if (q.type === 'word_sort') {
      setAvailableWords([...(q.words || [])].sort(() => Math.random() - 0.5))
      setSortedWords([])
    }

    if (q.type === 'true_false') {
      const t = q.timer ?? 5
      setTimeLeft(t)
      setTimerActive(true)
    } else {
      setTimerActive(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentIdx, quizzes])

  // Timer countdown untuk true/false
  useEffect(() => {
    if (!timerActive) return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setTimerActive(false)
          // Waktu habis = salah
          if (!answered) {
            setAnswered(true)
            setIsCorrect(false)
            loseHeart()
          }
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerActive])

  const currentQuiz = quizzes[currentIdx]

  const checkAnswer = (answer: string | string[] | boolean) => {
    const correct = JSON.stringify(answer) === JSON.stringify(currentQuiz.answer)
    setIsCorrect(correct)
    setAnswered(true)
    setTimerActive(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (correct) setScore(s => s + 1)
    else loseHeart()
  }

  // ── MULTIPLE CHOICE ───────────────────────────────────────────────────────
  const handleMultipleChoice = (option: string) => {
    if (answered) return
    setSelected(option)
    checkAnswer(option)
  }

  // ── WORD SORT ─────────────────────────────────────────────────────────────
  const handleWordClick = (word: string) => {
    if (answered) return
    setSortedWords(prev => [...prev, word])
    setAvailableWords(prev => {
      const idx = prev.indexOf(word)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const handleRemoveWord = (word: string, idx: number) => {
    if (answered) return
    setSortedWords(prev => prev.filter((_, i) => i !== idx))
    setAvailableWords(prev => [...prev, word])
  }

  const handleSubmitSort = () => {
    if (answered) return
    checkAnswer(sortedWords)
  }

  // ── FILL BLANK ────────────────────────────────────────────────────────────
  const handleSubmitFill = () => {
    if (answered || !fillInput.trim()) return
    // Case-insensitive check
    const correct = fillInput.trim().toLowerCase() === (currentQuiz.answer as string).toLowerCase()
    setIsCorrect(correct)
    setAnswered(true)
    if (correct) setScore(s => s + 1)
    else loseHeart()
  }

  // ── TRUE FALSE ────────────────────────────────────────────────────────────
  const handleTrueFalse = (value: boolean) => {
    if (answered) return
    checkAnswer(value)
  }

  // ── NEXT ──────────────────────────────────────────────────────────────────
  const handleNext = async () => {
    if (currentIdx < quizzes.length - 1) {
      setCurrentIdx(i => i + 1)
    } else {
      await finishLesson()
      setCompleted(true)
    }
  }

  const finishLesson = async () => {
    if (!profile) return
    const xpGain = lesson?.xp_reward || 20
    const coinGain = lesson?.coin_reward || 10

    await Promise.all([
      supabase.from('user_progress').upsert({
        user_id: profile.id,
        lesson_id: lessonId,
        is_completed: true,
        score,
        completed_at: new Date().toISOString(),
      }),
      supabase.from('profiles').update({
        xp: profile.xp + xpGain,
        coins: profile.coins + coinGain,
      }).eq('id', profile.id),
    ])

    updateXP(xpGain)
    updateCoins(coinGain)
  }

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#E11D48] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // ── COMPLETED ─────────────────────────────────────────────────────────────
  if (completed) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm w-full"
        >
          <div className="text-7xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Luar Biasa!
          </h2>
          <p className="text-slate-400 mb-6">
            Kamu menyelesaikan <strong className="text-white">{lesson?.title}</strong>
          </p>

          <div className="glass rounded-2xl p-5 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#FACC15]">+{lesson?.xp_reward}</p>
                <p className="text-xs text-slate-500">XP didapat</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#FACC15]">🪙 +{lesson?.coin_reward}</p>
                <p className="text-xs text-slate-500">Koin didapat</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 text-center">
              <p className="text-sm text-slate-400">
                Skor: <span className="text-white font-bold">{score}/{quizzes.length}</span> benar
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/learn')}
              className="flex-1 py-3 border border-white/20 rounded-xl text-sm font-semibold hover:bg-white/5 transition-all"
            >
              Kembali
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/dashboard')}
              className="flex-1 py-3 bg-[#E11D48] rounded-xl text-sm font-semibold rose-glow transition-all"
            >
              Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!currentQuiz) return null

  // Label tipe quiz
  const typeLabel: Record<string, string> = {
    multiple_choice: '🔘 Pilihan Ganda',
    word_sort: '🔤 Susun Kata',
    fill_blank: '✍️ Isi Kalimat',
    true_false: '⚡ Benar atau Salah',
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col px-4 pt-6 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl text-slate-500 hover:text-white">
          <X size={20} />
        </button>

        {/* Progress bar */}
        <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#E11D48] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIdx + 1) / quizzes.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Heart key={i} size={16} className={i < hearts ? 'text-[#E11D48] fill-[#E11D48]' : 'text-slate-700'} />
          ))}
        </div>
      </div>

      {/* Quiz Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="flex-1"
        >
          {/* Nomor & tipe soal */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#E11D48] font-medium uppercase tracking-wider">
              {currentIdx + 1}/{quizzes.length}
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {typeLabel[currentQuiz.type]}
            </span>
          </div>

          {/* ══ TRUE FALSE — Timer khusus di atas soal ══ */}
          {currentQuiz.type === 'true_false' && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Timer size={12} />
                  <span>Waktu tersisa</span>
                </div>
                <span className={`text-sm font-black ${timeLeft <= 2 ? 'text-red-400' : 'text-[#FACC15]'}`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: timeLeft <= 2 ? '#EF4444' : '#FACC15' }}
                  animate={{ width: `${(timeLeft / (currentQuiz.timer ?? 5)) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Pertanyaan */}
          <h2 className="text-xl font-semibold mb-6 leading-snug">{currentQuiz.question}</h2>

          {/* ══════════════════════════════════════
              MULTIPLE CHOICE
          ══════════════════════════════════════ */}
          {currentQuiz.type === 'multiple_choice' && (
            <div className="space-y-3">
              {currentQuiz.options?.map(option => {
                const isSelected = selected === option
                const isAnswer = option === currentQuiz.answer
                let borderColor = 'border-white/10'
                let bgColor = 'bg-white/3'

                if (answered && isAnswer) {
                  borderColor = 'border-green-500'
                  bgColor = 'bg-green-500/10'
                } else if (answered && isSelected && !isAnswer) {
                  borderColor = 'border-red-500'
                  bgColor = 'bg-red-500/10'
                } else if (isSelected) {
                  borderColor = 'border-[#E11D48]'
                  bgColor = 'bg-[#E11D48]/10'
                }

                return (
                  <motion.button
                    key={option}
                    whileTap={{ scale: answered ? 1 : 0.98 }}
                    onClick={() => handleMultipleChoice(option)}
                    className={`w-full p-4 rounded-xl border ${borderColor} ${bgColor} text-left flex items-center justify-between transition-all`}
                  >
                    <span className="font-medium">{option}</span>
                    {answered && isAnswer && <CheckCircle size={18} className="text-green-400" />}
                    {answered && isSelected && !isAnswer && <XCircle size={18} className="text-red-400" />}
                  </motion.button>
                )
              })}
            </div>
          )}

          {/* ══════════════════════════════════════
              WORD SORT
          ══════════════════════════════════════ */}
          {currentQuiz.type === 'word_sort' && (
            <div className="space-y-4">
              <div className="min-h-14 p-3 rounded-xl border border-dashed border-white/20 flex flex-wrap gap-2">
                {sortedWords.map((word, i) => (
                  <motion.button
                    key={`${word}-${i}`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRemoveWord(word, i)}
                    className="px-3 py-1.5 bg-[#E11D48]/20 border border-[#E11D48]/40 rounded-lg text-sm font-medium"
                  >
                    {word}
                  </motion.button>
                ))}
                {sortedWords.length === 0 && (
                  <span className="text-slate-600 text-sm self-center">Klik kata di bawah untuk menyusun...</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {availableWords.map((word, i) => (
                  <motion.button
                    key={`${word}-${i}`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleWordClick(word)}
                    className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/20 transition-all"
                  >
                    {word}
                  </motion.button>
                ))}
              </div>

              {!answered && sortedWords.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitSort}
                  className="w-full py-3 bg-[#E11D48] rounded-xl font-semibold text-sm rose-glow"
                >
                  Periksa Jawaban
                </motion.button>
              )}

              {answered && (
                <div className={`p-3 rounded-xl ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <p className={`text-sm font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? '✅ Benar!' : `❌ Jawaban: ${(currentQuiz.answer as string[]).join(' ')}`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              FILL BLANK — ISI KALIMAT RUMPANG
          ══════════════════════════════════════ */}
          {currentQuiz.type === 'fill_blank' && (
            <div className="space-y-4">
              {/* Hint kalau ada */}
              {currentQuiz.hint && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FACC15]/5 border border-[#FACC15]/15">
                  <span className="text-base">💡</span>
                  <p className="text-xs text-[#FACC15]">{currentQuiz.hint}</p>
                </div>
              )}

              {/* Input jawaban */}
              <div className="relative">
                <input
                  type="text"
                  value={fillInput}
                  onChange={e => setFillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmitFill()}
                  placeholder="Ketik jawaban di sini..."
                  disabled={answered}
                  autoFocus
                  className={`w-full px-4 py-4 rounded-xl text-base font-semibold text-center transition-all focus:outline-none
                    ${answered && isCorrect
                      ? 'bg-green-500/10 border-2 border-green-500 text-green-400'
                      : answered && !isCorrect
                      ? 'bg-red-500/10 border-2 border-red-500 text-red-400'
                      : 'bg-white/5 border-2 border-white/10 text-white focus:border-[#E11D48]'
                    }`}
                />
                {answered && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isCorrect
                      ? <CheckCircle size={20} className="text-green-400" />
                      : <XCircle size={20} className="text-red-400" />
                    }
                  </div>
                )}
              </div>

              {/* Tombol periksa */}
              {!answered && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitFill}
                  disabled={!fillInput.trim()}
                  className="w-full py-3.5 bg-[#E11D48] rounded-xl font-semibold text-sm rose-glow disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Periksa Jawaban
                </motion.button>
              )}

              {/* Feedback */}
              {answered && (
                <div className={`p-3 rounded-xl ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <p className={`text-sm font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? '✅ Tepat sekali!' : `❌ Jawaban benar: ${currentQuiz.answer}`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              TRUE FALSE — KILAT
          ══════════════════════════════════════ */}
          {currentQuiz.type === 'true_false' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Tombol BENAR */}
                <motion.button
                  whileTap={{ scale: answered ? 1 : 0.95 }}
                  onClick={() => handleTrueFalse(true)}
                  disabled={answered}
                  className={`py-8 rounded-2xl font-black text-2xl border-2 transition-all flex flex-col items-center justify-center gap-2
                    ${answered
                      ? currentQuiz.answer === true
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-white/3 border-white/10 text-slate-600'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 active:scale-95'
                    }`}
                >
                  <span className="text-3xl">✅</span>
                  <span className="text-base font-bold">BENAR</span>
                </motion.button>

                {/* Tombol SALAH */}
                <motion.button
                  whileTap={{ scale: answered ? 1 : 0.95 }}
                  onClick={() => handleTrueFalse(false)}
                  disabled={answered}
                  className={`py-8 rounded-2xl font-black text-2xl border-2 transition-all flex flex-col items-center justify-center gap-2
                    ${answered
                      ? currentQuiz.answer === false
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-white/3 border-white/10 text-slate-600'
                      : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 active:scale-95'
                    }`}
                >
                  <span className="text-3xl">❌</span>
                  <span className="text-base font-bold">SALAH</span>
                </motion.button>
              </div>

              {/* Feedback */}
              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}
                >
                  <p className={`text-sm font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {timeLeft === 0 && !isCorrect
                      ? `⏰ Waktu habis! Jawaban: ${currentQuiz.answer === true ? 'BENAR' : 'SALAH'}`
                      : isCorrect
                      ? '✅ Tepat! Kamu cepat!'
                      : `❌ Jawaban benar: ${currentQuiz.answer === true ? 'BENAR' : 'SALAH'}`
                    }
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Feedback & Next */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pb-4 pt-4"
          >
            {currentQuiz.type === 'multiple_choice' && (
              <div className={`p-3 rounded-xl mb-4 ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <p className={`text-sm font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? '✅ Betul! Kamu hebat!' : `❌ Jawaban benar: ${currentQuiz.answer}`}
                </p>
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="w-full py-4 bg-[#E11D48] hover:bg-[#BE123C] rounded-2xl font-semibold rose-glow transition-all"
            >
              {currentIdx < quizzes.length - 1 ? 'Lanjut →' : 'Selesai! 🎉'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquarePlus, X, Star, Send, Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/userStore'

const KATEGORI = [
  { key: 'bug',    label: '🐛 Bug / Error',   color: '#EF4444' },
  { key: 'saran',  label: '💡 Saran',          color: '#FACC15' },
  { key: 'pujian', label: '❤️ Pujian',         color: '#34D399' },
]

export default function FeedbackButton() {
  const { profile } = useUserStore()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [kategori, setKategori] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 3MB')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!rating) { alert('Berikan rating dulu ya!'); return }
    if (!kategori) { alert('Pilih kategori feedback'); return }
    if (!deskripsi.trim()) { alert('Tulis deskripsi feedback'); return }
    if (!profile) { alert('Kamu harus login dulu'); return }

    setSending(true)

    let image_url: string | null = null

    // Upload gambar jika ada
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const filename = `feedback/${profile.id}_${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('feedback-images')
        .upload(filename, imageFile, { upsert: true })
      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('feedback-images')
          .getPublicUrl(filename)
        image_url = urlData.publicUrl
      }
    }

    const { error } = await supabase.from('feedback').insert({
      user_id: profile.id,
      username: profile.username || 'Anonim',
      rating,
      kategori,
      deskripsi: deskripsi.trim(),
      image_url,
      status: 'baru',
    })

    setSending(false)

    if (error) {
      alert('Gagal mengirim feedback: ' + error.message)
      return
    }

    setSent(true)
    setTimeout(() => {
      setSent(false)
      setOpen(false)
      setRating(0)
      setKategori('')
      setDeskripsi('')
      setImageFile(null)
      setImagePreview(null)
    }, 2500)
  }

  return (
    <>
      {/* ── FLOATING BUTTON ── */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, #E11D48, #9F1239)' }}
      >
        <MessageSquarePlus size={20} className="text-white" />
        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl border-2 border-[#E11D48]"
        />
      </motion.button>

      {/* ── MODAL FEEDBACK ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden"
              style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-2 pb-4">
                <div>
                  <h3 className="font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Beri <span className="text-[#E11D48]">Feedback</span>
                  </h3>
                  <p className="text-xs text-slate-500">Bantu kami tingkatkan MaduLingo</p>
                </div>
                <button onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className="px-5 pb-28 space-y-4 max-h-[75vh] overflow-y-auto">

                {/* SUCCESS STATE */}
                <AnimatePresence>
                  {sent && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="text-5xl mb-3">🎉</div>
                      <h4 className="font-bold text-lg mb-1">Terima kasih!</h4>
                      <p className="text-slate-400 text-sm">Feedback kamu sudah kami terima</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!sent && (
                  <>
                    {/* RATING BINTANG */}
                    <div>
                      <p className="text-xs text-slate-400 mb-2 font-medium">
                        Seberapa puas kamu? <span className="text-[#E11D48]">*</span>
                      </p>
                      <div className="flex gap-2 justify-center py-2">
                        {[1, 2, 3, 4, 5].map(s => (
                          <motion.button
                            key={s}
                            whileTap={{ scale: 0.85 }}
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(s)}
                            className="text-3xl transition-all"
                          >
                            <Star
                              size={32}
                              className={`transition-all ${
                                s <= (hoverRating || rating)
                                  ? 'text-[#FACC15] fill-[#FACC15]'
                                  : 'text-slate-700'
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <p className="text-center text-xs text-slate-500 mt-1">
                          {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Luar Biasa!'][rating]}
                        </p>
                      )}
                    </div>

                    {/* KATEGORI */}
                    <div>
                      <p className="text-xs text-slate-400 mb-2 font-medium">
                        Kategori <span className="text-[#E11D48]">*</span>
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {KATEGORI.map(k => (
                          <button
                            key={k.key}
                            onClick={() => setKategori(k.key)}
                            className="py-2.5 px-2 rounded-xl text-xs font-semibold border-2 transition-all"
                            style={kategori === k.key
                              ? { borderColor: k.color, backgroundColor: k.color + '15', color: k.color }
                              : { borderColor: 'rgba(255,255,255,0.08)', color: '#64748b', backgroundColor: 'rgba(255,255,255,0.02)' }
                            }
                          >
                            {k.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DESKRIPSI */}
                    <div>
                      <p className="text-xs text-slate-400 mb-2 font-medium">
                        Ceritakan lebih detail <span className="text-[#E11D48]">*</span>
                      </p>
                      <textarea
                        value={deskripsi}
                        onChange={e => setDeskripsi(e.target.value)}
                        placeholder="Tulis pengalaman, saran, atau masalah yang kamu temukan..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors resize-none"
                      />
                      <p className="text-right text-[10px] text-slate-600 mt-1">
                        {deskripsi.length}/500
                      </p>
                    </div>

                    {/* UPLOAD GAMBAR */}
                    <div>
                      <p className="text-xs text-slate-400 mb-2 font-medium">
                        Screenshot <span className="text-slate-600">(opsional, maks 3MB)</span>
                      </p>
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} alt="preview"
                            className="w-full h-32 object-cover rounded-xl border border-white/10" />
                          <button
                            onClick={() => { setImageFile(null); setImagePreview(null) }}
                            className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-all"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 w-full h-20 rounded-xl border border-dashed border-white/15 cursor-pointer hover:border-white/30 hover:bg-white/3 transition-all">
                          <Upload size={18} className="text-slate-600" />
                          <span className="text-xs text-slate-600">Klik untuk upload gambar</span>
                          <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* SUBMIT */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSubmit}
                      disabled={sending}
                      className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 rose-glow disabled:opacity-50 transition-all"
                      style={{ background: 'linear-gradient(135deg, #E11D48, #9F1239)' }}
                    >
                      {sending
                        ? <><Loader2 size={16} className="animate-spin" /> Mengirim...</>
                        : <><Send size={16} /> Kirim Feedback</>
                      }
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

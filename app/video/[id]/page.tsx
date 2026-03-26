'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ThumbsUp, ThumbsDown, Bookmark,
  BookmarkCheck, Share2, Eye, Send, Trash2,
  Play, ChevronDown, ChevronUp, MoreVertical, X,
  MessageCircle, Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/stores/userStore'

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface Video {
  id: string
  title: string
  description: string
  youtube_url: string | null
  storage_url: string | null
  thumbnail_url: string | null
  kategori: string
  district: string
  view_count: number
  duration: string | null
  is_featured: boolean
  created_at: string
  uploader_id: string | null
}

interface Comment {
  id: string
  content: string
  user_id: string
  parent_id: string | null
  created_at: string
  profiles: { username: string; avatar_url: string | null }
  replies?: Comment[]
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/)
  return match ? match[1] : null
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days < 7) return `${days} hari lalu`
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`
  return `${Math.floor(days / 30)} bulan lalu`
}

const KATEGORI_LABEL: Record<string, string> = {
  tradisi: '🎭 Tradisi', pariwisata: '🗺️ Pariwisata',
  alam: '🌿 Alam', religi: '🕌 Religi',
  seni: '🎨 Seni & Kerajinan', bahasa: '🗣️ Bahasa',
  tokoh: '📜 Tokoh & Sejarah', materi: '📚 Materi',
  musik: '🎵 Musik', hiburan: '🎉 Hiburan', makanan: '🍜 Makanan',
}

// ── COMMENT ITEM ──────────────────────────────────────────────────────────────
function CommentItem({
  comment, userId, videoId, onDelete, onReply, depth = 0
}: {
  comment: Comment
  userId: string | null
  videoId: string
  onDelete: (id: string) => void
  onReply: (parentId: string, username: string) => void
  depth?: number
}) {
  const [showReplies, setShowReplies] = useState(false)
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E11D48] to-[#9F1239] flex items-center justify-center text-xs font-bold flex-shrink-0">
          {comment.profiles?.username?.[0]?.toUpperCase() || '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-300">
              {comment.profiles?.username || 'Pengguna'}
            </span>
            <span className="text-[10px] text-slate-600">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            {userId && (
              <button
                onClick={() => onReply(comment.id, comment.profiles?.username || '')}
                className="text-[11px] text-slate-600 hover:text-slate-300 transition-colors font-medium"
              >
                Balas
              </button>
            )}
            {userId === comment.user_id && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-[11px] text-red-500/60 hover:text-red-400 transition-colors"
              >
                <Trash2 size={11} />
              </button>
            )}
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-[11px] text-[#E11D48] font-medium"
              >
                {showReplies ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                {comment.replies!.length} balasan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      <AnimatePresence>
        {showReplies && hasReplies && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {comment.replies!.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                userId={userId}
                videoId={videoId}
                onDelete={onDelete}
                onReply={onReply}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function VideoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const videoId = params.id as string
  const supabase = createClient()
  const { profile } = useUserStore()

  const [video, setVideo] = useState<Video | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [likeCount, setLikeCount] = useState(0)
  const [dislikeCount, setDislikeCount] = useState(0)
  const [userLike, setUserLike] = useState<'like' | 'dislike' | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDesc, setShowDesc] = useState(false)
  const commentRef = useRef<HTMLTextAreaElement>(null)

  const userId = profile?.id || null

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      await Promise.all([fetchVideo(), fetchComments(), fetchInteractions()])
      // Catat ke history & tambah view
      await recordView(user.id)
      setLoading(false)
    }
    init()
  }, [videoId])

  const fetchVideo = async () => {
    const { data } = await supabase.from('videos').select('*').eq('id', videoId).single()
    if (data) setVideo(data)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('video_comments')
      .select('*, profiles(username, avatar_url)')
      .eq('video_id', videoId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (!data) return

    // Fetch replies
    const withReplies = await Promise.all(data.map(async (comment: any) => {
      const { data: replies } = await supabase
        .from('video_comments')
        .select('*, profiles(username, avatar_url)')
        .eq('parent_id', comment.id)
        .order('created_at', { ascending: true })
      return { ...comment, replies: replies || [] }
    }))

    setComments(withReplies)
  }

  const fetchInteractions = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    // Like counts
    const { data: likes } = await supabase
      .from('video_likes').select('type').eq('video_id', videoId)
    if (likes) {
      setLikeCount(likes.filter(l => l.type === 'like').length)
      setDislikeCount(likes.filter(l => l.type === 'dislike').length)
    }

    if (user) {
      // User like
      const { data: myLike } = await supabase
        .from('video_likes').select('type').eq('video_id', videoId).eq('user_id', user.id).single()
      if (myLike) setUserLike(myLike.type as 'like' | 'dislike')

      // Bookmark
      const { data: bookmark } = await supabase
        .from('video_bookmarks').select('id').eq('video_id', videoId).eq('user_id', user.id).single()
      setIsBookmarked(!!bookmark)
    }
  }

  const recordView = async (userId: string) => {
    await supabase.from('video_history').upsert({ user_id: userId, video_id: videoId, watched_at: new Date().toISOString() }, { onConflict: 'user_id,video_id' })
    await supabase.from('videos').update({ view_count: (video?.view_count || 0) + 1 }).eq('id', videoId)
  }

  const handleLike = async (type: 'like' | 'dislike') => {
    if (!userId) { router.push('/login'); return }

    if (userLike === type) {
      // Remove like
      await supabase.from('video_likes').delete().eq('video_id', videoId).eq('user_id', userId)
      setUserLike(null)
      if (type === 'like') setLikeCount(c => c - 1)
      else setDislikeCount(c => c - 1)
    } else {
      // Remove old like first
      if (userLike) {
        await supabase.from('video_likes').delete().eq('video_id', videoId).eq('user_id', userId)
        if (userLike === 'like') setLikeCount(c => c - 1)
        else setDislikeCount(c => c - 1)
      }
      // Add new like
      await supabase.from('video_likes').insert({ video_id: videoId, user_id: userId, type })
      setUserLike(type)
      if (type === 'like') setLikeCount(c => c + 1)
      else setDislikeCount(c => c + 1)
    }
  }

  const handleBookmark = async () => {
    if (!userId) { router.push('/login'); return }
    if (isBookmarked) {
      await supabase.from('video_bookmarks').delete().eq('video_id', videoId).eq('user_id', userId)
      setIsBookmarked(false)
    } else {
      await supabase.from('video_bookmarks').insert({ video_id: videoId, user_id: userId })
      setIsBookmarked(true)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const text = `Tonton "${video?.title}" di MaduTube! 🎬\n\nPlatform video budaya Madura 🏝️\n\n#MaduLingo #BudayaMadura`
    if (navigator.share) await navigator.share({ title: video?.title, text, url })
    else { await navigator.clipboard.writeText(url); alert('Link berhasil disalin!') }
  }

  const handleComment = async () => {
    if (!userId || !commentText.trim()) return
    setSubmitting(true)

    await supabase.from('video_comments').insert({
      video_id: videoId,
      user_id: userId,
      content: commentText.trim(),
      parent_id: replyTo?.id || null,
    })

    setCommentText('')
    setReplyTo(null)
    await fetchComments()
    setSubmitting(false)
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Hapus komentar ini?')) return
    await supabase.from('video_comments').delete().eq('id', commentId)
    await fetchComments()
  }

  const handleReply = (parentId: string, username: string) => {
    setReplyTo({ id: parentId, username })
    setCommentText(`@${username} `)
    commentRef.current?.focus()
  }

  const totalComments = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#E11D48] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center text-slate-500">
        Video tidak ditemukan
      </div>
    )
  }

  const youtubeId = video.youtube_url ? getYouTubeId(video.youtube_url) : null

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0F1E]/95 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/video">
            <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E11D48] rounded-lg flex items-center justify-center">
              <Play size={12} className="fill-white text-white ml-0.5" />
            </div>
            <span className="font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Madu<span className="text-[#E11D48]">Tube</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 pb-16">

        {/* ── VIDEO PLAYER ── */}
        <div className="rounded-2xl overflow-hidden bg-black mb-4 aspect-video">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : video.storage_url ? (
            <video src={video.storage_url} controls className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
              <Play size={48} className="text-slate-600" />
            </div>
          )}
        </div>

        {/* ── VIDEO INFO ── */}
        <div className="mb-4">
          <h1 className="text-lg font-bold leading-snug mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {video.title}
          </h1>

          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Eye size={11} /> {video.view_count.toLocaleString()} tayangan
            </span>
            <span>·</span>
            <span>{timeAgo(video.created_at)}</span>
            <span>·</span>
            <span className="px-2 py-0.5 bg-white/8 rounded-full">
              {KATEGORI_LABEL[video.kategori] || video.kategori}
            </span>
            {video.district !== 'Umum' && (
              <>
                <span>·</span>
                <span>{video.district}</span>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Like */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleLike('like')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                userLike === 'like'
                  ? 'bg-[#E11D48] text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              <ThumbsUp size={15} className={userLike === 'like' ? 'fill-white' : ''} />
              {likeCount > 0 && likeCount}
            </motion.button>

            {/* Dislike */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleLike('dislike')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                userLike === 'dislike'
                  ? 'bg-slate-600 text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              <ThumbsDown size={15} className={userLike === 'dislike' ? 'fill-white' : ''} />
              {dislikeCount > 0 && dislikeCount}
            </motion.button>

            {/* Bookmark */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isBookmarked
                  ? 'bg-[#FACC15]/20 text-[#FACC15]'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              {isBookmarked ? 'Tersimpan' : 'Simpan'}
            </motion.button>

            {/* Share */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-slate-300 hover:bg-white/15 transition-all"
            >
              <Share2 size={15} />
              Bagikan
            </motion.button>
          </div>
        </div>

        {/* ── DESCRIPTION ── */}
        {video.description && (
          <div className="bg-white/5 rounded-2xl p-4 mb-6">
            <p className={`text-sm text-slate-300 leading-relaxed ${!showDesc ? 'line-clamp-3' : ''}`}>
              {video.description}
            </p>
            {video.description.length > 150 && (
              <button
                onClick={() => setShowDesc(!showDesc)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 mt-2 transition-colors"
              >
                {showDesc ? <><ChevronUp size={12} /> Lebih sedikit</> : <><ChevronDown size={12} /> Selengkapnya</>}
              </button>
            )}
          </div>
        )}

        {/* ── COMMENTS ── */}
        <div>
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <MessageCircle size={18} className="text-[#E11D48]" />
            {totalComments} Komentar
          </h2>

          {/* Comment input */}
          {userId && (
            <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E11D48] to-[#9F1239] flex items-center justify-center text-xs font-bold flex-shrink-0">
                {profile?.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                {replyTo && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-[#E11D48]">
                    <span>Membalas @{replyTo.username}</span>
                    <button onClick={() => { setReplyTo(null); setCommentText('') }}
                      className="text-slate-500 hover:text-white">
                      <X size={12} />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    ref={commentRef}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder={replyTo ? `Balas @${replyTo.username}...` : 'Tambahkan komentar...'}
                    rows={2}
                    className="flex-1 bg-white/8 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#E11D48] transition-colors resize-none"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleComment}
                    disabled={!commentText.trim() || submitting}
                    className="w-10 h-10 self-end bg-[#E11D48] rounded-xl flex items-center justify-center rose-glow disabled:opacity-40 transition-all flex-shrink-0"
                  >
                    <Send size={16} />
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* Comment list */}
          {comments.length === 0 ? (
            <div className="text-center py-10 text-slate-600">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada komentar. Jadilah yang pertama!</p>
            </div>
          ) : (
            <div className="space-y-5">
              {comments.map((comment, i) => (
                <motion.div key={comment.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <CommentItem
                    comment={comment}
                    userId={userId}
                    videoId={videoId}
                    onDelete={handleDeleteComment}
                    onReply={handleReply}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

const LIMITS = {
  guest: 3,
  user: 20,
  admin: Infinity,
}

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/[?!.,]/g, '').replace(/\s+/g, ' ')
}

function similarityScore(a: string, b: string): number {
  const wordsA = new Set(a.split(' ').filter(w => w.length > 2))
  const wordsB = new Set(b.split(' ').filter(w => w.length > 2))
  if (wordsA.size === 0 || wordsB.size === 0) return 0
  let matches = 0
  wordsA.forEach(w => { if (wordsB.has(w)) matches++ })
  return matches / Math.max(wordsA.size, wordsB.size)
}

function getWIBDate(): string {
  const now = new Date()
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  return wib.toISOString().split('T')[0]
}

function getWIBHour(): number {
  const now = new Date()
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  return wib.getUTCHours()
}

// Hitung jam menuju reset Gemini (07.00 WIB = 00.00 UTC)
function hoursUntilGeminiReset(): number {
  const wibHour = getWIBHour()
  const hoursLeft = 7 - wibHour
  return hoursLeft <= 0 ? hoursLeft + 24 : hoursLeft
}

export async function POST(req: NextRequest) {
  try {
    const { pertanyaan, userId } = await req.json()

    if (!pertanyaan?.trim()) {
      return NextResponse.json({ error: 'Pertanyaan tidak boleh kosong' }, { status: 400 })
    }

    const supabase = await createClient()
    const normalized = normalize(pertanyaan)
    const today = getWIBDate()

    // ── CEK JATAH USER ────────────────────────────────────────────────────────
    let userLimit = LIMITS.guest
    let currentUsage = 0

    if (userId) {
      const { data: profile } = await supabase
        .from('profiles').select('username').eq('id', userId).single()

      const isAdmin = profile?.username?.toLowerCase().includes('admin')
      userLimit = isAdmin ? LIMITS.admin : LIMITS.user

      if (!isAdmin) {
        const { data: usage } = await supabase
          .from('ai_chat_usage').select('count')
          .eq('user_id', userId).eq('date', today).single()

        currentUsage = usage?.count || 0

        if (currentUsage >= userLimit) {
          return NextResponse.json({
            error: 'LIMIT_REACHED',
            message: `Jatah chat harianmu sudah habis (${userLimit} chat/hari). Kembali lagi besok pukul 00.00 WIB! 🌙`,
            limit: userLimit,
            used: currentUsage,
          }, { status: 429 })
        }
      }
    }

    // ── CEK KNOWLEDGE BASE ────────────────────────────────────────────────────

    // Lapisan 1: Exact match
    const { data: exactMatch } = await supabase
      .from('ai_knowledge_base').select('*')
      .eq('pertanyaan_normalized', normalized).single()

    if (exactMatch) {
      await supabase.from('ai_knowledge_base')
        .update({ hit_count: exactMatch.hit_count + 1 }).eq('id', exactMatch.id)
      if (userId) {
        await supabase.from('ai_chat_history').insert({
          user_id: userId, pertanyaan, jawaban: exactMatch.jawaban, from_cache: true,
        })
      }
      return NextResponse.json({ jawaban: exactMatch.jawaban, from_cache: true, jatah_digunakan: false })
    }

    // Lapisan 2: Similarity
    const { data: allKb } = await supabase.from('ai_knowledge_base').select('*').limit(50)
    if (allKb) {
      const similarItem = allKb.find(item => similarityScore(normalized, item.pertanyaan_normalized) >= 0.6)
      if (similarItem) {
        await supabase.from('ai_knowledge_base')
          .update({ hit_count: similarItem.hit_count + 1 }).eq('id', similarItem.id)
        if (userId) {
          await supabase.from('ai_chat_history').insert({
            user_id: userId, pertanyaan, jawaban: similarItem.jawaban, from_cache: true,
          })
        }
        return NextResponse.json({ jawaban: similarItem.jawaban, from_cache: true, jatah_digunakan: false })
      }
    }

    // Lapisan 3: Full text search
    const { data: ftsResult } = await supabase
      .from('ai_knowledge_base').select('*')
      .textSearch('pertanyaan', normalized.split(' ').filter(w => w.length > 3).join(' | '))
      .limit(1)

    if (ftsResult && ftsResult.length > 0) {
      const item = ftsResult[0]
      await supabase.from('ai_knowledge_base')
        .update({ hit_count: item.hit_count + 1 }).eq('id', item.id)
      if (userId) {
        await supabase.from('ai_chat_history').insert({
          user_id: userId, pertanyaan, jawaban: item.jawaban, from_cache: true,
        })
      }
      return NextResponse.json({ jawaban: item.jawaban, from_cache: true, jatah_digunakan: false })
    }

    // ── PANGGIL GEMINI ────────────────────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        error: 'CONFIG_ERROR',
        message: '🔧 Fitur AI belum dikonfigurasi. Hubungi admin MaduLingo.',
      }, { status: 500 })
    }

    const systemPrompt = `Kamu adalah Kiai Madura, seorang tetua bijak dari Pulau Madura yang sangat menguasai bahasa, budaya, sejarah, tradisi, kuliner, dan kehidupan masyarakat Madura. Kamu berbicara dengan hangat, bijak, dan penuh kasih sayang.

Aturan:
1. Jawab HANYA tentang Madura (bahasa, budaya, sejarah, tradisi, kuliner, wisata, tokoh)
2. Tolak pertanyaan di luar Madura dengan sopan
3. Sesekali sisipkan kata bahasa Madura dengan terjemahannya
4. Jawaban informatif, akurat, 3-4 paragraf
5. Mulai dengan "Anakku," atau "Cucuku,"`

    let geminiResponse: Response
    try {
      geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }, { text: `\nPertanyaan: ${pertanyaan}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      })
    } catch {
      return NextResponse.json({
        error: 'NETWORK_ERROR',
        message: '🌐 Gagal terhubung ke server AI. Periksa koneksi dan coba lagi.',
      }, { status: 503 })
    }

    // ── HANDLE ERROR GEMINI ───────────────────────────────────────────────────
    if (!geminiResponse.ok) {
      const errData = await geminiResponse.json().catch(() => ({}))
      const errStatus = errData?.error?.status || ''

      // Kuota harian habis
      if (geminiResponse.status === 429 || errStatus === 'RESOURCE_EXHAUSTED') {
        const jamLeft = hoursUntilGeminiReset()
        const menit = Math.round((jamLeft % 1) * 60)
        const jam = Math.floor(jamLeft)

        const waktuInfo = jam > 0
          ? `±${jam} jam ${menit > 0 ? `${menit} menit` : ''}`
          : `±${menit} menit`

        return NextResponse.json({
          error: 'GEMINI_QUOTA',
          message: `🌙 Kiai Madura sedang beristirahat...\n\nBeliau telah menjawab terlalu banyak pertanyaan hari ini (batas 1.500/hari dari Google).\n\nKiai Madura akan kembali dalam ${waktuInfo} lagi (sekitar pukul 07.00 WIB).\n\n📚 Sementara itu, jelajahi MaduWiki atau Kosakata Madura ya, anakku!`,
          retry_at: '07:00 WIB',
          hours_remaining: jam,
        }, { status: 429 })
      }

      // API key tidak valid
      if (geminiResponse.status === 400 || geminiResponse.status === 403) {
        return NextResponse.json({
          error: 'API_KEY_INVALID',
          message: '🔑 Kunci API tidak valid. Hubungi admin MaduLingo.',
        }, { status: 500 })
      }

      // Rate limit per menit (bukan per hari)
      if (geminiResponse.status === 429) {
        return NextResponse.json({
          error: 'RATE_LIMIT',
          message: '⏳ Terlalu banyak pertanyaan dalam waktu singkat. Tunggu sebentar dan coba lagi!',
        }, { status: 429 })
      }

      // Error lain
      return NextResponse.json({
        error: 'GEMINI_ERROR',
        message: `⚠️ Terjadi gangguan pada AI (${geminiResponse.status}). Coba lagi dalam beberapa saat.`,
      }, { status: 500 })
    }

    // ── PROSES JAWABAN ────────────────────────────────────────────────────────
    const geminiData = await geminiResponse.json()
    const jawaban = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!jawaban) {
      return NextResponse.json({
        error: 'EMPTY_RESPONSE',
        message: '🤔 Kiai Madura tidak memberikan jawaban. Coba tanyakan dengan kata yang berbeda.',
      }, { status: 500 })
    }

    // Simpan ke knowledge base
    const keywords = normalized.split(' ').filter(w => w.length > 3)
    await supabase.from('ai_knowledge_base').insert({
      pertanyaan, pertanyaan_normalized: normalized,
      jawaban, kategori: 'ai-generated', keywords, hit_count: 1,
    })

    // Update jatah user
    if (userId && userLimit !== Infinity) {
      await supabase.from('ai_chat_usage').upsert({
        user_id: userId, date: today, count: currentUsage + 1,
      }, { onConflict: 'user_id,date' })
    }

    // Simpan ke history
    if (userId) {
      await supabase.from('ai_chat_history').insert({
        user_id: userId, pertanyaan, jawaban, from_cache: false,
      })
    }

    return NextResponse.json({
      jawaban,
      from_cache: false,
      jatah_digunakan: true,
      sisa_jatah: userLimit === Infinity ? null : userLimit - currentUsage - 1,
    })

  } catch (err) {
    console.error('Tanya Tetua error:', err)
    return NextResponse.json({
      error: 'SERVER_ERROR',
      message: '⚠️ Terjadi kesalahan pada server. Coba lagi dalam beberapa saat.',
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const userId = searchParams.get('userId')

  if (type === 'popular') {
    const { data } = await supabase
      .from('ai_knowledge_base').select('pertanyaan, hit_count, kategori')
      .order('hit_count', { ascending: false }).limit(6)
    return NextResponse.json({ data })
  }

  if (type === 'history' && userId) {
    const { data } = await supabase
      .from('ai_chat_history').select('*')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
    return NextResponse.json({ data })
  }

  if (type === 'usage' && userId) {
    const today = getWIBDate()
    const { data } = await supabase
      .from('ai_chat_usage').select('count')
      .eq('user_id', userId).eq('date', today).single()
    return NextResponse.json({ count: data?.count || 0 })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
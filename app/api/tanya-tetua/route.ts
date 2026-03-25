import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const LIMITS = { guest: 3, user: 20, admin: Infinity }

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

function hoursUntilGeminiReset(): number {
  const wibHour = getWIBHour()
  const hoursLeft = 7 - wibHour
  return hoursLeft <= 0 ? hoursLeft + 24 : hoursLeft
}

export async function POST(req: NextRequest) {
  console.log('=== TANYA TETUA API CALLED ===')

  try {
    const body = await req.json()
    const { pertanyaan, userId } = body
    console.log('Pertanyaan:', pertanyaan)
    console.log('UserId:', userId)

    if (!pertanyaan?.trim()) {
      return NextResponse.json({ error: 'Pertanyaan tidak boleh kosong' }, { status: 400 })
    }

    // Cek API key dulu sebelum apapun
    const apiKey = process.env.GEMINI_API_KEY
    console.log('API Key exists:', !!apiKey)
    console.log('API Key length:', apiKey?.length || 0)
    console.log('API Key prefix:', apiKey?.substring(0, 8) || 'EMPTY')

    if (!apiKey) {
      console.error('GEMINI_API_KEY tidak ditemukan di environment!')
      return NextResponse.json({
        error: 'CONFIG_ERROR',
        message: '🔧 Fitur AI belum dikonfigurasi. Hubungi admin MaduLingo.',
      }, { status: 500 })
    }

    let supabase: any
    try {
      supabase = await createClient()
      console.log('Supabase client created')
    } catch (e) {
      console.error('Supabase client error:', e)
      return NextResponse.json({
        error: 'DB_ERROR',
        message: '⚠️ Gagal terhubung ke database.',
      }, { status: 500 })
    }

    const normalized = normalize(pertanyaan)
    const today = getWIBDate()

    // ── CEK JATAH ────────────────────────────────────────────────────────────
    let userLimit = LIMITS.guest
    let currentUsage = 0

    if (userId) {
      try {
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
            }, { status: 429 })
          }
        }
      } catch (e) {
        console.error('Usage check error:', e)
      }
    }

    // ── CEK KNOWLEDGE BASE ────────────────────────────────────────────────────
    console.log('Checking knowledge base...')

    try {
      const { data: exactMatch } = await supabase
        .from('ai_knowledge_base').select('*')
        .eq('pertanyaan_normalized', normalized).single()

      if (exactMatch) {
        console.log('Exact match found in KB')
        await supabase.from('ai_knowledge_base')
          .update({ hit_count: exactMatch.hit_count + 1 }).eq('id', exactMatch.id)
        if (userId) {
          await supabase.from('ai_chat_history').insert({
            user_id: userId, pertanyaan, jawaban: exactMatch.jawaban, from_cache: true,
          })
        }
        return NextResponse.json({ jawaban: exactMatch.jawaban, from_cache: true, jatah_digunakan: false })
      }

      const { data: allKb } = await supabase.from('ai_knowledge_base').select('*').limit(50)
      if (allKb) {
        const similarItem = allKb.find((item: any) =>
          similarityScore(normalized, item.pertanyaan_normalized) >= 0.6
        )
        if (similarItem) {
          console.log('Similar match found in KB')
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
    } catch (e) {
      console.error('Knowledge base error:', e)
      // Lanjut ke Gemini meski KB error
    }

    // ── PANGGIL GEMINI ────────────────────────────────────────────────────────
    console.log('Calling Gemini API...')
    console.log('URL:', GEMINI_API_URL)

    const systemPrompt = `Kamu adalah Kiai Madura, seorang tetua bijak dari Pulau Madura yang sangat menguasai bahasa, budaya, sejarah, tradisi, kuliner, dan kehidupan masyarakat Madura.

Aturan:
1. Jawab HANYA tentang Madura (bahasa, budaya, sejarah, tradisi, kuliner, wisata, tokoh, adat istiadat)
2. Berikan jawaban yang LENGKAP, MENDALAM, dan INFORMATIF — jangan setengah-setengah
3. Sertakan fakta sejarah, nama tokoh, tahun kejadian, dan detail penting lainnya
4. Sesekali sisipkan kata bahasa Madura beserta terjemahannya
5. Gunakan bahasa Indonesia yang hangat, mengalir, dan mudah dipahami
6. Jawaban minimal 4-6 paragraf yang padat dan berisi
7. Mulai dengan sapaan "Anakku," atau "Cucuku,"
8. Tutup dengan pesan bijak atau motivasi untuk terus belajar budaya Madura
9. Tolak pertanyaan di luar topik Madura dengan sopan`

    let geminiResponse: Response
    try {
      geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt },
              { text: `\nPertanyaan: ${pertanyaan}` }
            ]
          }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
        })
      })
      console.log('Gemini response status:', geminiResponse.status)
    } catch (e) {
      console.error('Gemini fetch error:', e)
      return NextResponse.json({
        error: 'NETWORK_ERROR',
        message: '🌐 Gagal terhubung ke server AI. Coba lagi!',
      }, { status: 503 })
    }

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text()
      console.error('Gemini error response:', errText)

      const errData = JSON.parse(errText || '{}')
      const errStatus = errData?.error?.status || ''

      if (geminiResponse.status === 429 || errStatus === 'RESOURCE_EXHAUSTED') {
        const jamLeft = hoursUntilGeminiReset()
        return NextResponse.json({
          error: 'GEMINI_QUOTA',
          message: `🌙 Kiai Madura sedang beristirahat...\n\nBeliau akan kembali dalam ±${Math.floor(jamLeft)} jam lagi (sekitar pukul 07.00 WIB).\n\n📚 Sementara itu, jelajahi MaduWiki atau Kosakata Madura ya!`,
        }, { status: 429 })
      }

      if (geminiResponse.status === 400 || geminiResponse.status === 403) {
        return NextResponse.json({
          error: 'API_KEY_INVALID',
          message: `🔑 API Key tidak valid (status: ${geminiResponse.status}). Hubungi admin.`,
        }, { status: 500 })
      }

      return NextResponse.json({
        error: 'GEMINI_ERROR',
        message: `⚠️ Gangguan AI (${geminiResponse.status}): ${errData?.error?.message || 'Unknown error'}`,
      }, { status: 500 })
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response OK')

    const jawaban = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    if (!jawaban) {
      console.error('Empty jawaban from Gemini:', JSON.stringify(geminiData))
      return NextResponse.json({
        error: 'EMPTY_RESPONSE',
        message: '🤔 Kiai Madura tidak memberikan jawaban. Coba tanyakan dengan kata berbeda.',
      }, { status: 500 })
    }

    console.log('Jawaban received, length:', jawaban.length)

    // Simpan ke KB
    try {
      const keywords = normalized.split(' ').filter((w: string) => w.length > 3)
      await supabase.from('ai_knowledge_base').insert({
        pertanyaan, pertanyaan_normalized: normalized,
        jawaban, kategori: 'ai-generated', keywords, hit_count: 1,
      })
    } catch (e) {
      console.error('KB insert error (non-fatal):', e)
    }

    // Update jatah
    if (userId && userLimit !== Infinity) {
      try {
        await supabase.from('ai_chat_usage').upsert({
          user_id: userId, date: today, count: currentUsage + 1,
        }, { onConflict: 'user_id,date' })
      } catch (e) {
        console.error('Usage update error (non-fatal):', e)
      }
    }

    // Simpan history
    if (userId) {
      try {
        await supabase.from('ai_chat_history').insert({
          user_id: userId, pertanyaan, jawaban, from_cache: false,
        })
      } catch (e) {
        console.error('History insert error (non-fatal):', e)
      }
    }

    return NextResponse.json({
      jawaban,
      from_cache: false,
      jatah_digunakan: true,
      sisa_jatah: userLimit === Infinity ? null : userLimit - currentUsage - 1,
    })

  } catch (err) {
    console.error('=== FATAL ERROR ===', err)
    return NextResponse.json({
      error: 'SERVER_ERROR',
      message: `⚠️ Kesalahan server: ${err instanceof Error ? err.message : 'Unknown'}`,
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
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
  } catch (err) {
    console.error('GET error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
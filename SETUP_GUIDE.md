# 🏝️ PANDUAN SETUP MADULINGO — LANGKAH DEMI LANGKAH

---

## PRASYARAT
Pastikan sudah terinstall:
- Node.js v18+ → https://nodejs.org
- Git → https://git-scm.com
- VSCode → https://code.visualstudio.com
- GitHub CLI (opsional) → https://cli.github.com

---

## LANGKAH 1 — BUAT PROJECT NEXT.JS

Buka terminal, lalu jalankan:

```bash
npx create-next-app@latest madulingo \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd madulingo
```

---

## LANGKAH 2 — INSTALL DEPENDENCIES

```bash
npm install @supabase/supabase-js @supabase/ssr zustand framer-motion lucide-react
```

---

## LANGKAH 3 — SALIN SEMUA FILE KODE

Salin semua file dari panduan ini ke dalam folder project:

### Struktur yang harus dibuat:
```
madulingo/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── learn/page.tsx
│   │   ├── learn/[lessonId]/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   └── collectibles/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── stores/
│   │   └── userStore.ts
│   └── utils/
│       └── xp.ts
├── public/
│   └── manifest.json
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
└── .env.local
```

---

## LANGKAH 4 — SETUP SUPABASE

### 4a. Buat project Supabase
1. Buka https://supabase.com → Login
2. Klik "New Project"
3. Isi: Name = `madulingo`, Password yang kuat, Region = Singapore
4. Tunggu hingga project siap (~1 menit)

### 4b. Jalankan SQL Schema
1. Di dashboard Supabase, klik **SQL Editor**
2. Klik **New Query**
3. Copy-paste isi file `supabase-schema.sql`
4. Klik **Run** (atau tekan Ctrl+Enter)

### 4c. Aktifkan Google Auth (opsional)
1. Supabase → Authentication → Providers → Google
2. Toggle ON, isi Client ID & Secret dari Google Cloud Console
3. Redirect URL: `https://[project-ref].supabase.co/auth/v1/callback`

### 4d. Ambil API Keys
1. Supabase → Project Settings → API
2. Copy **Project URL** dan **anon public key**

---

## LANGKAH 5 — BUAT FILE .env.local

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...
```

⚠️ JANGAN commit file ini ke Git! Sudah ada di .gitignore.

---

## LANGKAH 6 — JALANKAN DI LOCAL

```bash
npm run dev
```

Buka browser: http://localhost:3000

---

## LANGKAH 7 — SETUP GIT & GITHUB

```bash
# Inisialisasi git
git init

# Tambahkan semua file
git add .

# Commit pertama
git commit -m "feat: initial MaduLingo project setup"

# Buat repo di GitHub (login dulu jika perlu)
# Opsi A: Pakai GitHub CLI
gh repo create madulingo --public --push --source=.

# Opsi B: Manual
# 1. Buka github.com → New Repository → nama: madulingo
# 2. Jalankan perintah ini:
git remote add origin https://github.com/USERNAME/madulingo.git
git branch -M main
git push -u origin main
```

---

## LANGKAH 8 — DEPLOY KE VERCEL

### Opsi A: Via Vercel CLI
```bash
npm i -g vercel
vercel

# Ikuti petunjuk:
# - Set up and deploy? Y
# - Which scope? (pilih akun kamu)
# - Link to existing project? N
# - Project name: madulingo
# - Directory: ./
# - Override settings? N
```

### Opsi B: Via Vercel Dashboard (lebih mudah)
1. Buka https://vercel.com → New Project
2. Import dari GitHub → pilih repo `madulingo`
3. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL` = (paste URL Supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (paste anon key)
4. Klik **Deploy**

### Setelah deploy:
- Update Supabase Auth → Redirect URLs → tambahkan domain Vercel kamu
  Contoh: `https://madulingo.vercel.app/**`

---

## LANGKAH 9 — WORKFLOW DEVELOPMENT

Setelah setup awal, workflow harian kamu:

```bash
# 1. Buat fitur baru
git checkout -b feat/nama-fitur

# 2. Koding...

# 3. Commit perubahan
git add .
git commit -m "feat: deskripsi fitur"

# 4. Push ke GitHub
git push origin feat/nama-fitur

# 5. Buat Pull Request di GitHub
# 6. Merge ke main
# 7. Vercel otomatis deploy!
```

---

## TIPS PENGEMBANGAN LANJUTAN

### Menambah Pelajaran Baru
Di Supabase → Table Editor → `lessons` → Insert row
Format `content_json`:
```json
{
  "description": "Deskripsi pelajaran",
  "quizzes": [
    {
      "type": "multiple_choice",
      "question": "Pertanyaan?",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "audio": null
    }
  ]
}
```

### Menambah Audio Pronunciation
1. Upload file .mp3 ke Supabase → Storage → Buat bucket `audio`
2. Set bucket sebagai Public
3. Isi field `audio` di quiz dengan URL file

### Mengaktifkan Speech-to-Text
Web Speech API sudah disiapkan di quiz engine.
Tambahkan quiz type `speech` dengan field `expected_text`.

### Menambah Gambar ke Collectibles
1. Upload gambar ke Supabase Storage → bucket `collectibles`
2. Update field `image_url` di tabel `collectibles`

---

## STRUKTUR DATABASE RINGKAS

| Tabel | Deskripsi |
|-------|-----------|
| `profiles` | Data user (XP, koin, level, streak) |
| `lessons` | Data pelajaran & kuis |
| `user_progress` | Progress belajar per user |
| `collectibles` | Kartu pusaka yang bisa dikumpulkan |
| `user_inventory` | Koleksi pusaka milik user |

---

## TROUBLESHOOTING

**Error: Cannot find module '@supabase/ssr'**
```bash
npm install @supabase/ssr
```

**Error: Hydration mismatch**
Pastikan semua komponen interaktif menggunakan `'use client'`

**Supabase auth tidak bekerja**
- Cek `.env.local` sudah diisi dengan benar
- Restart dev server setelah mengubah .env.local

**Build error di Vercel**
- Pastikan semua ENV variables sudah diset di Vercel dashboard
- Cek log build di Vercel untuk detail error

---

🎉 Selamat! MaduLingo siap untuk dikembangkan!

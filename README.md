# 🏝️ MaduLingo - Panduan Setup Lengkap

Platform belajar bahasa & budaya Madura yang gamified.

---

## 📁 Struktur Proyek

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
├── components/
│   ├── ui/
│   │   ├── BentoCard.tsx
│   │   ├── GlassCard.tsx
│   │   ├── XPBar.tsx
│   │   ├── HeartBar.tsx
│   │   └── BatikOverlay.tsx
│   ├── auth/
│   │   └── AuthForm.tsx
│   ├── dashboard/
│   │   ├── StatsGrid.tsx
│   │   ├── MaduraPath.tsx
│   │   └── StreakCard.tsx
│   ├── lesson/
│   │   ├── QuizEngine.tsx
│   │   ├── MultipleChoice.tsx
│   │   ├── WordSort.tsx
│   │   ├── MatchImage.tsx
│   │   └── SpeechChecker.tsx
│   └── collectibles/
│       └── PusakaCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── stores/
│   │   └── userStore.ts
│   └── utils/
│       ├── xp.ts
│       └── gamification.ts
├── public/
│   ├── manifest.json
│   └── icons/
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
└── .env.local
```

---

## 🚀 Langkah Setup

### 1. Buat Project Next.js

```bash
npx create-next-app@latest madulingo --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd madulingo
```

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr zustand framer-motion lucide-react
npm install -D @types/node
```

### 3. Setup Supabase

1. Buka [supabase.com](https://supabase.com) → New Project
2. Nama project: `madulingo`
3. Copy `Project URL` dan `anon key`
4. Buat file `.env.local` (lihat bagian ENV)

### 4. Jalankan SQL Schema di Supabase

Buka **SQL Editor** di Supabase dashboard, lalu jalankan `supabase-schema.sql`

### 5. Setup Git & GitHub

```bash
git init
git add .
git commit -m "feat: initial MaduLingo setup"
gh repo create madulingo --public
git push -u origin main
```

### 6. Deploy ke Vercel

```bash
npm i -g vercel
vercel
# Masukkan env variables saat diminta
```

---

## ⚙️ Environment Variables (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

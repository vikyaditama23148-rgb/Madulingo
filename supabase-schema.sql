-- ============================================
-- MADULINGO - SUPABASE DATABASE SCHEMA
-- Jalankan ini di SQL Editor Supabase
-- ============================================

-- 1. PROFILES TABLE
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 100,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_activity DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LESSONS TABLE
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  district TEXT NOT NULL CHECK (district IN ('Bangkalan', 'Sampang', 'Pamekasan', 'Sumenep')),
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  content_json JSONB NOT NULL,
  xp_reward INTEGER DEFAULT 20,
  coin_reward INTEGER DEFAULT 10,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER PROGRESS TABLE
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

-- 4. COLLECTIBLES TABLE
CREATE TABLE collectibles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  unlock_condition TEXT
);

-- 5. USER INVENTORY TABLE
CREATE TABLE user_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  collectible_id UUID REFERENCES collectibles(id) ON DELETE CASCADE,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, collectible_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE collectibles ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Lessons: All authenticated users can read
CREATE POLICY "Authenticated users can read lessons" ON lessons FOR SELECT USING (auth.role() = 'authenticated');

-- User Progress: Users manage own progress
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Collectibles: All authenticated can read
CREATE POLICY "Authenticated users can read collectibles" ON collectibles FOR SELECT USING (auth.role() = 'authenticated');

-- User Inventory: Users manage own inventory
CREATE POLICY "Users can view own inventory" ON user_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inventory" ON user_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- AUTO LEVEL-UP FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_level(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  RETURN FLOOR(SQRT(xp_amount::FLOAT / 100)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update level when XP changes
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level = public.calculate_level(NEW.xp);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_level_up
  BEFORE UPDATE OF xp ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_user_level();

-- ============================================
-- LEADERBOARD VIEW
-- ============================================

CREATE VIEW leaderboard AS
SELECT
  id,
  username,
  avatar_url,
  xp,
  level,
  streak,
  RANK() OVER (ORDER BY xp DESC) as rank
FROM profiles
ORDER BY xp DESC
LIMIT 10;

-- ============================================
-- SEED DATA - LESSONS
-- ============================================

INSERT INTO lessons (title, district, difficulty, order_index, xp_reward, coin_reward, content_json) VALUES
(
  'Salam & Sapaan',
  'Bangkalan',
  1,
  1,
  20,
  10,
  '{
    "description": "Belajar salam dan sapaan dalam bahasa Madura",
    "quizzes": [
      {
        "type": "multiple_choice",
        "question": "Apa artinya ''Salam'' dalam bahasa Madura?",
        "options": ["Selamat", "Halo", "Apa kabar", "Terima kasih"],
        "answer": "Halo",
        "audio": null
      },
      {
        "type": "multiple_choice",
        "question": "Bagaimana cara menyapa pagi hari dalam bahasa Madura?",
        "options": ["Salamat essubbu", "Salamat songay", "Salamat dhari", "Bi asalamah"],
        "answer": "Salamat essubbu",
        "audio": null
      },
      {
        "type": "word_sort",
        "question": "Susun kata untuk ''Selamat pagi''",
        "words": ["essubbu", "Salamat", "kabbhi"],
        "answer": ["Salamat", "essubbu"],
        "audio": null
      }
    ]
  }'
),
(
  'Angka 1-10',
  'Bangkalan',
  1,
  2,
  25,
  12,
  '{
    "description": "Belajar angka 1 sampai 10 dalam bahasa Madura",
    "quizzes": [
      {
        "type": "multiple_choice",
        "question": "Berapa ''tello'' dalam bahasa Indonesia?",
        "options": ["1", "2", "3", "4"],
        "answer": "3",
        "audio": null
      },
      {
        "type": "multiple_choice",
        "question": "Bagaimana angka 7 dalam bahasa Madura?",
        "options": ["Ennem", "Petto", "Ballu", "Sembi"],
        "answer": "Petto",
        "audio": null
      }
    ]
  }'
),
(
  'Makanan Tradisional',
  'Sampang',
  2,
  3,
  30,
  15,
  '{
    "description": "Mengenal nama makanan tradisional Madura",
    "quizzes": [
      {
        "type": "multiple_choice",
        "question": "Sate khas Madura yang terkenal disebut?",
        "options": ["Sate Padang", "Sate Madura", "Sate Lilit", "Sate Maranggi"],
        "answer": "Sate Madura",
        "audio": null
      }
    ]
  }'
),
(
  'Budaya & Tradisi',
  'Pamekasan',
  3,
  4,
  40,
  20,
  '{
    "description": "Mempelajari budaya dan tradisi khas Madura",
    "quizzes": [
      {
        "type": "multiple_choice",
        "question": "Perlombaan kuda khas Madura disebut?",
        "options": ["Karapan Sapi", "Pacuan Kuda", "Balapan Onta", "Carok"],
        "answer": "Karapan Sapi",
        "audio": null
      }
    ]
  }'
),
(
  'Batik Sumenep',
  'Sumenep',
  4,
  5,
  50,
  25,
  '{
    "description": "Mengenal motif Batik Sumenep yang khas",
    "quizzes": [
      {
        "type": "multiple_choice",
        "question": "Motif batik Madura yang paling terkenal adalah?",
        "options": ["Parang", "Gentongan", "Kawung", "Mega Mendung"],
        "answer": "Gentongan",
        "audio": null
      }
    ]
  }'
);

-- SEED DATA - COLLECTIBLES
INSERT INTO collectibles (name, description, rarity, unlock_condition) VALUES
('Celurit Emas', 'Senjata tradisional Madura yang ikonik, versi emas', 'legendary', 'Selesaikan semua pelajaran Bangkalan'),
('Batik Gentongan', 'Motif batik khas Madura yang memiliki makna mendalam', 'epic', 'Selesaikan 10 pelajaran'),
('Karapan Sapi', 'Tradisi balap sapi yang menjadi kebanggaan Madura', 'rare', 'Raih 500 XP'),
('Topeng Madura', 'Topeng khas pertunjukan seni tradisional Madura', 'common', 'Selesaikan pelajaran pertama'),
('Songket Sumenep', 'Kain tenun tradisional dari Sumenep yang mewah', 'epic', 'Capai Level 5');

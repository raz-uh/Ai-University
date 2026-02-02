-- AI Adaptive 3D University Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  wallet_address TEXT,
  preferred_language TEXT DEFAULT 'English',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  style_preference TEXT CHECK (style_preference IN ('Video', 'PDF', 'Flashcards')),
  jsonb_content JSONB NOT NULL,
  skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Results Table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard Materialized View (Top 5 by XP)
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard AS
SELECT 
  p.id,
  p.email,
  p.wallet_address,
  p.xp,
  p.level,
  ROW_NUMBER() OVER (ORDER BY p.xp DESC) as rank
FROM profiles p
ORDER BY p.xp DESC
LIMIT 5;

-- Index for faster refresh
CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_id_idx ON leaderboard(id);

-- Function to refresh leaderboard
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  -- Perform a safe refresh
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback for first-time refresh or if no data
    REFRESH MATERIALIZED VIEW leaderboard;
  END;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-refresh leaderboard on profile updates
DROP TRIGGER IF EXISTS refresh_leaderboard_trigger ON profiles;
CREATE TRIGGER refresh_leaderboard_trigger
AFTER INSERT OR UPDATE ON profiles
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_leaderboard();

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Courses: Users can manage their own courses
DROP POLICY IF EXISTS "Users can view own courses" ON courses;
CREATE POLICY "Users can view own courses" 
  ON courses FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own courses" ON courses;
CREATE POLICY "Users can create own courses" 
  ON courses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Quiz Results: Users can view and insert their own results
DROP POLICY IF EXISTS "Users can view own quiz results" ON quiz_results;
CREATE POLICY "Users can view own quiz results" 
  ON quiz_results FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz results" ON quiz_results;
CREATE POLICY "Users can insert own quiz results" 
  ON quiz_results FOR INSERT 
  WITH CHECK (auth.uid() = user_id);


-- Function to handle new user signup (Auto-create Profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- We use COALESCE for email just in case, though Auth usually provides it
  -- We use ON CONFLICT to handle rare race conditions or dirty state
  INSERT INTO public.profiles (user_id, email, wallet_address)
  VALUES (
    new.id, 
    COALESCE(new.email, 'user_' || substr(new.id::text, 1, 8) || '@temp.com'), 
    ''
  )
  ON CONFLICT (user_id) DO UPDATE SET 
    email = EXCLUDED.email,
    updated_at = NOW();
    
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- CRITICAL: We return NEW so that the Auth signup succeeds 
  -- even if the profile creation fails for some reason.
  -- This prevents the "Database error saving new user" block.
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

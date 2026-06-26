-- Create Users table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  permissions JSONB DEFAULT '[]'::jsonb,
  total_generated INT DEFAULT 0,
  total_sent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
CREATE POLICY "Admins can update any profile." ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  raw_input TEXT,
  formatted_content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Notes Policies
DROP POLICY IF EXISTS "Users can view their own notes." ON public.notes;
CREATE POLICY "Users can view their own notes." ON public.notes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own notes." ON public.notes;
CREATE POLICY "Users can create their own notes." ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notes." ON public.notes;
CREATE POLICY "Users can update their own notes." ON public.notes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notes." ON public.notes;
CREATE POLICY "Users can delete their own notes." ON public.notes
  FOR DELETE USING (auth.uid() = user_id);

-- System Stats / Config (using a single record table or separate ones)
CREATE TABLE IF NOT EXISTS public.system_config (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial admin config if needed
INSERT INTO public.system_config (key, value)
VALUES ('config', '{"maintenanceMode": false, "registrationEnabled": true}')
ON CONFLICT (key) DO NOTHING;

-- System Config Policies
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System config viewable by everyone." ON public.system_config;
CREATE POLICY "System config viewable by everyone." ON public.system_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage system config." ON public.system_config;
CREATE POLICY "Only admins can manage system config." ON public.system_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  questions JSONB,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own quizzes." ON public.quizzes;
CREATE POLICY "Users can manage their own quizzes." ON public.quizzes
  FOR ALL USING (auth.uid() = user_id);

-- NEW: Poll Questions table for individual questions
DROP TABLE IF EXISTS public.poll_questions CASCADE;
CREATE TABLE public.poll_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_option_index INT,
  explanation TEXT,
  topic TEXT,
  status TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.poll_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own poll questions." ON public.poll_questions;
CREATE POLICY "Users can manage their own poll questions." ON public.poll_questions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Settings table
DROP TABLE IF EXISTS public.settings CASCADE;

CREATE TABLE public.settings (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  channels JSONB DEFAULT '[]'::jsonb,
  "activeChannelId" TEXT,
  "selectedChannelIds" JSONB DEFAULT '[]'::jsonb,
  "questionPrefix" TEXT,
  "explanationSuffix" TEXT,
  prefixes JSONB DEFAULT '[]'::jsonb,
  suffixes JSONB DEFAULT '[]'::jsonb,
  "activePrefixId" TEXT,
  "activeSuffixId" TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own settings." ON public.settings;
CREATE POLICY "Users can manage their own settings." ON public.settings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Drafts table
DROP TABLE IF EXISTS public.drafts CASCADE;
CREATE TABLE public.drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_option_index INT,
  explanation TEXT,
  topic TEXT,
  status TEXT DEFAULT 'draft',
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own drafts." ON public.drafts;
CREATE POLICY "Users can manage their own drafts." ON public.drafts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System stats table
CREATE TABLE IF NOT EXISTS public.system_stats (
  key TEXT PRIMARY KEY,
  user_count INT DEFAULT 0,
  total_polls_sent INT DEFAULT 0,
  total_polls_generated INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow reading system stats to everyone." ON public.system_stats;
CREATE POLICY "Allow reading system stats to everyone." ON public.system_stats
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow updating system stats to admins." ON public.system_stats;
CREATE POLICY "Allow updating system stats to admins." ON public.system_stats
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, photo_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN NEW.email IN ('alifweb@gmail.com', 'alifbrur16@gmail.com') THEN 'admin' 
      ELSE 'user' 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

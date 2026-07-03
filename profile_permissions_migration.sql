-- 1. Create the new profile_permissions table
CREATE TABLE public.profile_permissions (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  polls BOOLEAN NOT NULL DEFAULT FALSE,
  drafts BOOLEAN NOT NULL DEFAULT FALSE,
  formats BOOLEAN NOT NULL DEFAULT FALSE,
  csv_modifier BOOLEAN NOT NULL DEFAULT FALSE,
  ocr BOOLEAN NOT NULL DEFAULT FALSE,
  photocard BOOLEAN NOT NULL DEFAULT FALSE,
  exam_paper BOOLEAN NOT NULL DEFAULT FALSE,
  note BOOLEAN NOT NULL DEFAULT FALSE,
  suffix_edit BOOLEAN NOT NULL DEFAULT FALSE,
  qbs BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) on the new table
ALTER TABLE public.profile_permissions ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Users can read their own permissions
CREATE POLICY "Users can view their own permissions." 
  ON public.profile_permissions
  FOR SELECT 
  USING (auth.uid() = id);

-- Admins can manage all permissions
CREATE POLICY "Admins can manage all permissions." 
  ON public.profile_permissions
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Migrate data from profiles.permissions to profile_permissions
-- The COALESCE and '?' operator safely check if the string exists in the JSONB array
INSERT INTO public.profile_permissions (
  id, 
  polls, 
  drafts, 
  formats, 
  csv_modifier, 
  ocr, 
  photocard, 
  exam_paper, 
  note, 
  suffix_edit, 
  qbs
)
SELECT
  id,
  COALESCE(permissions ? 'polls', false),
  COALESCE(permissions ? 'drafts', false),
  COALESCE(permissions ? 'formats', false),
  COALESCE(permissions ? 'csv-modifier', false),
  COALESCE(permissions ? 'ocr', false),
  COALESCE(permissions ? 'photocard', false),
  COALESCE(permissions ? 'exam-paper', false),
  COALESCE(permissions ? 'note', false),
  COALESCE(permissions ? 'suffix-edit', false),
  COALESCE(permissions ? 'qbs', false)
FROM public.profiles;

-- 5. VERIFICATION STEP
-- Please verify that the data in public.profile_permissions looks correct before running the next step.
-- Example query: SELECT * FROM public.profile_permissions LIMIT 10;

-- 6. Safely remove the old permissions column (UNCOMMENT AFTER VERIFICATION)
-- ALTER TABLE public.profiles DROP COLUMN permissions;

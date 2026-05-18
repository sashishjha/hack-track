-- ─── HackTrack Competitions Table ───
-- Maps Competition TypeScript interface fields to PostgreSQL columns (camelCase → snake_case)

CREATE TABLE IF NOT EXISTS competitions (
  -- Primary identifiers
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,

  -- Core metadata
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  organizer TEXT,
  description TEXT,
  url TEXT NOT NULL,
  image_url TEXT,

  -- Status tracking
  status TEXT DEFAULT 'unknown',
  registration_status TEXT DEFAULT 'unknown',
  submission_deadline TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  -- Prize & participation
  prize_pool_usd INTEGER,
  prize_display TEXT NOT NULL DEFAULT '',
  participants_estimate TEXT,
  team_size_min INTEGER DEFAULT 1,
  team_size_max INTEGER,

  -- Categorization (arrays)
  skill_domains TEXT[] DEFAULT '{}',
  career_outcomes TEXT[] DEFAULT '{}',
  effort_level TEXT,
  difficulty TEXT,
  competition_density TEXT,
  recurrence_category TEXT,

  -- AI & Resources
  ai_policy TEXT,
  api_credits_included BOOLEAN DEFAULT false,
  gpu_credits_included BOOLEAN DEFAULT false,

  -- Access & Eligibility
  mode TEXT DEFAULT 'remote',
  country_restrictions TEXT[],
  student_only BOOLEAN DEFAULT false,
  team_type TEXT DEFAULT 'both',
  required_stack TEXT[],
  hardware_required BOOLEAN DEFAULT false,

  -- Intelligence scores
  rarity_score NUMERIC(3,1),
  trust_score NUMERIC(3,1),
  recruiter_visibility INTEGER,
  resume_value NUMERIC(3,1),
  beginner_friendly_score INTEGER,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  recurrence TEXT,
  validity TEXT DEFAULT 'active',
  platform_color TEXT,
  badge_variant TEXT,

  -- System metadata
  source TEXT DEFAULT 'seed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Backward-compatible type migration for existing tables ───
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'competitions'
      AND column_name = 'rarity_score'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE competitions
      ALTER COLUMN rarity_score TYPE NUMERIC(3,1)
      USING rarity_score::NUMERIC(3,1);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'competitions'
      AND column_name = 'trust_score'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE competitions
      ALTER COLUMN trust_score TYPE NUMERIC(3,1)
      USING trust_score::NUMERIC(3,1);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'competitions'
      AND column_name = 'resume_value'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE competitions
      ALTER COLUMN resume_value TYPE NUMERIC(3,1)
      USING resume_value::NUMERIC(3,1);
  END IF;
END $$;

-- ─── Indexes for common queries ───
CREATE INDEX IF NOT EXISTS idx_competitions_platform ON competitions(platform);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_slug ON competitions(slug);
CREATE INDEX IF NOT EXISTS idx_competitions_skill_domains ON competitions USING GIN(skill_domains);
CREATE INDEX IF NOT EXISTS idx_competitions_difficulty ON competitions(difficulty);
CREATE INDEX IF NOT EXISTS idx_competitions_recurrence_category ON competitions(recurrence_category);
CREATE INDEX IF NOT EXISTS idx_competitions_validity ON competitions(validity);

-- ─── Grants ───
GRANT SELECT ON TABLE competitions TO anon;
GRANT SELECT ON TABLE competitions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE competitions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE competitions TO service_role;
REVOKE INSERT, UPDATE, DELETE ON TABLE competitions FROM anon;

-- ─── Row Level Security (RLS) ───
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public READ access for anonymous users
DROP POLICY IF EXISTS "Enable read for anon users" ON competitions;
CREATE POLICY "Enable read for anon users"
  ON competitions
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Allow authenticated users to INSERT
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON competitions;
CREATE POLICY "Enable insert for authenticated users"
  ON competitions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to UPDATE
DROP POLICY IF EXISTS "Enable update for authenticated users" ON competitions;
CREATE POLICY "Enable update for authenticated users"
  ON competitions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to DELETE
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON competitions;
CREATE POLICY "Enable delete for authenticated users"
  ON competitions
  FOR DELETE
  TO authenticated
  USING (true);

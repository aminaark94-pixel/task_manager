export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- FAMILY TASK MANAGER - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- =========================================================================
-- Copy and paste this script into your Supabase Dashboard -> SQL Editor
-- This sets up the profiles, tasks, task_logs tables and Row Level Security.
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 2. CREATE 'profiles' TABLE (Linked to auth.users)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('parent', 'child', 'spouse')) DEFAULT 'child' NOT NULL,
  avatar_url TEXT,
  points INTEGER DEFAULT 0 NOT NULL,
  streak INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 3. CREATE 'tasks' TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('chores', 'homework', 'health', 'deen', 'reading', 'general')) DEFAULT 'general' NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium' NOT NULL,
  recurrence_type TEXT CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'custom')) DEFAULT 'daily' NOT NULL,
  recurrence_days INTEGER[] DEFAULT '{}', -- Array of days (0=Sun, 1=Mon, ..., 6=Sat)
  recurrence_interval INTEGER DEFAULT 1,  -- For custom duration (every N days)
  assigned_to TEXT NOT NULL,              -- Stores single user UUID or JSON array of UUIDs for multi-child assignment
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  points_reward INTEGER DEFAULT 10 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 4. CREATE 'task_logs' TABLE (Daily Check-in & Completion History)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE NOT NULL,
  status TEXT CHECK (status IN ('completed', 'skipped', 'approved')) DEFAULT 'completed' NOT NULL,
  notes TEXT,
  points_awarded INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(task_id, log_date, user_id)
);

-- -------------------------------------------------------------------------
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- -------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- 6. RLS POLICIES FOR 'profiles'
-- -------------------------------------------------------------------------
-- Anyone authenticated can view all family profiles
CREATE POLICY "Family members can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own basic profile info
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- -------------------------------------------------------------------------
-- 7. RLS POLICIES FOR 'tasks'
-- -------------------------------------------------------------------------
-- All authenticated family members can view tasks
CREATE POLICY "Family members can view tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (true);

-- Only Parents (Admins) can insert, update, or delete tasks
CREATE POLICY "Parents can create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'parent'
    )
  );

CREATE POLICY "Parents can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'parent'
    )
  );

CREATE POLICY "Parents can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'parent'
    )
  );

-- -------------------------------------------------------------------------
-- 8. RLS POLICIES FOR 'task_logs'
-- -------------------------------------------------------------------------
-- Family members can view task logs
CREATE POLICY "Family can view completion logs"
  ON public.task_logs FOR SELECT
  TO authenticated
  USING (true);

-- Assigned user or parent can record task completion
CREATE POLICY "Assigned user can log task completion"
  ON public.task_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'parent'
    )
  );

-- -------------------------------------------------------------------------
-- 9. AUTOMATIC TRIGGER FOR USER SIGNUP (Profiles sync)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'child')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------------------------
-- DONE! Your Supabase database is now ready for Family Task Manager.
-- =========================================================================
`;

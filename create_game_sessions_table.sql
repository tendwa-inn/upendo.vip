-- Upendo Store: Game Sessions
-- Run this in Supabase SQL Editor AFTER create_user_flares_table.sql

CREATE TABLE IF NOT EXISTS public.game_sessions (
  id BIGSERIAL PRIMARY KEY,
  player1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  match_id TEXT,
  game_type TEXT DEFAULT 'neon_ghost',
  rounds_total INT DEFAULT 3,
  rounds_completed INT DEFAULT 0,
  player1_score INT DEFAULT 0,
  player2_score INT DEFAULT 0,
  flares_awarded_p1 INT DEFAULT 0,
  flares_awarded_p2 INT DEFAULT 0,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Players can view their own game sessions
CREATE POLICY "Players can view own game sessions"
  ON public.game_sessions FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Players can create game sessions
CREATE POLICY "Players can create game sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (auth.uid() = player1_id);

-- Players can update their own game sessions
CREATE POLICY "Players can update own game sessions"
  ON public.game_sessions FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_game_sessions_player1 ON public.game_sessions(player1_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player2 ON public.game_sessions(player2_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_match ON public.game_sessions(match_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON public.game_sessions(status);

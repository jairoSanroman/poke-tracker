
-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initials TEXT NOT NULL CHECK (char_length(initials) BETWEEN 2 AND 3),
  color TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players are publicly accessible" ON public.players FOR SELECT USING (true);
CREATE POLICY "Players can be inserted" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Players can be updated" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Players can be deleted" ON public.players FOR DELETE USING (true);

-- Create runs table
CREATE TABLE public.runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  lives INTEGER NOT NULL DEFAULT 10,
  max_lives INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Runs are publicly accessible" ON public.runs FOR SELECT USING (true);
CREATE POLICY "Runs can be inserted" ON public.runs FOR INSERT WITH CHECK (true);
CREATE POLICY "Runs can be updated" ON public.runs FOR UPDATE USING (true);
CREATE POLICY "Runs can be deleted" ON public.runs FOR DELETE USING (true);

-- Create run_players junction table (many-to-many)
CREATE TABLE public.run_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  UNIQUE (run_id, player_id)
);

ALTER TABLE public.run_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Run players are publicly accessible" ON public.run_players FOR SELECT USING (true);
CREATE POLICY "Run players can be inserted" ON public.run_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Run players can be deleted" ON public.run_players FOR DELETE USING (true);

-- Create routes table
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'no-encounter')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Routes are publicly accessible" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Routes can be inserted" ON public.routes FOR INSERT WITH CHECK (true);
CREATE POLICY "Routes can be updated" ON public.routes FOR UPDATE USING (true);
CREATE POLICY "Routes can be deleted" ON public.routes FOR DELETE USING (true);

-- Create captures table
CREATE TABLE public.captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  species_id INTEGER,
  species TEXT NOT NULL,
  nickname TEXT,
  image_url TEXT,
  origin_type TEXT NOT NULL DEFAULT 'route' CHECK (origin_type IN ('route', 'gift', 'event')),
  origin_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'seen' CHECK (status IN ('seen', 'caught', 'failed', 'duplicate', 'dead', 'team')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.captures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Captures are publicly accessible" ON public.captures FOR SELECT USING (true);
CREATE POLICY "Captures can be inserted" ON public.captures FOR INSERT WITH CHECK (true);
CREATE POLICY "Captures can be updated" ON public.captures FOR UPDATE USING (true);
CREATE POLICY "Captures can be deleted" ON public.captures FOR DELETE USING (true);

-- Create indexes
CREATE INDEX idx_captures_run_id ON public.captures(run_id);
CREATE INDEX idx_captures_player_id ON public.captures(player_id);
CREATE INDEX idx_captures_route_id ON public.captures(route_id);
CREATE INDEX idx_captures_origin ON public.captures(origin_type, origin_id);
CREATE INDEX idx_routes_run_id ON public.routes(run_id);
CREATE INDEX idx_run_players_run_id ON public.run_players(run_id);
CREATE INDEX idx_run_players_player_id ON public.run_players(player_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_captures_updated_at
  BEFORE UPDATE ON public.captures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

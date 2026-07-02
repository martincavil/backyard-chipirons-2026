-- Create the races table
CREATE TABLE IF NOT EXISTS races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on updated_at for faster queries
CREATE INDEX IF NOT EXISTS races_updated_at_idx ON races(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE races ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (open access)
-- In production, you should restrict this based on authentication
CREATE POLICY "Allow all access for now" ON races
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function
CREATE TRIGGER update_races_updated_at
  BEFORE UPDATE ON races
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for this table (required for postgres_changes subscriptions)
ALTER PUBLICATION supabase_realtime ADD TABLE races;

-- Insert a default race if none exists
INSERT INTO races (state)
SELECT '{
  "raceStartTime": null,
  "raceStarted": false,
  "raceFinished": false,
  "runners": [],
  "lastElimination": null,
  "lastArrival": null
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM races LIMIT 1);

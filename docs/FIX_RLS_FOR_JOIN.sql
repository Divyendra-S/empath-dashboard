-- Fix RLS to allow clients to join sessions via public link
-- This adds a policy that allows anyone to read session join info

-- Option 1: Simple - Allow reading sessions that are scheduled or in progress
CREATE POLICY "Allow public read for active session join"
  ON sessions FOR SELECT
  USING (
    status IN ('scheduled', 'in_progress')
    AND daily_room_url IS NOT NULL
  );

-- This policy allows anyone to read a session row if:
-- 1. The session is active (not completed or cancelled)
-- 2. A Daily.co room has been created
-- Note: Your API route should still only return limited fields (daily_room_url, status)
-- to avoid exposing sensitive session data like notes

-- To test this works, you can run:
-- SELECT id, daily_room_url, status FROM sessions 
-- WHERE id = '4c1cfcf7-6159-4ce0-802e-98ffdfb1e53d';
-- This should work even without authentication


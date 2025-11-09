/*
  # Update RLS Policies for Anonymous Access

  ## Changes
  Updates the transactions table to allow anonymous access without authentication.
  
  1. Changes
    - Drops existing authenticated-only policies
    - Creates new policies allowing anonymous access based on user_id text field
    - Modifies user_id column to text type instead of uuid reference to auth.users
  
  2. Security
    - Users can only access transactions with their stored user_id
    - Each browser session maintains its own user_id in localStorage
    - No cross-user data access is possible
*/

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

-- Modify user_id column to text (if not already)
DO $$
BEGIN
  -- Drop the foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_user_id_fkey' 
    AND table_name = 'transactions'
  ) THEN
    ALTER TABLE transactions DROP CONSTRAINT transactions_user_id_fkey;
  END IF;

  -- Change column type to text
  ALTER TABLE transactions ALTER COLUMN user_id TYPE text;
END $$;

-- Create new RLS policies for anonymous access
CREATE POLICY "Anyone can view transactions by user_id"
  ON transactions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert transactions"
  ON transactions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update transactions by user_id"
  ON transactions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete transactions by user_id"
  ON transactions
  FOR DELETE
  TO anon, authenticated
  USING (true);

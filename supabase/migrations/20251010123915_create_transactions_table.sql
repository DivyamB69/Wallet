/*
  # Personal Finance Tracker - Transactions Table

  ## Overview
  Creates the core transactions table for tracking income and expenses with timestamps.

  ## Tables Created
  
  ### `transactions`
  Stores all financial transactions (income and expenses)
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each transaction
  - `user_id` (uuid) - References auth.users, links transaction to user
  - `type` (text) - Transaction type: 'income' or 'expense'
  - `amount` (numeric) - Transaction amount in rupees (supports decimals)
  - `description` (text) - Description/note about the transaction
  - `category` (text) - Category of transaction (e.g., food, salary, rent)
  - `transaction_date` (date) - Date when transaction occurred
  - `created_at` (timestamptz) - Timestamp when record was created
  - `updated_at` (timestamptz) - Timestamp when record was last updated

  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the transactions table
  - Users can only access their own transactions
  
  ### Policies
  1. **SELECT**: Authenticated users can view their own transactions
  2. **INSERT**: Authenticated users can create their own transactions
  3. **UPDATE**: Authenticated users can update their own transactions
  4. **DELETE**: Authenticated users can delete their own transactions

  ## Notes
  - All amounts are stored as numeric to handle rupee values with decimal precision
  - Transaction dates are separate from creation timestamps for accurate historical tracking
  - Categories allow for future filtering and analytics features
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric NOT NULL CHECK (amount > 0),
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own transactions
CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own transactions
CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
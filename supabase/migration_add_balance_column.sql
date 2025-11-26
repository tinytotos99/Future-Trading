-- Migration: Add balance column to existing trade_logs tables
-- Run this if you already have tables without the balance column

-- Add balance column to trade_logs_m2k
ALTER TABLE public.trade_logs_m2k 
ADD COLUMN IF NOT EXISTS balance NUMERIC;

-- Add balance column to trade_logs_mes
ALTER TABLE public.trade_logs_mes 
ADD COLUMN IF NOT EXISTS balance NUMERIC;

-- Add balance column to trade_logs_mnq
ALTER TABLE public.trade_logs_mnq 
ADD COLUMN IF NOT EXISTS balance NUMERIC;

-- Update existing records with calculated balance
-- Balance = 1000 + sum of all previous PNL values (ordered by trade_date)

-- For M2K: Calculate balance as 1000 + cumulative sum of previous PNLs
UPDATE public.trade_logs_m2k t1
SET balance = 1000 + COALESCE((
  SELECT SUM(t2.pnl)
  FROM public.trade_logs_m2k t2
  WHERE t2.trade_date < t1.trade_date
     OR (t2.trade_date = t1.trade_date AND t2.created_at < t1.created_at)
), 0);

-- For MES: Calculate balance as 1000 + cumulative sum of previous PNLs
UPDATE public.trade_logs_mes t1
SET balance = 1000 + COALESCE((
  SELECT SUM(t2.pnl)
  FROM public.trade_logs_mes t2
  WHERE t2.trade_date < t1.trade_date
     OR (t2.trade_date = t1.trade_date AND t2.created_at < t1.created_at)
), 0);

-- For MNQ: Calculate balance as 1000 + cumulative sum of previous PNLs
UPDATE public.trade_logs_mnq t1
SET balance = 1000 + COALESCE((
  SELECT SUM(t2.pnl)
  FROM public.trade_logs_mnq t2
  WHERE t2.trade_date < t1.trade_date
     OR (t2.trade_date = t1.trade_date AND t2.created_at < t1.created_at)
), 0);

-- Make balance NOT NULL after updating existing records
ALTER TABLE public.trade_logs_m2k ALTER COLUMN balance SET NOT NULL;
ALTER TABLE public.trade_logs_mes ALTER COLUMN balance SET NOT NULL;
ALTER TABLE public.trade_logs_mnq ALTER COLUMN balance SET NOT NULL;


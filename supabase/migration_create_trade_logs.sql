-- Create trade_logs_m2k table
CREATE TABLE IF NOT EXISTS public.trade_logs_m2k (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trade_date DATE NOT NULL,
    pnl NUMERIC NOT NULL,
    order_size NUMERIC NOT NULL,
    price NUMERIC NOT NULL,
    balance NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trade_logs_mes table
CREATE TABLE IF NOT EXISTS public.trade_logs_mes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trade_date DATE NOT NULL,
    pnl NUMERIC NOT NULL,
    order_size NUMERIC NOT NULL,
    price NUMERIC NOT NULL,
    balance NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trade_logs_mnq table
CREATE TABLE IF NOT EXISTS public.trade_logs_mnq (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trade_date DATE NOT NULL,
    pnl NUMERIC NOT NULL,
    order_size NUMERIC NOT NULL,
    price NUMERIC NOT NULL,
    balance NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better query performance - M2K
CREATE INDEX IF NOT EXISTS idx_trade_logs_m2k_trade_date ON public.trade_logs_m2k(trade_date);
CREATE INDEX IF NOT EXISTS idx_trade_logs_m2k_created_at ON public.trade_logs_m2k(created_at);

-- Add indexes for better query performance - MES
CREATE INDEX IF NOT EXISTS idx_trade_logs_mes_trade_date ON public.trade_logs_mes(trade_date);
CREATE INDEX IF NOT EXISTS idx_trade_logs_mes_created_at ON public.trade_logs_mes(created_at);

-- Add indexes for better query performance - MNQ
CREATE INDEX IF NOT EXISTS idx_trade_logs_mnq_trade_date ON public.trade_logs_mnq(trade_date);
CREATE INDEX IF NOT EXISTS idx_trade_logs_mnq_created_at ON public.trade_logs_mnq(created_at);

-- Enable Row Level Security - M2K
ALTER TABLE public.trade_logs_m2k ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on trade_logs_m2k" ON public.trade_logs_m2k
    FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON public.trade_logs_m2k TO authenticated;
GRANT ALL ON public.trade_logs_m2k TO anon;

-- Enable Row Level Security - MES
ALTER TABLE public.trade_logs_mes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on trade_logs_mes" ON public.trade_logs_mes
    FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON public.trade_logs_mes TO authenticated;
GRANT ALL ON public.trade_logs_mes TO anon;

-- Enable Row Level Security - MNQ
ALTER TABLE public.trade_logs_mnq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on trade_logs_mnq" ON public.trade_logs_mnq
    FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON public.trade_logs_mnq TO authenticated;
GRANT ALL ON public.trade_logs_mnq TO anon;


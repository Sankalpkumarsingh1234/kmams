-- ================================================================
-- GigShield Database Schema
-- Run this in your Supabase SQL Editor
-- ================================================================

-- 1. PROFILES TABLE (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('worker', 'insurer')),
  pin_code    TEXT,
  platform    TEXT,          -- e.g. 'Swiggy', 'Zomato', 'Ola'
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security: users can only see/edit their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Insurers can view all profiles
CREATE POLICY "Insurers can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'insurer'
    )
  );


-- 2. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  razorpay_order_id     TEXT NOT NULL UNIQUE,
  razorpay_payment_id   TEXT,
  razorpay_signature    TEXT,
  amount                NUMERIC(10, 2) NOT NULL,
  currency              TEXT DEFAULT 'INR',
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  policy_id             UUID,          -- link to policy table if exists
  tier_id               TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insurers can view all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'insurer'
    )
  );

-- Service role can insert/update (used by backend API routes)
CREATE POLICY "Service role can manage payments"
  ON public.payments FOR ALL
  USING (true)
  WITH CHECK (true);


-- 3. POLICIES TABLE (optional, for linking payments to policies)
CREATE TABLE IF NOT EXISTS public.policies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier          TEXT NOT NULL,         -- e.g. 'Basic', 'Standard', 'Premium'
  coverage      NUMERIC(10, 2),
  premium       NUMERIC(10, 2),
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  activated_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own policies"
  ON public.policies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insurers can view all policies"
  ON public.policies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'insurer'
    )
  );

CREATE POLICY "Service role can manage policies"
  ON public.policies FOR ALL
  USING (true)
  WITH CHECK (true);


-- ================================================================
-- Done! Set up your environment variables:
--   VITE_SUPABASE_URL
--   VITE_SUPABASE_ANON_KEY
--   SUPABASE_SERVICE_ROLE_KEY
--   RAZORPAY_KEY_ID
--   RAZORPAY_KEY_SECRET
-- ================================================================

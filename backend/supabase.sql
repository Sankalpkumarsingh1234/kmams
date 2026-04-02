-- GigShield Supabase Schema
-- Run these queries in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ═══════════════════════════════════════════════════════════════════════════
-- Table 1: Payouts
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE payouts (
  id BIGSERIAL PRIMARY KEY,
  payout_id VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'initiated',
  recipient_type VARCHAR(20),
  claim_id VARCHAR(50),
  user_phone VARCHAR(20),
  razorpay_contact_id VARCHAR(50),
  razorpay_fund_account_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  failed_reason TEXT
);

-- Index for faster lookups
CREATE INDEX idx_payouts_payout_id ON payouts(payout_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_created_at ON payouts(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- Table 2: Notifications
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  twilio_sid VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP
);

-- Index for lookups
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_phone ON notifications(phone);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- Table 3: Claims
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE claims (
  id BIGSERIAL PRIMARY KEY,
  claim_id VARCHAR(50) UNIQUE NOT NULL,
  policy_id VARCHAR(50),
  user_id VARCHAR(50),
  user_name VARCHAR(100),
  user_phone VARCHAR(20),
  trigger_type VARCHAR(50), -- 'weather', 'accident', 'parametric'
  trigger_value DECIMAL(10, 2),
  payout_amount DECIMAL(10, 2),
  payout_id VARCHAR(50) REFERENCES payouts(payout_id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'paid'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  paid_at TIMESTAMP,
  notes TEXT
);

-- Index
CREATE INDEX idx_claims_user_id ON claims(user_id);
CREATE INDEX idx_claims_claim_id ON claims(claim_id);
CREATE INDEX idx_claims_status ON claims(status);

-- ═══════════════════════════════════════════════════════════════════════════
-- Table 4: Policies
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE policies (
  id BIGSERIAL PRIMARY KEY,
  policy_id VARCHAR(50) UNIQUE NOT NULL,
  user_id VARCHAR(50),
  user_name VARCHAR(100),
  user_phone VARCHAR(20),
  platform VARCHAR(20), -- 'Zomato', 'Swiggy'
  pin_code VARCHAR(6),
  city VARCHAR(50),
  zone VARCHAR(50),
  nfi_score INT,
  tier VARCHAR(20), -- 'basic', 'standard', 'premium'
  premium DECIMAL(10, 2),
  max_payout DECIMAL(10, 2),
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'paused', 'expired'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activated_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Index
CREATE INDEX idx_policies_user_id ON policies(user_id);
CREATE INDEX idx_policies_policy_id ON policies(policy_id);
CREATE INDEX idx_policies_status ON policies(status);

-- ═══════════════════════════════════════════════════════════════════════════
-- Table 5: Disruption Feed (Live Data)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE disruptions (
  id BIGSERIAL PRIMARY KEY,
  disruption_type VARCHAR(50), -- 'rain', 'heat', 'flood', 'accident'
  location VARCHAR(100),
  pin_code VARCHAR(6),
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  severity VARCHAR(20), -- 'low', 'medium', 'high'
  icon VARCHAR(10),
  description TEXT,
  affected_riders INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Index
CREATE INDEX idx_disruptions_pin_code ON disruptions(pin_code);
CREATE INDEX idx_disruptions_created_at ON disruptions(created_at DESC);
CREATE INDEX idx_disruptions_severity ON disruptions(severity);

-- ═══════════════════════════════════════════════════════════════════════════
-- Row Level Security (RLS) - Policies
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE disruptions ENABLE ROW LEVEL SECURITY;

-- Policies can be read by all (for demo mode)
CREATE POLICY "payouts_read" ON payouts FOR SELECT USING (true);
CREATE POLICY "notifications_read" ON notifications FOR SELECT USING (true);
CREATE POLICY "claims_read" ON claims FOR SELECT USING (true);
CREATE POLICY "policies_read" ON policies FOR SELECT USING (true);
CREATE POLICY "disruptions_read" ON disruptions FOR SELECT USING (true);

-- Only backend can insert/update (service_role key or JWT token)
-- In production, restrict to authenticated users

-- ═══════════════════════════════════════════════════════════════════════════
-- Sample Data (Optional - for testing)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO disruptions (disruption_type, location, pin_code, latitude, longitude, severity, icon, description, affected_riders)
VALUES
  ('rain', 'Sector 5, Bangalore', '560001', 12.9716, 77.5946, 'high', '🌧️', 'Heavy rainfall detected', 234),
  ('heat', 'Whitefield, Bangalore', '560066', 13.0344, 77.6984, 'medium', '🔥', 'Heat index exceeded 42°C', 156),
  ('flood', 'Indiranagar, Bangalore', '560038', 13.0840, 77.6413, 'high', '🌊', 'Waterlogging reported', 89);

-- ═══════════════════════════════════════════════════════════════════════════
-- Helper Views (Optional)
-- ═══════════════════════════════════════════════════════════════════════════

-- Recent payouts
CREATE VIEW recent_payouts AS
SELECT payout_id, amount, status, recipient_type, created_at
FROM payouts
ORDER BY created_at DESC
LIMIT 20;

-- Pending claims
CREATE VIEW pending_claims AS
SELECT claim_id, user_name, user_phone, payout_amount, status, created_at
FROM claims
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Active policies
CREATE VIEW active_policies AS
SELECT policy_id, user_name, user_phone, platform, tier, premium, max_payout, created_at
FROM policies
WHERE status = 'active'
ORDER BY created_at DESC;

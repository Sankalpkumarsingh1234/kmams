import { createClient } from '@supabase/supabase-js';

// Environment variables (from .env.local)
// Lazy-load to allow .env to be configured first
let _supabaseClient = null;

function ensureClient() {
  if (!_supabaseClient) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase credentials in .env.local');
    }
    
    _supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabaseClient;
}

// Export as a function for routes to call
export function getSupabaseClient() {
  return ensureClient();
}

// Re-export with lazy getter for backward compatibility with routes using `supabase`
export { getSupabaseClient as supabase };

// ============ Helper Functions ============

/**
 * Get user profile with active policy and claims
 */
export async function getUserProfile(userId) {
  try {
    const { data: user, error: userError } = await getSupabaseClient()
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const { data: policy } = await getSupabaseClient()
      .from('policies')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: claims } = await getSupabaseClient()
      .from('claims')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      user,
      policy,
      claims: claims || [],
    };
  } catch (error) {
    console.error('getUserProfile error:', error);
    throw error;
  }
}

/**
 * Create new user
 */
export async function createUser(userData) {
  const {
    email,
    name,
    platform,
    pin_code,
    earnings_weekly,
    nfi_score,
  } = userData;

  try {
    // Check if user exists
    const { data: existing, error: existingError } = await getSupabaseClient()
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return { id: existing.id, isNew: false };
    }

    // Create new user
    const { data: newUser, error } = await getSupabaseClient()
      .from('users')
      .insert([{
        email,
        name,
        platform,
        pin_code,
        earnings,
        nfi,
      }])
      .select()
      .single();

    if (error) throw error;

    return { id: newUser.id, isNew: true, ...newUser };
  } catch (error) {
    console.error('createUser error:', error);
    throw error;
  }
}

/**
 * Create policy for user
 */
export async function createPolicy(policyData) {
  const { user_id, tier, premium_weekly, max_payout } = policyData;

  try {
    // Deactivate old policies
    await getSupabaseClient()
      .from('policies')
      .update({ active: false })
      .eq('user_id', user_id);

    // Create new policy
    const { data: policy, error } = await getSupabaseClient()
      .from('policies')
      .insert([{
        user_id,
        tier,
        premium,
        max_payout,
        active: true,
      }])
      .select()
      .single();

    if (error) throw error;

    return policy;
  } catch (error) {
    console.error('createPolicy error:', error);
    throw error;
  }
}

/**
 * Log a claim trigger (auto-payout on trigger)
 */
export async function logClaim(claimData) {
  const { user_id, policy_id, trigger, amount_triggered, weather_data } = claimData;

  try {
    const { data: claim, error } = await getSupabaseClient()
      .from('claims')
      .insert([{
        user_id,
        policy_id,
        trigger,
        amount,
        weather_data,
        status: 'paid',
        paid_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    return claim;
  } catch (error) {
    console.error('logClaim error:', error);
    throw error;
  }
}

/**
 * Get claims for user
 */
export async function getUserClaims(userId) {
  try {
    const { data: claims, error } = await getSupabaseClient()
      .from('claims')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return claims || [];
  } catch (error) {
    console.error('getUserClaims error:', error);
    throw error;
  }
}

/**
 * Log weather data for analysis
 */
export async function logWeatherData(weatherData) {
  try {
    const { data, error } = await getSupabaseClient()
      .from('weather_logs')
      .insert([{
        ...weatherData,
        created_at: new Date().toISOString(),
      }]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('logWeatherData error:', error);
    throw error;
  }
}

/**
 * Get all active users (for cron jobs)
 */
export async function getAllActiveUsers() {
  try {
    const { data: users, error } = await getSupabaseClient()
      .from('users')
      .select('id, email, name, pin_code, earnings_weekly, nfi_score');

    if (error) throw error;
    return users || [];
  } catch (error) {
    console.error('getAllActiveUsers error:', error);
    throw error;
  }
}

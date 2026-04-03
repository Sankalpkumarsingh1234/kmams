import { createClient } from '@supabase/supabase-js';

// Environment variables (from .env.local)
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

export function getSupabaseClient() {
  return ensureClient();
}

export { getSupabaseClient as supabase };

// ============ Helper Functions (REVERTED TO WORKING NAMES) ============

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
      .maybeSingle();

    const { data: claims } = await getSupabaseClient()
      .from('claims')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      user,
      policy: policy || null,
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
    earnings_weekly, // REVERTED
    nfi_score       // REVERTED
  } = userData;

  try {
    const { data: existing } = await getSupabaseClient()
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return { id: existing.id, isNew: false };
    }

    const { data: newUser, error } = await getSupabaseClient()
      .from('users')
      .insert([{
        email,
        name,
        platform,
        pin_code,
        earnings_weekly,
        nfi_score,
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
  const { user_id, tier, premium_weekly, max_payout } = policyData; // REVERTED

  try {
    await getSupabaseClient()
      .from('policies')
      .update({ active: false })
      .eq('user_id', user_id);

    const { data: policy, error } = await getSupabaseClient()
      .from('policies')
      .insert([{
        user_id,
        tier,
        premium_weekly,
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
 * Log a claim trigger
 */
export async function logClaim(claimData) {
  const { user_id, policy_id, trigger, amount_triggered, weather_data } = claimData; // REVERTED

  try {
    const { data: claim, error } = await getSupabaseClient()
      .from('claims')
      .insert([{
        user_id,
        policy_id,
        trigger,
        amount_triggered,
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
 * Log weather data
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
 * Get all active users
 */
export async function getAllActiveUsers() {
  try {
    const { data: users, error } = await getSupabaseClient()
      .from('users')
      .select('id, email, name, pin_code, earnings_weekly, nfi_score'); // REVERTED

    if (error) throw error;
    return users || [];
  } catch (error) {
    console.error('getAllActiveUsers error:', error);
    throw error;
  }
}

/**
 * Get all claims (Admin)
 */
export async function getAllClaims() {
  try {
    const { data: claims, error } = await getSupabaseClient()
      .from('claims')
      .select('*, users(name, platform, pin_code)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return claims || [];
  } catch (error) {
    console.error('getAllClaims error:', error);
    throw error;
  }
}

/**
 * Update claim status (Admin)
 */
export async function updateClaimStatus(claimId, status) {
  try {
    const { data, error } = await getSupabaseClient()
      .from('claims')
      .update({ 
        status, 
        paid_at: status === 'paid' ? new Date().toISOString() : null 
      })
      .eq('id', claimId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('updateClaimStatus error:', error);
    throw error;
  }
}

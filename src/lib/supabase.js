import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper: Get current authenticated user
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// Helper: Get user profile + policy + claims
export async function getUserFullProfile(userId) {
  try {
    const [userRes, policyRes, claimsRes] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('policies').select('*').eq('user_id', userId).eq('active', true).single(),
      supabase.from('claims').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ])

    return {
      user: userRes.data,
      policy: policyRes.data,
      claims: claimsRes.data || []
    }
  } catch (error) {
    console.error('Get user profile error:', error)
    return { user: null, policy: null, claims: [] }
  }
}

// Helper: Create user
export async function createUser(userData) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Create user error:', error)
    return { success: false, error: error.message }
  }
}

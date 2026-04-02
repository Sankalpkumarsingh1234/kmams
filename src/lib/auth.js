// src/lib/auth.js
// Client-side auth utilities — import these in your React components

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── Register ───────────────────────────────────────────────────────────────
export async function register({ name, email, password, phone, role = 'worker' }) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

// ─── Login ───────────────────────────────────────────────────────────────────
export async function login({ email, password }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');

  // Persist session token in localStorage
  if (data.session?.access_token) {
    localStorage.setItem('gigshield_token', data.session.access_token);
    localStorage.setItem('gigshield_user', JSON.stringify(data.user));
  }
  return data;
}

// ─── Logout ──────────────────────────────────────────────────────────────────
export async function logout() {
  const token = localStorage.getItem('gigshield_token');
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  localStorage.removeItem('gigshield_token');
  localStorage.removeItem('gigshield_user');
}

// ─── Get current user from localStorage ──────────────────────────────────────
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('gigshield_user');
  return raw ? JSON.parse(raw) : null;
}

// ─── Get token ───────────────────────────────────────────────────────────────
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('gigshield_token');
}

// ─── Fetch with auth header ───────────────────────────────────────────────────
export async function authFetch(url, options = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────
export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw new Error(error.message);
}

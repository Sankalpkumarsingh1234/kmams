// server/api/auth/register.js
// Backend handler for user registration
// Integrate this with your Node.js/Express backend

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handleRegister(req, res) {
  try {
    const { email, password, name, role = 'worker', phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required',
      });
    }

    // 1. Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm for dev; set to false in prod to send email
      user_metadata: { name, role, phone },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // 2. Insert into your profiles table
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      name,
      email,
      phone: phone || null,
      role,
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      // Rollback auth user if profile insert fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    return res.status(200).json({
      message: 'Registration successful',
      user: { id: authData.user.id, email, name, role },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

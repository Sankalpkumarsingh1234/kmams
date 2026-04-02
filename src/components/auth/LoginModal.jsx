// src/components/auth/LoginModal.jsx
// Drop this component anywhere and it shows a login/register modal

import { useState } from 'react';
import { login, register, loginWithGoogle } from '@/lib/auth';

export default function LoginModal({ onSuccess, onClose, defaultRole = 'worker' }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: defaultRole,
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await login({ email: form.email, password: form.password });
      } else {
        result = await register({
          name: form.name, email: form.email,
          password: form.password, phone: form.phone, role: form.role,
        });
        // After register, log them in
        result = await login({ email: form.email, password: form.password });
      }
      onSuccess?.(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>🛡️ GigShield</div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['login', 'register'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setMode(tab); setError(''); }}
              style={{ ...styles.tab, ...(mode === tab ? styles.activeTab : {}) }}
            >
              {tab === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={styles.form}>
          {mode === 'register' && (
            <>
              <input style={styles.input} placeholder="Full Name" value={form.name} onChange={update('name')} />
              <input style={styles.input} placeholder="Phone (optional)" value={form.phone} onChange={update('phone')} />
              <select style={styles.input} value={form.role} onChange={update('role')}>
                <option value="worker">Gig Worker</option>
                <option value="insurer">Insurer / Admin</option>
              </select>
            </>
          )}
          <input style={styles.input} placeholder="Email" type="email" value={form.email} onChange={update('email')} />
          <input style={styles.input} placeholder="Password" type="password" value={form.password} onChange={update('password')} />

          {error && <div style={styles.error}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading} style={styles.primaryBtn}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div style={styles.divider}><span>or</span></div>

          <button onClick={handleGoogle} style={styles.googleBtn}>
            <span style={{ marginRight: 8 }}>G</span> Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 16, width: 400, maxWidth: '95vw',
    padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 20, fontWeight: 700, color: '#16a34a' },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#666' },
  tabs: { display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #e5e7eb', paddingBottom: 0 },
  tab: {
    background: 'none', border: 'none', fontSize: 14, fontWeight: 600,
    padding: '8px 16px', cursor: 'pointer', color: '#9ca3af', borderBottom: '2px solid transparent',
    marginBottom: -2,
  },
  activeTab: { color: '#16a34a', borderBottom: '2px solid #16a34a' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  error: { background: '#fef2f2', color: '#dc2626', padding: '8px 12px', borderRadius: 8, fontSize: 13 },
  primaryBtn: {
    background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8,
    padding: '12px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%',
  },
  divider: {
    textAlign: 'center', color: '#9ca3af', fontSize: 13, position: 'relative',
    borderTop: '1px solid #e5e7eb', paddingTop: 12,
  },
  googleBtn: {
    background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8,
    padding: '10px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};

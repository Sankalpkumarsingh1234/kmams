import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulating registration - in real app, call Supabase auth here
    setTimeout(() => {
      setLoading(false);
      navigate('/onboarding');
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <div style={styles.header}>
          <div style={styles.logo}>🛵</div>
          <h1 style={styles.title}>Join GigShield</h1>
          <p style={styles.subtitle}>Protect your income in under 2 minutes</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input 
                name="name"
                placeholder="Rahul K."
                value={formData.name}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <input 
                name="phone"
                placeholder="+91"
                value={formData.phone}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating Account...' : 'Get Protected Now'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account? <Link to="/login" style={styles.link}>Sign in instead</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #FF6B35, #FFB830, #1A1512)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 15s ease infinite',
    padding: '20px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  glassCard: {
    width: '100%',
    maxWidth: '500px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '40px',
    animation: 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    fontSize: '48px',
    marginBottom: '16px',
    display: 'inline-block',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1A1512',
    margin: '0 0 8px 0',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '15px',
    color: '#6B5E55',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1A1512',
    paddingLeft: '4px',
  },
  input: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1.5px solid #E0D9D0',
    background: '#F9F8F6',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
  },
  button: {
    marginTop: '10px',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #FF6B35 0%, #FF5520 100%)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(255, 107, 53, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    color: '#6B5E55',
  },
  link: {
    color: '#FF6B35',
    fontWeight: '600',
    textDecoration: 'none',
    borderBottom: '1.5px solid transparent',
    transition: 'all 0.2s',
  }
};

export default RegisterPage;

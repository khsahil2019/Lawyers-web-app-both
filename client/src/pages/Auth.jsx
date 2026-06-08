import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, UserCheck, Scale, ArrowRight } from 'lucide-react';
import { API_BASE } from '../App';

function Auth({ onAuthSuccess }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client'); // 'client' or 'advocate'
  const [loading, setLoading] = useState(false);

  // Sync mode with URL search params when they change
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'register' || urlMode === 'login') {
      setMode(urlMode);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill out all fields.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
          onAuthSuccess(data.token);
          // Redirect based on role
          if (data.user.role === 'admin') {
            navigate('/dashboard');
          } else if (data.user.role === 'advocate') {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        } else {
          alert(data.error || 'Authentication failed.');
        }
      } else {
        // Sign Up Mode
        if (role === 'advocate') {
          // Redirect to full advocate registration page so they can input details
          navigate(`/register-advocate?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        } else {
          // Standard client sign up
          const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, role: 'client' })
          });

          const data = await res.json();
          if (res.ok) {
            onAuthSuccess(data.token);
            navigate('/');
          } else {
            alert(data.error || 'Registration failed.');
          }
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Scale size={36} className="text-gold" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {mode === 'login' 
              ? 'Sign in to access your secure LexCounsel workspace' 
              : 'Join as a client or register your law practice directory listing'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)' 
              }} />
              <input 
                type="email" 
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input" 
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)' 
              }} />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input" 
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          {/* Role Choice (Only for registration) */}
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">I want to join as a</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className="btn"
                  style={{
                    backgroundColor: role === 'client' ? 'rgba(197, 168, 128, 0.1)' : 'transparent',
                    borderColor: role === 'client' ? 'var(--gold-primary)' : 'var(--gold-hairline)',
                    color: role === 'client' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderStyle: 'solid',
                    borderWidth: '1px'
                  }}
                >
                  <UserCheck size={16} /> Client
                </button>
                <button
                  type="button"
                  onClick={() => setRole('advocate')}
                  className="btn"
                  style={{
                    backgroundColor: role === 'advocate' ? 'rgba(197, 168, 128, 0.1)' : 'transparent',
                    borderColor: role === 'advocate' ? 'var(--gold-primary)' : 'var(--gold-hairline)',
                    color: role === 'advocate' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderStyle: 'solid',
                    borderWidth: '1px'
                  }}
                >
                  <Scale size={16} /> Advocate
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '12px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? 'Processing...' : (
              <>
                {mode === 'login' ? 'Sign In' : (role === 'advocate' ? 'Proceed to Registration' : 'Register Account')}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle Mode */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setMode('register')} className="btn-text" style={{ cursor: 'pointer', fontWeight: '500' }}>
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="btn-text" style={{ cursor: 'pointer', fontWeight: '500' }}>
                Sign in
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Auth;

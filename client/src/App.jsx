import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Scale, LogOut, LayoutDashboard, Search, Sparkles, BookOpen } from 'lucide-react';
import Home from './pages/Home';
import SearchPage from './pages/Search';
import AdvocateProfile from './pages/AdvocateProfile';
import RegisterAdvocate from './pages/RegisterAdvocate';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Matchmaker from './pages/Matchmaker';
import Resources from './pages/Resources';

export const API_BASE = 'http://localhost:5001/api';

// Navigation wrapper component to access location and handle active links
function Navigation({ user, logout }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header>
      <div className="container" style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
          <Scale size={24} className="text-gold" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', letterSpacing: '0.05em', fontWeight: 'bold' }}>
            <span className="text-gold">Lex</span>Counsel
          </span>
        </Link>

        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center', marginLeft: 'auto', marginRight: '24px' }}>
          <Link 
            to="/" 
            className="btn-text" 
            style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/' ? 'var(--gold-primary)' : 'var(--text-secondary)',
              fontWeight: location.pathname === '/' ? '500' : '400'
            }}
          >
            Home
          </Link>
          <Link 
            to="/search" 
            className="btn-text" 
            style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/search' ? 'var(--gold-primary)' : 'var(--text-secondary)',
              fontWeight: location.pathname === '/search' ? '500' : '400'
            }}
          >
            Find Advocate
          </Link>
          <Link 
            to="/matchmaker" 
            className="btn-text" 
            style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/matchmaker' ? 'var(--gold-primary)' : 'var(--text-secondary)',
              fontWeight: location.pathname === '/matchmaker' ? '500' : '400',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sparkles size={14} /> AI Matchmaker
          </Link>
          <Link 
            to="/resources" 
            className="btn-text" 
            style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/resources' ? 'var(--gold-primary)' : 'var(--text-secondary)',
              fontWeight: location.pathname === '/resources' ? '500' : '400',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <BookOpen size={14} /> Legal Guide
          </Link>
          {user && (
            <Link 
              to="/dashboard" 
              className="btn-text" 
              style={{ 
                textDecoration: 'none', 
                color: location.pathname === '/dashboard' ? 'var(--gold-primary)' : 'var(--text-secondary)',
                fontWeight: location.pathname === '/dashboard' ? '500' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <LayoutDashboard size={14} /> Dashboard
            </Link>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <button onClick={() => logout(navigate)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LogOut size={14} /> Logout
            </button>
          ) : (
            <>
              <Link to="/auth?mode=login" className="btn btn-secondary btn-sm">Sign in</Link>
              <Link to="/auth?mode=register" className="btn btn-primary btn-sm">Join</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [advocateProfile, setAdvocateProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync auth token changes and fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setAdvocateProfile(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setAdvocateProfile(data.advocateProfile);
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
          setToken('');
          setUser(null);
          setAdvocateProfile(null);
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const logout = (navigate) => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setAdvocateProfile(null);
    if (navigate) navigate('/');
  };

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navigation user={user} logout={logout} />
        
        <main style={{ flex: 1 }}>
          {loading ? (
            <div className="loading-pulse" style={{ height: '50vh' }}></div>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/matchmaker" element={<Matchmaker />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/advocate/:id" element={<AdvocateProfile />} />
              <Route path="/register-advocate" element={<RegisterAdvocate onRegisterSuccess={handleLoginSuccess} />} />
              <Route path="/auth" element={<Auth onAuthSuccess={handleLoginSuccess} />} />
              <Route 
                path="/dashboard" 
                element={
                  <Dashboard 
                    user={user} 
                    token={token} 
                    profile={advocateProfile} 
                    setProfile={setAdvocateProfile} 
                    logout={logout}
                  />
                } 
              />
            </Routes>
          )}
        </main>

        <footer style={{ 
          padding: '40px 0', 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          color: 'var(--text-muted)', 
          borderTop: '1px solid var(--gold-hairline)',
          marginTop: '60px'
        }}>
          <div className="container">
            <p>© {new Date().getFullYear()} LexCounsel. A verified advocate registry.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

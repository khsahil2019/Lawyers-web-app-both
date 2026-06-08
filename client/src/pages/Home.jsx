import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Scale, Award, BookOpen, Sparkles } from 'lucide-react';

const specialties = [
  { name: 'Criminal', type: 'Lawyer' },
  { name: 'Environmental', type: 'Lawyer' },
  { name: 'Family', type: 'Lawyer' },
  { name: 'Corporate', type: 'Lawyer' },
  { name: 'Civil', type: 'Lawyer' },
  { name: 'Intellectual Property', type: 'Lawyer' },
  { name: 'Tax', type: 'Lawyer' },
  { name: 'Cyber', type: 'Lawyer' },
  { name: 'Estate Planning', type: 'Lawyer' },
  { name: 'Worker\'s Compensation', type: 'Lawyer' },
  { name: 'Public Interest', type: 'Lawyer' },
  { name: 'Merger and Acquisition', type: 'Lawyer' }
];

const pioneers = [
  {
    name: 'Harish Salve',
    title: 'Distinguished Jurist & King\'s Counsel',
    image: '/harish_salve.png',
    bio: 'One of India\'s most prominent senior advocates. Former Solicitor General of India who regularly represents the country in high-profile international tribunals, including the International Court of Justice.'
  },
  {
    name: 'Indira Jaising',
    title: 'Pioneering Human Rights Advocate',
    image: '/indira_jaising.png',
    bio: 'Distinguished feminist lawyer and human rights activist. The first female Additional Solicitor General of India, renowned for her landmark advocacy in domestic violence protection and labor rights.'
  },
  {
    name: 'Fali S. Nariman',
    title: 'Doyen of Indian Constitutional Law',
    image: '/fali_nariman.png',
    bio: 'Legendary constitutional jurist and senior advocate. Awarded the Padma Vibhushan, he was instrumental in establishing landmark judicial precedents shaping India\'s Basic Structure doctrine.'
  }
];

function Home() {
  return (
    <div>
      {/* Hero Section with Supreme Court Background */}
      <section style={{ 
        position: 'relative',
        padding: '120px 24px 140px 24px',
        backgroundImage: 'linear-gradient(rgba(7, 7, 7, 0.78), rgba(7, 7, 7, 0.95)), url("/supreme_court_bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
        textAlign: 'center',
        borderBottom: '1px solid var(--gold-hairline)'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Verification Badge */}
          <div className="badge badge-gold" style={{ marginBottom: '32px', padding: '6px 16px', gap: '6px', background: 'rgba(7, 7, 7, 0.6)', backdropFilter: 'blur(4px)' }}>
            <ShieldCheck size={14} className="text-gold" />
            <span>Every advocate verified by admin review</span>
          </div>

          {/* Heading */}
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
            lineHeight: 1.1, 
            maxWidth: '900px',
            margin: '0 auto 28px auto',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            Counsel you can <span className="text-gold italic" style={{ display: 'inline-block' }}>trust.</span><br />
            Across every Indian court.
          </h1>

          {/* Subtitle */}
          <p style={{ 
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
            color: 'var(--text-secondary)',
            maxWidth: '650px',
            margin: '0 auto 40px auto',
            lineHeight: 1.6,
            textShadow: '0 2px 5px rgba(0,0,0,0.5)'
          }}>
            A curated registry of advocates verified by license and proof. Search by district, court, and practice area — then reach out, privately.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            <Link to="/search" className="btn btn-primary gold-glow" style={{ padding: '12px 32px', fontSize: '0.95rem' }}>
              <Search size={16} /> Find an advocate
            </Link>
            <Link to="/matchmaker" className="btn btn-secondary" style={{ padding: '12px 32px', fontSize: '0.95rem', background: 'rgba(7, 7, 7, 0.4)', backdropFilter: 'blur(4px)' }}>
              <Sparkles size={16} className="text-gold" /> AI Matchmaker
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges section */}
      <section style={{ 
        padding: '50px 0', 
        borderBottom: '1px solid var(--gold-hairline)',
        background: 'rgba(255, 255, 255, 0.01)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            textAlign: 'center'
          }}>
            <div style={{ padding: '16px' }}>
              <ShieldCheck size={32} className="text-gold" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>100% Verified Profiles</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Each bar certificate and enrollment number is manually cross-checked with State Bar Councils.</p>
            </div>
            <div style={{ padding: '16px' }}>
              <Scale size={32} className="text-gold" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Expertise Matching</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Find specialized lawyers covering civil litigation, criminal trials, tax law, and intellectual property.</p>
            </div>
            <div style={{ padding: '16px' }}>
              <Award size={32} className="text-gold" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Direct Connection</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No referral fees or middle-men. Reach out via private messages and consult directly with your counsel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Areas / Specialties */}
      <section style={{ padding: '80px 24px', borderBottom: '1px solid var(--gold-hairline)' }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            marginBottom: '40px' 
          }}>
            <div>
              <p style={{ 
                color: 'var(--gold-primary)', 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.15em',
                marginBottom: '8px'
              }}>
                Practice Areas
              </p>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>Find by specialty</h2>
            </div>
            <Link to="/search" style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)', 
              textDecoration: 'none',
              transition: 'var(--transition-fast)'
            }} className="btn-text">
              All areas →
            </Link>
          </div>

          {/* Grid of Specialties */}
          <div className="cards-grid">
            {specialties.map((spec) => (
              <Link 
                key={spec.name}
                to={`/search?specialty=${encodeURIComponent(spec.name)}`}
                className="card"
                style={{ 
                  textDecoration: 'none', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  minHeight: '100px'
                }}
              >
                <div style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: '500', 
                  color: 'var(--text-primary)',
                  transition: 'var(--transition-fast)'
                }} className="card-title">
                  {spec.name}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)', 
                  marginTop: '4px' 
                }}>
                  {spec.type}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Distinguished Jurists of India Section */}
      <section style={{ padding: '80px 24px', background: 'rgba(255, 255, 255, 0.005)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <p style={{ 
              color: 'var(--gold-primary)', 
              fontSize: '0.75rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.15em',
              marginBottom: '8px'
            }}>
              Inspirational Leaders
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>Pioneering Advocates of India</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '8px auto 0 auto' }}>
              Honoring some of the nation's most respected legal minds who have shaped India's judicial landscape.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px'
          }}>
            {pioneers.map((p) => (
              <div key={p.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    style={{ 
                      width: '70px', 
                      height: '70px', 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      border: '1.5px solid var(--gold-primary)'
                    }} 
                  />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: '600', color: 'var(--text-primary)' }}>{p.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', marginTop: '2px' }}>{p.title}</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {p.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;

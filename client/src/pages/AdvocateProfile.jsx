import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Briefcase, Scale, Mail, Phone, ChevronLeft, Send, CheckCircle2, Award, FolderOpen } from 'lucide-react';
import { API_BASE } from '../App';

function AdvocateProfile() {
  const { id } = useParams();
  
  const [advocate, setAdvocate] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Contact Form State
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [messageText, setMessageText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Profile Active Tab (for right-side details)
  const [profileTab, setProfileTab] = useState('philosophy'); // 'philosophy' or 'cases'

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch Profile
        const profileRes = await fetch(`${API_BASE}/advocates/${id}`);
        if (!profileRes.ok) {
          setError('Advocate profile not found.');
          setLoading(false);
          return;
        }
        const profileData = await profileRes.json();
        setAdvocate(profileData);

        // Fetch Cases
        const casesRes = await fetch(`${API_BASE}/advocates/${id}/cases`);
        if (casesRes.ok) {
          const casesData = await casesRes.json();
          setCases(casesData);
        }
      } catch (err) {
        console.error('Error fetching advocate profile data:', err);
        setError('Connection error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !messageText) {
      alert('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/advocates/${id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender_name: senderName,
          sender_email: senderEmail,
          sender_phone: senderPhone,
          message_text: messageText
        })
      });

      if (res.ok) {
        setSuccess(true);
        setSenderName('');
        setSenderEmail('');
        setSenderPhone('');
        setMessageText('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Error posting message lead:', err);
      alert('Network error. Failed to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px' }}>
        <div className="loading-pulse"></div>
      </div>
    );
  }

  if (error || !advocate) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px' }}>{error || 'Advocate Not Found'}</h2>
        <Link to="/search" className="btn btn-primary">Back to Directory</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      
      {/* Back to Directory Button */}
      <Link to="/search" style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '4px', 
        color: 'var(--text-secondary)', 
        textDecoration: 'none',
        marginBottom: '32px',
        fontSize: '0.875rem'
      }} className="btn-text">
        <ChevronLeft size={16} /> Back to Directory
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '40px',
        alignItems: 'start'
      }}>
        
        {/* Left Column: General info Card & Private message Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Profile Card */}
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <img 
                src={advocate.profile_image} 
                alt={advocate.full_name} 
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: '2px solid var(--gold-primary)',
                  marginBottom: '20px'
                }} 
              />
              
              <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                {advocate.full_name}
                <ShieldCheck size={20} className="text-gold-solid" title="LexCounsel Verified" />
              </h2>
              
              <div className="badge badge-gold" style={{ margin: '8px 0 16px 0', fontSize: '0.75rem' }}>
                {advocate.specialty} Specialist
              </div>

              {/* Bar ID */}
              <div style={{ 
                borderTop: '1px solid var(--gold-hairline)', 
                borderBottom: '1px solid var(--gold-hairline)', 
                width: '100%', 
                padding: '10px 0', 
                fontSize: '0.75rem', 
                color: 'var(--text-muted)',
                marginBottom: '20px'
              }}>
                Bar License: <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{advocate.bar_number}</span>
              </div>

              {/* Details List */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Briefcase size={16} className="text-gold" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Experience</strong>
                    <span>{advocate.experience_years} Years Practice</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Scale size={16} className="text-gold" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Practice Court</strong>
                    <span>{advocate.court}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <MapPin size={16} className="text-gold" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Location</strong>
                    <span>{advocate.district}, {advocate.state}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Reach out, privately</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '20px' }}>Your message will be sent directly to the advocate's secure dashboard.</p>
            
            {success ? (
              <div style={{ 
                background: 'rgba(34, 197, 94, 0.05)', 
                border: '1px solid var(--success)', 
                borderRadius: '6px',
                padding: '20px', 
                textAlign: 'center', 
                color: 'var(--text-primary)' 
              }}>
                <CheckCircle2 size={30} style={{ color: 'var(--success)', marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>Message Sent!</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>The advocate will contact you shortly.</p>
                <button onClick={() => setSuccess(false)} className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleMessageSubmit}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="John Doe"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="form-input" 
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="john@example.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="form-input" 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Phone (Optional)</label>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="form-input" 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Consultation request *</label>
                  <textarea 
                    required
                    placeholder="Describe your case or consultation requirements..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="form-textarea" 
                    style={{ minHeight: '100px' }}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', height: '42px', justifyContent: 'center' }}
                >
                  {submitting ? 'Sending...' : (
                    <>
                      <Send size={14} /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Right Column: Bio description, Litigation approach, Handled cases list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Tabs header selector */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--gold-hairline)', paddingBottom: '12px' }}>
            <button
              onClick={() => setProfileTab('philosophy')}
              className="btn btn-sm"
              style={{
                backgroundColor: profileTab === 'philosophy' ? 'rgba(197, 168, 128, 0.15)' : 'transparent',
                borderColor: profileTab === 'philosophy' ? 'var(--gold-primary)' : 'transparent',
                color: profileTab === 'philosophy' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              <Award size={14} /> Practice Philosophy & Bio
            </button>
            <button
              onClick={() => setProfileTab('cases')}
              className="btn btn-sm"
              style={{
                backgroundColor: profileTab === 'cases' ? 'rgba(197, 168, 128, 0.15)' : 'transparent',
                borderColor: profileTab === 'cases' ? 'var(--gold-primary)' : 'transparent',
                color: profileTab === 'cases' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              <FolderOpen size={14} /> Handled Cases Portfolio ({cases.length})
            </button>
          </div>

          {profileTab === 'philosophy' ? (
            /* TAB 1: BIOGRAPHY & PHILOSOPHY */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Bio */}
              <div className="card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '16px', borderBottom: '1px solid var(--gold-hairline)', paddingBottom: '8px' }}>About Advocate</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line', fontSize: '0.925rem' }}>
                  {advocate.bio || 'No biography details provided.'}
                </p>
              </div>

              {/* Case Theory Approach */}
              <div className="card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '16px', borderBottom: '1px solid var(--gold-hairline)', paddingBottom: '8px' }}>Case Theory & Litigation Strategy</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line', fontSize: '0.925rem' }}>
                  {advocate.case_theory_approach || `${advocate.full_name} is dedicated to establishing sound legal strategies tailored to the individual specifics of client disputes, focusing on meticulous statutory interpretation and trial preparation.`}
                </p>
              </div>

            </div>
          ) : (
            /* TAB 2: PORTFOLIO OF CASES */
            <div className="card" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '20px', borderBottom: '1px solid var(--gold-hairline)', paddingBottom: '8px' }}>Handled Case Studies</h3>
              
              {cases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <FolderOpen size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>No case studies added to this profile yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {cases.map((c) => (
                    <div key={c.id} style={{ 
                      border: '1px solid var(--gold-hairline)', 
                      borderRadius: '6px', 
                      padding: '20px', 
                      background: 'rgba(255, 255, 255, 0.01)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>{c.title}</h4>
                        
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.case_year}</span>
                          <span className={`badge ${
                            c.result === 'Won' ? 'badge-success' : 
                            c.result === 'Settled' ? 'badge-gold' : 
                            c.result === 'Pending' ? 'badge-pending' : 'badge-error'
                          }`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                            {c.result}
                          </span>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        {c.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AdvocateProfile;

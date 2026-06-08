import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Briefcase, MapPin, Scale, MessageSquare, ArrowRight, BookOpen } from 'lucide-react';
import { API_BASE } from '../App';

const sampleQueries = [
  { text: "My spouse and I want a mutual consent divorce and divide custody of our child.", label: "Divorce & Custody" },
  { text: "I am starting a tech startup and need founder shareholder agreements drafted.", label: "Startup Corporate Contracts" },
  { text: "The police stopped me and took my car keys unlawfully without any challan record.", label: "Unlawful Police Action" },
  { text: "A local retail chain is copying my boutique's trademark logo and branding.", label: "IP/Brand Infringement" }
];

function Matchmaker() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleMatch = async (e) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      alert('Please write at least a sentence explaining your legal concern.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/matchmaker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const data = await res.json();
        alert(data.error || 'Matchmaker query failed.');
      }
    } catch (err) {
      console.error('Matchmaker request error:', err);
      alert('Connection error. Failed to run recommendation engine.');
    } finally {
      setLoading(false);
    }
  };

  const selectSample = (text) => {
    setDescription(text);
  };

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="badge badge-gold" style={{ marginBottom: '16px', gap: '6px' }}>
          <Sparkles size={12} /> AI-Powered Advocacy Matching
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>AI Lawyer Matchmaker</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
          Describe your legal dispute or consultation requirements in your own words. Our matchmaker analyzes keywords to suggest the most qualified verified advocates.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
        
        {/* Input Panel */}
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>What is your case situation?</h3>
          
          <form onSubmit={handleMatch}>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Describe details *</label>
              <textarea 
                required
                placeholder="Explain the conflict, dispute, contract needs, or court filings you require assistance with..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
                style={{ minHeight: '150px', lineHeight: '1.5' }}
              ></textarea>
            </div>

            {/* Quick Helper Samples */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                Or select a sample situation:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {sampleQueries.map((q) => (
                  <button 
                    key={q.label}
                    type="button"
                    onClick={() => selectSample(q.text)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.725rem', padding: '6px 10px', borderRadius: '4px' }}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary" 
              style={{ width: '100%', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {loading ? 'Analyzing Case...' : (
                <>
                  Find Matching Lawyers <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Matches Results Panel */}
        <div>
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Matching Result Summary Card */}
              <div className="card" style={{ 
                padding: '24px', 
                borderLeft: '3px solid var(--gold-primary)',
                background: 'linear-gradient(90deg, rgba(197, 168, 128, 0.05) 0%, rgba(0,0,0,0) 100%)' 
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Classification Result
                </span>
                <h3 style={{ fontSize: '1.35rem', margin: '4px 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scale size={20} className="text-gold" /> {result.specialtyMatched} Specialist Recommended
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Our matching engine identified key elements in your request corresponding to this legal specialty. Below are the top verified advocates matching your litigation or contract profile.
                </p>
              </div>

              {/* Advocates list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {result.advocates.map((adv) => (
                  <div key={adv.id} className="card" style={{ padding: '24px', transition: 'var(--transition-smooth)' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                      <img 
                        src={adv.profile_image} 
                        alt={adv.full_name} 
                        style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold-hairline)' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {adv.full_name}
                          <ShieldCheck size={16} className="text-gold-solid" />
                        </h4>
                        
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Briefcase size={12} className="text-gold" /> {adv.experience_years} Yrs Exp
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Scale size={12} className="text-gold" /> {adv.court}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} className="text-gold" /> {adv.district}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                          {adv.bio}
                        </p>

                        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                          <Link to={`/advocate/${adv.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                            View Case Portfolio
                          </Link>
                          <Link to={`/advocate/${adv.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <MessageSquare size={12} /> Contact Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            /* Empty State */
            <div className="card" style={{ 
              height: '100%', 
              minHeight: '340px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              textAlign: 'center',
              borderStyle: 'dashed',
              padding: '40px' 
            }}>
              <Sparkles size={48} className="text-gold" style={{ marginBottom: '16px', opacity: 0.3 }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Waiting for case details</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
                Describe your concern in the form and run the search to view personalized advocate recommendations.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Matchmaker;

import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Scale, ShieldAlert, ArrowLeft, ArrowRight, User, CheckCircle } from 'lucide-react';
import { API_BASE } from '../App';

const specialties = [
  'Criminal', 'Environmental', 'Family', 'Corporate', 'Civil', 
  'Intellectual Property', 'Tax', 'Cyber', 'Estate Planning', 
  'Worker\'s Compensation', 'Public Interest', 'Merger and Acquisition'
];

function RegisterAdvocate({ onRegisterSuccess }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Prefill credentials if coming from Auth page
  const prefilledEmail = searchParams.get('email') || '';
  const prefilledPassword = searchParams.get('password') || '';

  // Credentials State
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState(prefilledPassword);

  // Profile Details State
  const [fullName, setFullName] = useState('');
  const [barNumber, setBarNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [court, setCourt] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Credentials, Step 2: Practice Details

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill out account credentials.');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !barNumber || !experience || !specialty || !court || !state || !district) {
      alert('Please fill out all required profile details.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          role: 'advocate',
          full_name: fullName,
          bar_number: barNumber,
          experience_years: experience,
          specialty,
          court,
          state,
          district,
          bio,
          contact_phone: phone,
          contact_email: contactEmail || email,
          profile_image: profileImage || undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        onRegisterSuccess(data.token);
        navigate('/dashboard');
      } else {
        alert(data.error || 'Failed to submit registration.');
      }
    } catch (err) {
      console.error('Registration submit error:', err);
      alert('Network error. Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 24px', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '40px' }}>
        
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={24} className="text-gold" />
            <h2 style={{ fontSize: '1.5rem' }}>Advocate Registration</h2>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Step {step} of 2
          </div>
        </div>

        {/* Informative Alert banner */}
        <div className="badge badge-gold" style={{ 
          width: '100%', 
          borderRadius: '6px', 
          padding: '12px 16px', 
          gap: '8px', 
          marginBottom: '24px',
          alignItems: 'flex-start',
          lineHeight: '1.4',
          textAlign: 'left'
        }}>
          <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.8rem' }}>Verification Notice</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              All LexCounsel profiles must pass administrator verification of your Bar Registration ID before appearing in public searches.
            </span>
          </div>
        </div>

        {step === 1 ? (
          /* Step 1 Form */
          <form onSubmit={handleNextStep}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Account Credentials</h3>
            
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                required
                placeholder="e.g. advocate@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input 
                type="password" 
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input" 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '30px' }}>
              Next: Practice Details <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* Step 2 Form */
          <form onSubmit={handleSubmit}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid var(--gold-hairline)', paddingBottom: '8px' }}>Practice Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Adv. Harish Malhotra"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bar Registration Number *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. D/1203/2011"
                  value={barNumber}
                  onChange={(e) => setBarNumber(e.target.value)}
                  className="form-input" 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Years of Experience *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  placeholder="e.g. 10"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Specialty *</label>
                <select 
                  required
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Specialty</option>
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Court of Practice *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Delhi High Court"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                className="form-input" 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">State *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Delhi"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">District *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. New Delhi"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="form-input" 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Contact Phone (Optional)</label>
                <input 
                  type="tel" 
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Email (Optional)</label>
                <input 
                  type="email" 
                  placeholder={email}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="form-input" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Profile Image URL (Optional)</label>
              <input 
                type="url" 
                placeholder="e.g. https://images.unsplash.com/photo-..."
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                className="form-input" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Professional Biography</label>
              <textarea 
                placeholder="Tell clients about your background, major areas of advocacy, litigation experience, and professional values..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="form-textarea" 
                style={{ minHeight: '100px' }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '30px' }}>
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={16} /> Back
              </button>
              
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '42px' }}
              >
                {loading ? 'Submitting...' : (
                  <>
                    <CheckCircle size={16} /> Complete Registration
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default RegisterAdvocate;

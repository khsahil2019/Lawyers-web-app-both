import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Mail, Phone, Calendar, Scale, Edit2, Save, FileText, Search, UserCheck, FolderOpen, Plus, Trash2, Check, X } from 'lucide-react';
import { API_BASE } from '../App';

function Dashboard({ user, token, profile, setProfile, logout }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=login');
    }
  }, [user, navigate]);

  if (!user) return null;

  if (user.role === 'admin') {
    return <AdminDashboard token={token} logout={logout} />;
  } else if (user.role === 'advocate') {
    return (
      <AdvocateDashboard 
        user={user} 
        token={token} 
        profile={profile} 
        setProfile={setProfile} 
        logout={logout} 
      />
    );
  } else {
    return <ClientDashboard user={user} logout={logout} />;
  }
}

// --- ADVOCATE DASHBOARD COMPONENT ---
function AdvocateDashboard({ token, profile, setProfile, logout }) {
  const [messages, setMessages] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dashboard Sub-tabs
  const [dashboardTab, setDashboardTab] = useState('leads'); // 'leads' or 'cases'

  // Edit Profile form fields
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState(profile?.bio || '');
  const [caseTheory, setCaseTheory] = useState(profile?.case_theory_approach || '');
  const [phone, setPhone] = useState(profile?.contact_phone || '');
  const [contactEmail, setContactEmail] = useState(profile?.contact_email || '');
  const [profileImage, setProfileImage] = useState(profile?.profile_image || '');
  const [court, setCourt] = useState(profile?.court || '');
  const [specialty, setSpecialty] = useState(profile?.specialty || '');
  const [experience, setExperience] = useState(profile?.experience_years || 0);

  // New Case study form fields
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [newCaseResult, setNewCaseResult] = useState('Won');
  const [newCaseYear, setNewCaseYear] = useState(new Date().getFullYear());
  const [addingCase, setAddingCase] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/advocate`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setMessages(data.messages);
        setCases(data.cases);
        
        // Sync edits inputs
        setBio(data.profile.bio);
        setCaseTheory(data.profile.case_theory_approach || '');
        setPhone(data.profile.contact_phone);
        setContactEmail(data.profile.contact_email);
        setProfileImage(data.profile.profile_image);
        setCourt(data.profile.court);
        setSpecialty(data.profile.specialty);
        setExperience(data.profile.experience_years);
      }
    } catch (err) {
      console.error('Error fetching advocate dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/dashboard/advocate/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio,
          case_theory_approach: caseTheory,
          contact_phone: phone,
          contact_email: contactEmail,
          profile_image: profileImage,
          court,
          specialty,
          experience_years: experience
        })
      });

      if (res.ok) {
        setEditMode(false);
        fetchDashboardData();
        alert('Profile details updated successfully.');
      } else {
        alert('Failed to update profile.');
      }
    } catch (err) {
      console.error('Error updating advocate profile:', err);
    }
  };

  const handleAddCase = async (e) => {
    e.preventDefault();
    if (!newCaseTitle || !newCaseDesc || !newCaseResult || !newCaseYear) {
      alert('Please fill out all case fields.');
      return;
    }

    setAddingCase(true);
    try {
      const res = await fetch(`${API_BASE}/dashboard/advocate/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newCaseTitle,
          description: newCaseDesc,
          result: newCaseResult,
          case_year: newCaseYear
        })
      });

      if (res.ok) {
        setNewCaseTitle('');
        setNewCaseDesc('');
        setNewCaseResult('Won');
        setNewCaseYear(new Date().getFullYear());
        fetchDashboardData();
        alert('Case study added to your portfolio.');
      } else {
        alert('Failed to save case study.');
      }
    } catch (err) {
      console.error('Error adding case study:', err);
    } finally {
      setAddingCase(false);
    }
  };

  const handleDeleteCase = async (caseId) => {
    if (!confirm('Are you sure you want to remove this case study from your portfolio?')) return;

    try {
      const res = await fetch(`${API_BASE}/dashboard/advocate/cases/${caseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchDashboardData();
      } else {
        alert('Failed to delete case study.');
      }
    } catch (err) {
      console.error('Error deleting case:', err);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px' }}>
        <div className="loading-pulse"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Welcome, {profile?.full_name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage your public listing, edit case portfolios, and view inbound client inquiries.</p>
        </div>

        <div>
          {profile?.status === 'verified' ? (
            <div className="badge badge-success" style={{ padding: '8px 16px', gap: '6px' }}>
              <ShieldCheck size={16} /> Verified Profile
            </div>
          ) : profile?.status === 'rejected' ? (
            <div className="badge badge-error" style={{ padding: '8px 16px', gap: '6px' }}>
              <ShieldAlert size={16} /> Verification Suspended
            </div>
          ) : (
            <div className="badge badge-pending" style={{ padding: '8px 16px', gap: '6px' }}>
              <ShieldAlert size={16} /> Verification Pending Review
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: Edit or View Profile */}
        <div>
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--gold-hairline)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>My Profile Details</h3>
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit2 size={12} /> Edit
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleProfileSave}>
                <div className="form-group">
                  <label className="form-label">Profile Image URL</label>
                  <input 
                    type="url" 
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    className="form-input" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Specialty Practice Area</label>
                  <select 
                    value={specialty} 
                    onChange={(e) => setSpecialty(e.target.value)} 
                    className="form-select"
                  >
                    <option value="Criminal">Criminal</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Family">Family</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Civil">Civil</option>
                    <option value="Intellectual Property">Intellectual Property</option>
                    <option value="Tax">Tax</option>
                    <option value="Cyber">Cyber</option>
                    <option value="Estate Planning">Estate Planning</option>
                    <option value="Worker's Compensation">Worker's Compensation</option>
                    <option value="Public Interest">Public Interest</option>
                    <option value="Merger and Acquisition">Merger and Acquisition</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input 
                    type="number" 
                    value={experience} 
                    onChange={(e) => setExperience(e.target.value)} 
                    className="form-input" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Court of Practice</label>
                  <input 
                    type="text" 
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                    className="form-input" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input 
                    type="email" 
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="form-input" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Biography Details</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="form-textarea"
                    style={{ minHeight: '100px' }}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Litigation Strategy & Theory Philosophy</label>
                  <textarea 
                    value={caseTheory}
                    onChange={(e) => setCaseTheory(e.target.value)}
                    placeholder="Describe your case preparation strategy, philosophy, or advocacy theory approaches..."
                    className="form-textarea"
                    style={{ minHeight: '100px' }}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="button" onClick={() => setEditMode(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Save size={14} /> Save Profile
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
                  <img 
                    src={profile?.profile_image} 
                    alt={profile?.full_name} 
                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold-hairline)', marginBottom: '14px' }} 
                  />
                  <h4>{profile?.full_name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bar License No: {profile?.bar_number}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-muted)' }}>Specialty Practice</strong>
                    <span>{profile?.specialty}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-muted)' }}>Court of Practice</strong>
                    <span>{profile?.court}</span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-muted)' }}>Litigation Philosophy</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                      {profile?.case_theory_approach || 'No litigation strategy/theory detailed yet.'}
                    </p>
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-muted)' }}>Biography</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'pre-line' }}>{profile?.bio || 'No biography details.'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Section Tab Selector (Leads or Cases manager) */}
        <div>
          {/* Section Selector */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--gold-hairline)', paddingBottom: '12px', marginBottom: '24px' }}>
            <button
              onClick={() => setDashboardTab('leads')}
              className="btn btn-sm"
              style={{
                backgroundColor: dashboardTab === 'leads' ? 'rgba(197, 168, 128, 0.15)' : 'transparent',
                borderColor: dashboardTab === 'leads' ? 'var(--gold-primary)' : 'transparent',
                color: dashboardTab === 'leads' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              <FileText size={12} /> Client Inquiries ({messages.length})
            </button>
            <button
              onClick={() => setDashboardTab('cases')}
              className="btn btn-sm"
              style={{
                backgroundColor: dashboardTab === 'cases' ? 'rgba(197, 168, 128, 0.15)' : 'transparent',
                borderColor: dashboardTab === 'cases' ? 'var(--gold-primary)' : 'transparent',
                color: dashboardTab === 'cases' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              <FolderOpen size={12} /> Portfolio Cases ({cases.length})
            </button>
          </div>

          {dashboardTab === 'leads' ? (
            /* TAB 1: CLIENT LEADS LIST */
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '18px' }}>Inbound Customer Messages</h3>
              
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <p>No client inquiries received yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {messages.map((msg) => (
                    <div key={msg.id} style={{ 
                      border: '1px solid var(--gold-hairline)', 
                      borderRadius: '6px', 
                      padding: '16px', 
                      background: 'rgba(255, 255, 255, 0.01)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '0.875rem' }}>{msg.sender_name}</strong>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {msg.sender_email}</span>
                        {msg.sender_phone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> {msg.sender_phone}</span>}
                      </div>

                      <p style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-line' }}>
                        {msg.message_text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: PORTFOLIO CASES MANAGER */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Form to add a new Case study */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} className="text-gold" /> Add Case Study Representation
                </h3>
                
                <form onSubmit={handleAddCase}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label">Case Title *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. State of Maharashtra vs. RK Industries"
                      value={newCaseTitle}
                      onChange={(e) => setNewCaseTitle(e.target.value)}
                      className="form-input" 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label">Case Brief / Representation Summary *</label>
                    <textarea 
                      required
                      placeholder="Explain what the dispute was about, the specific charges/arguments, and how you secured your client's interests..."
                      value={newCaseDesc}
                      onChange={(e) => setNewCaseDesc(e.target.value)}
                      className="form-textarea"
                      style={{ minHeight: '80px' }}
                    ></textarea>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Case Result *</label>
                      <select 
                        required
                        value={newCaseResult}
                        onChange={(e) => setNewCaseResult(e.target.value)}
                        className="form-select"
                      >
                        <option value="Won">Won</option>
                        <option value="Settled">Settled</option>
                        <option value="Dismissed">Dismissed</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Case Year *</label>
                      <input 
                        type="number" 
                        required
                        min="1950"
                        max={new Date().getFullYear()}
                        value={newCaseYear}
                        onChange={(e) => setNewCaseYear(e.target.value)}
                        className="form-input" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={addingCase}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', height: '36px' }}
                  >
                    {addingCase ? 'Adding...' : 'Add to Portfolio'}
                  </button>
                </form>
              </div>

              {/* List of current cases */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Current Case Portfolio</h3>
                
                {cases.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No case studies in your listing directory.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {cases.map((c) => (
                      <div key={c.id} style={{ 
                        border: '1px solid var(--gold-hairline)', 
                        borderRadius: '6px', 
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        gap: '12px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            <strong style={{ fontSize: '0.9rem' }}>{c.title}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({c.case_year})</span>
                            <span className={`badge ${
                              c.result === 'Won' ? 'badge-success' : 
                              c.result === 'Settled' ? 'badge-gold' : 
                              c.result === 'Pending' ? 'badge-pending' : 'badge-error'
                            }`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                              {c.result}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{c.description}</p>
                        </div>
                        
                        <button 
                          onClick={() => handleDeleteCase(c.id)} 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px', borderColor: 'transparent', color: 'var(--error)' }}
                          title="Delete Case"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// --- ADMIN DASHBOARD COMPONENT ---
function AdminDashboard({ token, logout }) {
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllAdvocates = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/advocates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAdvocates(data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdvocates();
  }, [token]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/admin/advocates/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        fetchAllAdvocates();
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error('Error changing status:', err);
    }
  };

  const pendingCount = advocates.filter(a => a.status === 'pending').length;

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px' }}>
        <div className="loading-pulse"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Administrator Console</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Review pending registration requests and moderate verification badges.</p>
        </div>

        {pendingCount > 0 && (
          <div className="badge badge-pending" style={{ padding: '8px 16px', gap: '6px', fontSize: '0.85rem' }}>
            {pendingCount} Pending Approvals
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--gold-hairline)', paddingBottom: '12px' }}>
          Registered Advocate Directory
        </h3>

        {advocates.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No advocates registered on the system yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gold-hairline)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 8px' }}>Advocate</th>
                  <th style={{ padding: '12px 8px' }}>Bar Registration</th>
                  <th style={{ padding: '12px 8px' }}>Practice Specialty</th>
                  <th style={{ padding: '12px 8px' }}>Status</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {advocates.map((adv) => (
                  <tr key={adv.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', fontSize: '0.875rem' }}>
                    <td style={{ padding: '16px 8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={adv.profile_image} 
                        alt={adv.full_name} 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold-hairline)' }} 
                      />
                      <div>
                        <strong style={{ display: 'block' }}>{adv.full_name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{adv.court}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 8px', fontFamily: 'monospace', fontSize: '0.8rem' }}>{adv.bar_number}</td>
                    <td style={{ padding: '16px 8px' }}>{adv.specialty}</td>
                    <td style={{ padding: '16px 8px' }}>
                      {adv.status === 'verified' ? (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>Verified</span>
                      ) : adv.status === 'rejected' ? (
                        <span className="badge badge-error" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>Rejected</span>
                      ) : (
                        <span className="badge badge-pending" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>Pending Review</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                      {adv.status !== 'verified' ? (
                        <button 
                          onClick={() => handleStatusUpdate(adv.id, 'verified')} 
                          className="btn btn-primary btn-sm"
                          style={{ marginRight: '8px', padding: '4px 10px', height: '28px', gap: '4px' }}
                        >
                          <Check size={12} /> Approve
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleStatusUpdate(adv.id, 'rejected')} 
                          className="btn btn-secondary btn-sm"
                          style={{ marginRight: '8px', padding: '4px 10px', height: '28px', gap: '4px', borderColor: 'var(--error)', color: 'var(--error)' }}
                        >
                          <X size={12} /> Suspend
                        </button>
                      )}
                      
                      {adv.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusUpdate(adv.id, 'rejected')} 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px', height: '28px', gap: '4px', borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                          <X size={12} /> Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

// --- CLIENT DASHBOARD COMPONENT ---
function ClientDashboard({ user, logout }) {
  return (
    <div className="container" style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '480px', padding: '40px', textAlign: 'center' }}>
        <UserCheck size={48} className="text-gold" style={{ marginBottom: '20px' }} />
        <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Client Workstation</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px', lineHeight: '1.5' }}>
          You are signed in as a client ({user.email}). Search our registry database or use the AI Matchmaker to find and message verified legal professionals across India.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/search" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={16} /> Search Directory
          </Link>
          <Link to="/matchmaker" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} className="text-gold" /> AI Matchmaker
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

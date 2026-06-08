import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Scale, X, ShieldCheck, Briefcase } from 'lucide-react';
import { API_BASE } from '../App';

const specialties = [
  'Criminal', 'Environmental', 'Family', 'Corporate', 'Civil', 
  'Intellectual Property', 'Tax', 'Cyber', 'Estate Planning', 
  'Worker\'s Compensation', 'Public Interest', 'Merger and Acquisition'
];

const states = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Rajasthan', 'Gujarat', 'West Bengal'
];

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSpecialty = searchParams.get('specialty') || '';

  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');

  // Fetch filtered advocates from Express API
  const fetchAdvocates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (specialty) params.append('specialty', specialty);
      if (state) params.append('state', state);
      if (district) params.append('district', district);

      const res = await fetch(`${API_BASE}/advocates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAdvocates(data);
      } else {
        console.error('Error response from server');
      }
    } catch (err) {
      console.error('Error fetching advocates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on filter changes
  useEffect(() => {
    fetchAdvocates();
  }, [query, specialty, state, district]);

  // Handle homepage redirects (when URL parameter changes)
  useEffect(() => {
    const urlSpecialty = searchParams.get('specialty') || '';
    if (urlSpecialty !== specialty) {
      setSpecialty(urlSpecialty);
    }
  }, [searchParams]);

  const clearFilters = () => {
    setQuery('');
    setSpecialty('');
    setState('');
    setDistrict('');
    setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Find an advocate</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Filter by location, court, and practice area.</p>

      {/* Filter Bar Panel */}
      <div className="card" style={{ 
        padding: '24px', 
        marginBottom: '40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        alignItems: 'center'
      }}>
        {/* Name / Keyword Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)' 
          }} />
          <input 
            type="text" 
            placeholder="Search name or court" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-input" 
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Specialty Select */}
        <select 
          value={specialty} 
          onChange={(e) => {
            setSpecialty(e.target.value);
            setSearchParams(e.target.value ? { specialty: e.target.value } : {});
          }}
          className="form-select"
        >
          <option value="">All Specialties</option>
          {specialties.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>

        {/* State Select */}
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="form-select"
        >
          <option value="">All States</option>
          {states.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* District Input */}
        <input 
          type="text" 
          placeholder="District" 
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="form-input"
        />

        {/* Clear Filters Button */}
        {(query || specialty || state || district) && (
          <button 
            onClick={clearFilters} 
            className="btn btn-secondary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px',
              height: '42px'
            }}
          >
            <X size={14} /> Clear filters
          </button>
        )}
      </div>

      {/* Directory Results */}
      {loading ? (
        <div className="loading-pulse"></div>
      ) : advocates.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 24px', 
          border: '1px dashed var(--gold-hairline)',
          borderRadius: '8px',
          color: 'var(--text-secondary)'
        }}>
          <Scale size={48} className="text-gold" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No verified advocates found</h3>
          <p style={{ fontSize: '0.875rem' }}>Try clearing filters or search for another region.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {advocates.map((adv) => (
            <div key={adv.id} className="card" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'between',
              height: '100%'
            }}>
              <div>
                {/* Header Profile Photo & Name */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '18px' }}>
                  <img 
                    src={adv.profile_image} 
                    alt={adv.full_name} 
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      border: '1px solid var(--gold-hairline)'
                    }} 
                  />
                  <div>
                    <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {adv.full_name}
                      <ShieldCheck size={16} className="text-gold-solid" title="Verified Advocate" />
                    </h3>
                    <div className="badge badge-gold" style={{ marginTop: '4px', fontSize: '0.7rem', padding: '2px 8px' }}>
                      {adv.specialty}
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase size={14} className="text-gold" />
                    <span>{adv.experience_years} Years Experience</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Scale size={14} className="text-gold" />
                    <span>{adv.court}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} className="text-gold" />
                    <span>{adv.district}, {adv.state}</span>
                  </div>
                </div>

                <p style={{ 
                  fontSize: '0.825rem', 
                  color: 'var(--text-muted)',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '20px',
                  lineHeight: '1.5'
                }}>
                  {adv.bio}
                </p>
              </div>

              <Link to={`/advocate/${adv.id}`} className="btn btn-secondary btn-sm" style={{ textAlign: 'center', marginTop: 'auto' }}>
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchPage;

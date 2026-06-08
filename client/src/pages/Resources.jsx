import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Scale, ShieldCheck, ChevronDown, ChevronUp, Landmark } from 'lucide-react';
import { API_BASE } from '../App';

function Resources() {
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' or 'constitution'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tab 1: Daily Rules State
  const [articles, setArticles] = useState([]);
  const [selectedRuleCategory, setSelectedRuleCategory] = useState('');
  const [expandedArticleId, setExpandedArticleId] = useState(null);

  // Tab 2: Constitution State
  const [constArticles, setConstArticles] = useState([]);
  const [selectedConstCategory, setSelectedConstCategory] = useState('');

  const [loading, setLoading] = useState(true);

  // Fetch Articles
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedRuleCategory) params.append('category', selectedRuleCategory);

      const res = await fetch(`${API_BASE}/articles?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Constitution Articles
  const fetchConstitution = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedConstCategory) params.append('category', selectedConstCategory);

      const res = await fetch(`${API_BASE}/constitution?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setConstArticles(data);
      }
    } catch (err) {
      console.error('Error fetching constitution:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'rules') {
      fetchArticles();
    } else {
      fetchConstitution();
    }
  }, [activeTab, searchQuery, selectedRuleCategory, selectedConstCategory]);

  const toggleExpandArticle = (id) => {
    setExpandedArticleId(expandedArticleId === id ? null : id);
  };

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      
      {/* Header Resource Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Legal Help & Constitution Hub</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
          Browse simplified summaries of your fundamental constitutional rights and find practical guidelines for legal encounters in daily life.
        </p>
      </div>

      {/* Tabs Selector Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '12px', 
        marginBottom: '32px',
        borderBottom: '1px solid var(--gold-hairline)',
        paddingBottom: '16px'
      }}>
        <button
          onClick={() => {
            setActiveTab('rules');
            setSearchQuery('');
            setSelectedConstCategory('');
          }}
          className="btn"
          style={{
            backgroundColor: activeTab === 'rules' ? 'var(--gold-primary)' : 'transparent',
            color: activeTab === 'rules' ? '#070707' : 'var(--text-secondary)',
            borderColor: activeTab === 'rules' ? 'var(--gold-primary)' : 'var(--gold-hairline)',
            borderStyle: 'solid',
            borderWidth: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BookOpen size={16} /> Daily Life Rules & Rights
        </button>
        <button
          onClick={() => {
            setActiveTab('constitution');
            setSearchQuery('');
            setSelectedRuleCategory('');
          }}
          className="btn"
          style={{
            backgroundColor: activeTab === 'constitution' ? 'var(--gold-primary)' : 'transparent',
            color: activeTab === 'constitution' ? '#070707' : 'var(--text-secondary)',
            borderColor: activeTab === 'constitution' ? 'var(--gold-primary)' : 'var(--gold-hairline)',
            borderStyle: 'solid',
            borderWidth: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Landmark size={16} /> Simplified Indian Constitution
        </button>
      </div>

      {/* Search and Category Filter Section */}
      <div className="card" style={{ 
        padding: '20px', 
        marginBottom: '32px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)' 
          }} />
          <input 
            type="text" 
            placeholder={activeTab === 'rules' ? "Search rules (e.g. traffic, tenant)" : "Search constitution (e.g. Article 21, speech)"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input" 
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Categories Pills */}
        {activeTab === 'rules' ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['All', 'Daily Life Rules', 'Citizen Rights', 'Legal Guide'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedRuleCategory(cat === 'All' ? '' : cat)}
                className="btn btn-sm"
                style={{
                  backgroundColor: (selectedRuleCategory === cat || (cat === 'All' && !selectedRuleCategory)) ? 'rgba(197, 168, 128, 0.15)' : 'transparent',
                  borderColor: (selectedRuleCategory === cat || (cat === 'All' && !selectedRuleCategory)) ? 'var(--gold-primary)' : 'var(--gold-hairline)',
                  color: (selectedRuleCategory === cat || (cat === 'All' && !selectedRuleCategory)) ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderStyle: 'solid',
                  borderWidth: '1px'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['All', 'Fundamental Rights', 'Duties', 'Directive Principles'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedConstCategory(cat === 'All' ? '' : cat)}
                className="btn btn-sm"
                style={{
                  backgroundColor: (selectedConstCategory === cat || (cat === 'All' && !selectedConstCategory)) ? 'rgba(197, 168, 128, 0.15)' : 'transparent',
                  borderColor: (selectedConstCategory === cat || (cat === 'All' && !selectedConstCategory)) ? 'var(--gold-primary)' : 'var(--gold-hairline)',
                  color: (selectedConstCategory === cat || (cat === 'All' && !selectedConstCategory)) ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderStyle: 'solid',
                  borderWidth: '1px'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Results Listing */}
      {loading ? (
        <div className="loading-pulse"></div>
      ) : activeTab === 'rules' ? (
        /* TAB 1: DAILY RULES (ACCORDIONS) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No guidelines matching your search were found.
            </div>
          ) : (
            articles.map((art) => {
              const isExpanded = expandedArticleId === art.id;
              return (
                <div key={art.id} className="card" style={{ 
                  padding: '20px 24px', 
                  cursor: 'pointer',
                  borderLeft: isExpanded ? '3px solid var(--gold-primary)' : '1px solid var(--gold-hairline)',
                  transition: 'var(--transition-smooth)'
                }}
                onClick={() => toggleExpandArticle(art.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className="badge badge-gold" style={{ fontSize: '0.65rem', marginBottom: '8px', padding: '2px 6px' }}>
                        {art.category}
                      </span>
                      <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>{art.title}</h3>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp size={20} className="text-gold" /> : <ChevronDown size={20} className="text-muted" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div 
                      style={{ 
                        marginTop: '20px', 
                        paddingTop: '20px', 
                        borderTop: '1px solid var(--gold-hairline)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.925rem',
                        lineHeight: '1.7',
                        whiteSpace: 'pre-line'
                      }}
                      onClick={(e) => e.stopPropagation()} // Stop accordion toggling when selecting text
                    >
                      {art.content}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* TAB 2: SIMPLIFIED CONSTITUTION (CARDS GRID) */
        <div>
          {constArticles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No constitutional articles matching your search were found.
            </div>
          ) : (
            <div className="cards-grid">
              {constArticles.map((item) => (
                <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <span className="badge badge-gold" style={{ alignSelf: 'flex-start', fontSize: '0.65rem', marginBottom: '12px' }}>
                    {item.category}
                  </span>
                  
                  <h4 style={{ 
                    fontSize: '1.4rem', 
                    fontFamily: 'var(--font-display)', 
                    color: 'var(--gold-primary)', 
                    fontWeight: 'bold',
                    marginBottom: '4px' 
                  }}>
                    {item.article_number}
                  </h4>
                  <h3 style={{ 
                    fontSize: '1.05rem', 
                    fontFamily: 'var(--font-sans)', 
                    fontWeight: '600', 
                    marginBottom: '14px' 
                  }}>
                    {item.title}
                  </h3>
                  
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-secondary)', 
                    lineHeight: '1.6', 
                    marginTop: 'auto' 
                  }}>
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Resources;

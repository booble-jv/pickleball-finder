import React, { useState, useEffect } from 'react';
import SearchSection from './components/SearchSection';
import CustomTitleBar from './components/CustomTitleBar';
import { geocodeLocation } from './services/geocode';
import { fetchCourtsByLatLon, Court } from './services/osmCourts';

export type TabType = 'courts' | 'players' | 'events';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('courts');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('pf-theme');
    return stored === 'dark' ? 'dark' : 'light';
  });
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('pf-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Fetch version from main via preload (if available)
    (async () => {
      try {
        if (window.electronAPI?.getAppVersion) {
          const v = await window.electronAPI.getAppVersion();
            setAppVersion(v);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    // Attach theme toggle button logic (simple query: theme-toggle-btn) since button lives in title bar
    const btn = document.querySelector('.theme-toggle-btn');
    if (!btn) return;
    const onClick = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));
    btn.addEventListener('click', onClick);
    return () => btn.removeEventListener('click', onClick);
  }, []);

  console.log('🚀 App component is rendering!');
  console.log('ActiveTab:', activeTab);

  const handleSearch = async (location: string) => {
    setSearchQuery(location);
    setError(null);
    setLoading(true);
    setCourts([]);
    const controller = new AbortController();
    try {
      const geo = await geocodeLocation(location, controller.signal);
      if (!geo) {
        setError('Location not found. Try a city name or ZIP code.');
        return;
      }
      const results = await fetchCourtsByLatLon(geo.lat, geo.lon, 20000, controller.signal);
      setCourts(results);
      if (results.length === 0) {
        setError('No courts found within 20km. Try another location or widen your search.');
      }
    } catch (e: unknown) {
      if (typeof e === 'object' && e && 'name' in e && (e as { name?: string }).name === 'AbortError') return;
      const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message?: unknown }).message) : 'Search failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <>
      <CustomTitleBar />
  <div className="app-container" data-theme-current={theme}>
      <header className="app-header">
        <h1>🏓 Pickleball Finder</h1>
        <p className="subtitle">Find and connect with pickleball players and courts in your area</p>
      </header>

      <main className="main-content">
        <SearchSection onSearch={handleSearch} />

        <div className="results-section">
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'courts' ? 'active' : ''}`}
              onClick={() => handleTabClick('courts')}
            >
              Courts
            </button>
            <button 
              className={`tab-btn ${activeTab === 'players' ? 'active' : ''}`}
              onClick={() => handleTabClick('players')}
            >
              Players
            </button>
            <button 
              className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => handleTabClick('events')}
            >
              Events
            </button>
          </div>

          <div className="tab-content">
            {searchQuery && (
              <div className="search-results">
                <p>Results for: <strong>{searchQuery}</strong></p>
              </div>
            )}
            {loading && <p>Loading courts…</p>}
            {error && <p className="error-text">{error}</p>}
            
            <div className={`tab-pane ${activeTab === 'courts' ? 'active' : ''}`}>
              <div className="card-grid">
                {courts.map(c => {
                  const [, osmType, osmId] = c.id.split('-');
                  const osmUrl = `https://www.openstreetmap.org/${osmType}/${osmId}`;
                  return (
                    <div className="card" key={c.id}>
                      <h3>{c.displayName}</h3>
                      <p className="location">📍 {c.address || `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}`}</p>
                      <p className="details">
                        {c.surface ? `${c.surface} surface` : 'Surface: n/a'}
                        {c.lighting ? ' • Lit' : ''}
                        {c.covered ? ' • Covered' : ''}
                      </p>
                      <div className="rating">Source: OSM</div>
                      <button className="btn btn-secondary" onClick={() => window.open(osmUrl, '_blank')}>View on OSM</button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`tab-pane ${activeTab === 'players' ? 'active' : ''}`}>
              <div className="card-grid">
                <div className="card">
                  <h3>Alex Johnson</h3>
                  <p className="skill-level">🏅 Intermediate Player</p>
                  <p className="location">📍 2 miles away</p>
                  <p className="availability">Available: Weekends</p>
                  <button className="btn btn-secondary">Connect</button>
                </div>
                <div className="card">
                  <h3>Sarah Miller</h3>
                  <p className="skill-level">🏅 Advanced Player</p>
                  <p className="location">📍 1.5 miles away</p>
                  <p className="availability">Available: Evenings</p>
                  <button className="btn btn-secondary">Connect</button>
                </div>
              </div>
            </div>

            <div className={`tab-pane ${activeTab === 'events' ? 'active' : ''}`}>
              <div className="card-grid">
                <div className="card">
                  <h3>Weekend Tournament</h3>
                  <p className="date">📅 Saturday, Oct 15th</p>
                  <p className="location">📍 Riverside Park</p>
                  <p className="participants">👥 12/16 players</p>
                  <button className="btn btn-primary">Join Event</button>
                </div>
                <div className="card">
                  <h3>Beginner Meetup</h3>
                  <p className="date">📅 Sunday, Oct 16th</p>
                  <p className="location">📍 Community Center</p>
                  <p className="participants">👥 8/12 players</p>
                  <button className="btn btn-primary">Join Event</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-actions">
          <button className="btn btn-outline">Add Court</button>
          <button className="btn btn-outline">Create Event</button>
          <button className="btn btn-outline">Settings</button>
        </div>
        <div className="app-info">
          <span>Version {appVersion || '—'}</span>
          <span style={{ marginLeft: '1rem', fontSize: '0.75rem' }}>Data: © OpenStreetMap contributors</span>
          <button
            className="btn btn-outline"
            style={{ marginLeft: '1rem' }}
            onClick={() => window.open('https://www.openstreetmap.org/copyright', '_blank')}
          >Attribution</button>
        </div>
      </footer>
    </div>
    </>
  );
};

export default App;
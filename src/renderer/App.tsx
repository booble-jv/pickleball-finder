import React, { useState, useEffect } from 'react';
import SearchSection from './components/SearchSection';
import CustomTitleBar from './components/CustomTitleBar';

export type TabType = 'courts' | 'players' | 'events';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('courts');
  const [searchResults, setSearchResults] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('pf-theme');
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('pf-theme', theme);
  }, [theme]);

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

  const handleSearch = (location: string) => {
    console.log('Searching for:', location);
    setSearchResults(`Searching for pickleball courts and players in: ${location}`);
    // Here you would typically make an API call to fetch real data
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
            {searchResults && (
              <div className="search-results">
                <p>{searchResults}</p>
              </div>
            )}
            
            <div className={`tab-pane ${activeTab === 'courts' ? 'active' : ''}`}>
              <div className="card-grid">
                <div className="card">
                  <h3>Riverside Park Courts</h3>
                  <p className="location">📍 123 Park Ave, Downtown</p>
                  <p className="details">4 courts • Outdoor • Free</p>
                  <div className="rating">⭐⭐⭐⭐⭐ (4.8)</div>
                  <button className="btn btn-secondary">View Details</button>
                </div>
                <div className="card">
                  <h3>Community Center</h3>
                  <p className="location">📍 456 Main St, Midtown</p>
                  <p className="details">2 courts • Indoor • $10/hour</p>
                  <div className="rating">⭐⭐⭐⭐ (4.2)</div>
                  <button className="btn btn-secondary">View Details</button>
                </div>
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
          <span>Version 1.0.0</span>
        </div>
      </footer>
    </div>
    </>
  );
};

export default App;
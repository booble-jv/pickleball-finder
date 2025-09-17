import React, { useState, useEffect } from 'react';

const CustomTitleBar: React.FC = () => {
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Check if we're in dev mode
    const checkDevMode = async () => {
      if (window.electronAPI && window.electronAPI.isDevMode) {
        try {
          const devMode = await window.electronAPI.isDevMode();
          setIsDevMode(devMode);
        } catch (error) {
          console.log('Could not get dev mode status:', error);
        }
      }
    };

    checkDevMode();
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.windowControl('minimize');
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.windowControl('maximize');
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.windowControl('close');
    }
  };

  useEffect(() => {
    const el = document.querySelector('.custom-title-bar');
    if (el) {
      const style = getComputedStyle(el);
      if (style.position !== 'fixed') {
        console.warn('[TitleBar] position changed to', style.position, '— reapplying fixed');
        (el as HTMLElement).style.position = 'fixed';
        (el as HTMLElement).style.top = '0';
        (el as HTMLElement).style.left = '0';
        (el as HTMLElement).style.right = '0';
        (el as HTMLElement).style.zIndex = '1000';
      }
      // Re-check after a tick (HMR or late styles)
      setTimeout(() => {
        const style2 = getComputedStyle(el);
        if (style2.position !== 'fixed') {
          console.error('[TitleBar] Still not fixed after reapply. Current:', style2.position);
        }
      }, 50);
    }
  }, []);

  return (
    <div className="custom-title-bar" data-theme-switcher-root style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      <div className="title-bar-content">
        <div className="app-icon" aria-label="App icon">🏓</div>
        <div className="app-title" aria-label="Application title">
          <span>Pickleball Finder</span>
          {isDevMode && <span className="dev-indicator" aria-label="Development mode">• DEV</span>}
        </div>
      </div>
      <div className="title-bar-spacer" />
      <div className="title-bar-actions" role="toolbar" aria-label="Window and theme controls">
        <button className="theme-toggle-btn" title="Toggle theme" aria-label="Toggle theme">
          <span className="theme-toggle-icon" />
        </button>
        <div className="window-controls">
          <button className="window-control-btn minimize-btn" onClick={handleMinimize} title="Minimize" aria-label="Minimize window">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <rect x="1" y="5" width="10" height="2" fill="currentColor"/>
            </svg>
          </button>
          <button className="window-control-btn maximize-btn" onClick={handleMaximize} title="Maximize" aria-label="Maximize or restore window">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <rect x="1" y="1" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </button>
          <button className="window-control-btn close-btn" onClick={handleClose} title="Close" aria-label="Close window">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomTitleBar;
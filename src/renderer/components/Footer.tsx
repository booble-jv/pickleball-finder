import React from 'react';

interface FooterProps {
  appVersion: string;
}

const Footer: React.FC<FooterProps> = ({ appVersion }) => {
  const handleAddCourt = () => {
    console.log('Add court clicked');
    // TODO: Implement add court functionality
  };

  const handleCreateEvent = () => {
    console.log('Create event clicked');
    // TODO: Implement create event functionality
  };

  const handleSettings = async () => {
    if (window.electronAPI) {
      await window.electronAPI.showMessageBox({
        type: 'info',
        title: 'Settings',
        message: 'Settings',
        detail: 'Settings functionality coming soon!'
      });
    }
  };

  return (
    <footer className="app-footer">
      <div className="footer-actions">
        <button 
          className="btn btn-outline" 
          onClick={handleAddCourt}
        >
          Add Court
        </button>
        <button 
          className="btn btn-outline" 
          onClick={handleCreateEvent}
        >
          Create Event
        </button>
        <button 
          className="btn btn-outline" 
          onClick={handleSettings}
        >
          Settings
        </button>
      </div>
      <div className="app-info">
        <span>Version {appVersion}</span>
      </div>
    </footer>
  );
};

export default Footer;
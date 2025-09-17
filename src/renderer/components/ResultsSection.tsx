import React from 'react';
import { TabType } from '../App';

// Type definitions
export interface Court {
  id: string;
  name: string;
  location: string;
  details: string;
  rating: number;
  type: 'indoor' | 'outdoor';
  price: string;
}

export interface Player {
  id: string;
  name: string;
  skillLevel: string;
  location: string;
  availability: string;
  distance: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  participants: string;
  maxParticipants: number;
  currentParticipants: number;
}

interface ResultsSectionProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchLocation: string;
}

// Sample data
const sampleCourts: Court[] = [
  {
    id: '1',
    name: 'Riverside Park Courts',
    location: '📍 123 Park Ave, Downtown',
    details: '4 courts • Outdoor • Free',
    rating: 4.8,
    type: 'outdoor',
    price: 'Free'
  },
  {
    id: '2',
    name: 'Community Center',
    location: '📍 456 Main St, Midtown',
    details: '2 courts • Indoor • $10/hour',
    rating: 4.2,
    type: 'indoor',
    price: '$10/hour'
  }
];

const samplePlayers: Player[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    skillLevel: '🏅 Intermediate Player',
    location: '📍 2 miles away',
    availability: 'Available: Weekends',
    distance: '2 miles'
  },
  {
    id: '2',
    name: 'Sarah Miller',
    skillLevel: '🏅 Advanced Player',
    location: '📍 1.5 miles away',
    availability: 'Available: Evenings',
    distance: '1.5 miles'
  }
];

const sampleEvents: Event[] = [
  {
    id: '1',
    name: 'Weekend Tournament',
    date: '📅 Saturday, Oct 15th',
    location: '📍 Riverside Park',
    participants: '👥 12/16 players',
    maxParticipants: 16,
    currentParticipants: 12
  },
  {
    id: '2',
    name: 'Beginner Meetup',
    date: '📅 Sunday, Oct 16th',
    location: '📍 Community Center',
    participants: '👥 8/12 players',
    maxParticipants: 12,
    currentParticipants: 8
  }
];

const ResultsSection: React.FC<ResultsSectionProps> = ({ 
  activeTab, 
  onTabChange, 
  searchLocation 
}) => {
  const handleTabClick = (tab: TabType) => {
    onTabChange(tab);
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + ` (${rating})`;
  };

  return (
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
        {activeTab === 'courts' && (
          <div className="tab-pane active">
            <div className="card-grid">
              {sampleCourts.map((court) => (
                <div key={court.id} className="card">
                  <h3>{court.name}</h3>
                  <p className="location">{court.location}</p>
                  <p className="details">{court.details}</p>
                  <div className="rating">{renderStars(court.rating)}</div>
                  <button className="btn btn-secondary">View Details</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="tab-pane active">
            <div className="card-grid">
              {samplePlayers.map((player) => (
                <div key={player.id} className="card">
                  <h3>{player.name}</h3>
                  <p className="skill-level">{player.skillLevel}</p>
                  <p className="location">{player.location}</p>
                  <p className="availability">{player.availability}</p>
                  <button className="btn btn-secondary">Connect</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="tab-pane active">
            <div className="card-grid">
              {sampleEvents.map((event) => (
                <div key={event.id} className="card">
                  <h3>{event.name}</h3>
                  <p className="date">{event.date}</p>
                  <p className="location">{event.location}</p>
                  <p className="participants">{event.participants}</p>
                  <button className="btn btn-primary">Join Event</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsSection;
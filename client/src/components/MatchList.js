import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './MatchList.css';

function MatchList({ language }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, live, scheduled, completed

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/matches');
      setMatches(response.data);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches. Is the backend running and reachable?');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMatches = () => {
    let filtered = filter === 'all' ? matches : matches.filter(m => m.status === filter);
    
    // Sort with Ashes match first, then others
    filtered.sort((a, b) => {
      // Ashes match (England vs Australia) always goes first
      const isAshesA = (a.team_a === 'England' && b.team_b === 'Australia') || 
                       (a.team_a === 'Australia' && b.team_b === 'England');
      const isAshesB = (b.team_a === 'England' && b.team_b === 'Australia') || 
                       (b.team_a === 'Australia' && b.team_b === 'England');
      
      if (isAshesA && !isAshesB) return -1;
      if (!isAshesA && isAshesB) return 1;
      
      return 0;
    });
    
    return filtered;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'live':
        return 'status-live';
      case 'scheduled':
        return 'status-scheduled';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="match-list-container">
        <h2>Loading matches...</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  const filteredMatches = getFilteredMatches();

  return (
    <div className="match-list-container">
      <h2>🏏 Cricket Matches</h2>

      <div className="filter-buttons">
        {['all', 'live', 'scheduled', 'completed'].map(status => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchMatches} className="btn-primary">Retry</button>
        </div>
      )}

      {filteredMatches.length === 0 ? (
        <div className="no-matches">
          <p>No matches found for the selected filter.</p>
        </div>
      ) : (
        <div className="matches-grid">
          {filteredMatches.map(match => (
            <Link key={match.id} to={`/match/${match.id}`} className="match-card-link">
              <div className="match-card card">
                <div className="match-header">
                  <span className={`status-badge ${getStatusBadgeClass(match.status)}`}>
                    {match.status.toUpperCase()}
                  </span>
                  <span className="format-badge">{match.format}</span>
                </div>

                <div className="match-teams">
                  <div className="team">
                    <span className="team-logo">{match.team_a_logo}</span>
                    <span className="team-name">{match.team_a}</span>
                  </div>
                  <div className="vs-text">vs</div>
                  <div className="team">
                    <span className="team-logo">{match.team_b_logo}</span>
                    <span className="team-name">{match.team_b}</span>
                  </div>
                </div>

                <div className="match-details">
                  <p className="venue">📍 {match.venue}</p>
                  <p className="date">📅 {formatDate(match.date)}</p>
                </div>

                <div className="match-footer">
                  <button className="btn-primary">
                    {match.status === 'live' ? '▶️ Watch Live' : 'View Match'}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatchList;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/Card';
import { getGamesByCategory } from '../../../api/games';

const RoomGames = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const gamesData = await getGamesByCategory('room');
        setGames(gamesData);
      } catch (err) {
        setError('Failed to load games');
        console.error('Error fetching room games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleCardClick = (game) => {
    if (game.route) {
      navigate(game.route);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading games...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          <h2>Room Games</h2>
          <p>No room-based multiplayer games available yet.</p>
          <p>Check back soon for exciting multiplayer experiences!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {games.map((game, idx) => (
        <div key={game._id || idx} onClick={() => handleCardClick(game)} style={{ cursor: game.route ? 'pointer' : 'default' }}>
          <Card {...game} />
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    padding: '0',
    backgroundColor: 'transparent',
  },
  loading: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: 'white',
    fontSize: '18px',
    padding: '40px'
  },
  error: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: '#ff6b6b',
    fontSize: '16px',
    padding: '40px'
  },
  empty: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: 'white',
    padding: '40px'
  }
};

export default RoomGames;

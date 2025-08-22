import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/Card';
import { getGamesByCategory } from '../../../api/games';

const Farming = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const gamesData = await getGamesByCategory('farming');
        setGames(gamesData);
      } catch (err) {
        setError('Failed to load games');
        console.error('Error fetching farming games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleCardClick = (game) => {
    if (game.route) {
      if (game.route === '/games/sudoku') {
        navigate('/games/sudoku-pregame');
      } else {
        navigate(game.route);
      }
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
  }
};

export default Farming;

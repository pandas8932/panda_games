import React, { useState } from 'react';
import Farming from '../type_of_game/Farming/Farming';
import Earning from '../type_of_game/Earning/Earning';
import RoomGames from '../type_of_game/RoomGames/RoomGames';
import './Home.css';

const Home = () => {
  const [selectedGame, setSelectedGame] = useState('farming');
  const [hoveredGame, setHoveredGame] = useState(null); // ✅ track hover

  const renderGameComponent = () => {
    switch (selectedGame) {
      case 'farming':
        return <Farming />;
      case 'earning':
        return <Earning />;
      case 'room':
        return <RoomGames />;
      default:
        return null;
    }
  };

  const getButtonStyle = (game) => {
    const isSelected = selectedGame === game;
    const isHovered = hoveredGame === game;

    return {
      backgroundColor: isSelected
        ? '#3182ce' 
        : isHovered
        ? '#f5222d' 
        : 'transparent',
      color: isSelected || isHovered ? 'white' : '#333',
      border: 'none',
      padding: '12px 24px',
      cursor: 'pointer',
      borderRadius: '30px',
      fontWeight: 'bold',
      fontSize: '30px',
      transition: 'all 0.3s ease',
      fontFamily: 'Kavoon, cursive',
      margin: '0 5px',
      letterSpacing: '4px',
    };
  };

  return (
    <div style={styles.container}>
      {/* Game Tabs in Oval Container */}
      <div style={styles.ovalContainer}>
        {['farming', 'earning', 'room'].map((game) => (
          <button
            key={game}
            style={getButtonStyle(game)}
            onClick={() => setSelectedGame(game)}
            onMouseEnter={() => setHoveredGame(game)}
            onMouseLeave={() => setHoveredGame(null)}
          >
            {game === 'farming' ? 'Farming' : game === 'earning' ? 'Earning' : 'Room Games'}
          </button>
        ))}
      </div>

      {/* Game Content */}
      <div style={styles.gameContent}>{renderGameComponent()}</div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#3182ce',
    minHeight: '100vh',
    width: '100%',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 0,
  },
  ovalContainer: {
    backgroundColor: '#fff',
    borderRadius: '50px',
    padding: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '30px',
    boxShadow: '0 4px 8px rgba(214, 10, 10, 0.1)',
  },
  gameContent: {
    width: '100%',
    maxWidth: '1200px',
    padding: '0',
    backgroundColor: 'transparent',
  },
};

export default Home;

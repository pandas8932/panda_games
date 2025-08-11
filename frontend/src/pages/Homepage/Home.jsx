import React, { useState } from 'react';

import Farming from '../type_of_game/Farming/Farming';
import Earning from '../type_of_game/Earning/Earning';
import RoomGames from '../type_of_game/RoomGames/RoomGames';
import './Home.css';

const Home = () => {
  const [selectedGame, setSelectedGame] = useState('farming');

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

  const getButtonStyle = (game) => ({
    backgroundColor: selectedGame === game ? '#FF6B6B' : 'transparent',
    color: selectedGame === game ? 'white' : '#333',
    border: 'none',
    padding: '12px 24px',
    cursor: 'pointer',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    fontFamily: 'Irish Grover',
    margin: '0 5px',
  });

  return (
    <div style={styles.container}>
      {/* Game Tabs in Oval Container */}
      <div style={styles.ovalContainer}>
        <button style={getButtonStyle('farming')} onClick={() => setSelectedGame('farming')}>
          Farming
        </button>
        <button style={getButtonStyle('earning')} onClick={() => setSelectedGame('earning')}>
          Earning
        </button>
        <button style={getButtonStyle('room')} onClick={() => setSelectedGame('room')}>
          Room Games
        </button>
      </div>

      {/* Game Content */}
      <div style={styles.gameContent}>
        {renderGameComponent()}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#1B5E20', // Dark green background
    minHeight: '100vh',
    width: '100%',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 0,
  },
  ovalContainer: {
    backgroundColor: '#E0E0E0', // Light grey oval container
    borderRadius: '50px',
    padding: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '30px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  gameContent: {
    width: '100%',
    maxWidth: '1200px',
    padding: '0',
    backgroundColor: 'transparent',
  },
};

export default Home;

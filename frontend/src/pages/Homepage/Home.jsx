import React, { useState } from 'react';

import Farming from '../type_of_game/Farming/Farming';
import Earning from '../type_of_game/Earning/Earning';
import RoomGames from '../type_of_game/RoomGames/RoomGames';
import './Home.css'; // Optional

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
    backgroundColor: selectedGame === game ? 'black' : 'white',
    color: selectedGame === game ? 'white' : 'black',
    border: '1px solid black',
    margin: '0 10px',
    padding: '10px 20px',
    cursor: 'pointer',
    borderRadius: '5px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    fontFamily:'Irish Grover',
  });

  return (
    <div>

      <div style={{ 
        marginTop: '50px', 
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px'
      }}>
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
      <div style={{ marginTop: '20px' }}>
        {renderGameComponent()}
      </div>
    </div>
  );
};

export default Home;

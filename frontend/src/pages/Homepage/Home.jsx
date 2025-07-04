import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Farming from '../type_of_game/Farming';
import Earning from '../type_of_game/Earning';
import RoomGames from '../type_of_game/RoomGames';
import './Home.css'; // optional, not required for now

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

  return (
    <div>
      <Navbar />
      <div style={{ marginTop: '50px', textAlign: 'center' }}>
        <button onClick={() => setSelectedGame('farming')}>Farming</button>
        <button onClick={() => setSelectedGame('earning')}>Earning</button>
        <button onClick={() => setSelectedGame('room')}>Room Games</button>
      </div>
      <div style={{ marginTop: '20px' }}>
        {renderGameComponent()}
      </div>
    </div>
  );
};

export default Home;

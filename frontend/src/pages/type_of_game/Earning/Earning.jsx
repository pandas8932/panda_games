import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/Card';

const earningGames = [
  {
    title: 'Dice Game',
    description: 'Throw the dice and test your Luck',
    image: 'https://res.cloudinary.com/diilqdk7o/image/upload/v1755439487/%E0%A4%B8%E0%A4%82%E0%A4%96%E0%A5%8D%E0%A4%AF%E0%A4%BE_%E0%A4%95%E0%A5%87_%E0%A4%98%E0%A5%87%E0%A4%B0%E0%A5%87_uxihgc.png',
    route: '/games/dicegame',
  },
  {
    title: 'Mines',
    description: 'Navigate through mines to earn coins',
    image: 'https://storage.googleapis.com/kickthe/assets/images/games/mines-hacksawgaming/gb/gbp/tile_large.jpg',
    route: '/games/minesgame',
  },
  {
    title: 'More game',
    description: 'More games to be added in the future',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJygaAX3kSc2zVSUp5R4Jn7KK0dMtSQViX3Q&s',
  }
];

const Earning = () => {
  const navigate = useNavigate();

  const handleCardClick = (game) => {
    if (game.route) {
      navigate(game.route);
    }
  };

  return (
    <div style={styles.container}>
      {earningGames.map((game, idx) => (
        <div key={idx} onClick={() => handleCardClick(game)} style={{ cursor: game.route ? 'pointer' : 'default' }}>
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
};

export default Earning;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/Card';

const earningGames = [
  {
    title: 'Dice Game',
    description: 'Throw the dice and test your Luck',
    image: 'https://play-lh.googleusercontent.com/wqSvyBbC4IQlEXpLrqKYEckNfoIwaUK3lasg_zVRJ3T5Ufqgq8y_PlIMKa5V6fWqgvPd',
    route: '/games/dicegame',
  },
  {
    title: 'Mines',
    description: 'Gamble your luck on the 5x5 yard',
    image: 'https://storage.googleapis.com/kickthe/assets/images/games/mines-hacksawgaming/gb/gbp/tile_large.jpg',
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
    padding: '20px',
  },
};

export default Earning;

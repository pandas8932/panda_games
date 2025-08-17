import React from 'react';
import Card from '../../../components/Card';

const farmingGames = [
  {
    title: 'Tic-Tac-Toe',
    description: 'play this simple game to earn coins',
    image: 'https://m.media-amazon.com/images/I/411RqsooQ3L.png',
    
  },
  {
    title: 'Chess Arena',
    description: 'Play with AI, Real world players to earn coins',
    image: 'https://imgs.search.brave.com/zgAaBELdS7bRBNlMoOeNa-vu1Kpvmdk-me0PygQthGE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzIxLzY0/LzUzLzIxNjQ1M2Fm/MGUwYWQ5ZmIyYTVi/NjZjM2EzM2VhYTdk/LmpwZw',
  },{
    title:'More game',
    description:'More games to be added in the future',
    image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJygaAX3kSc2zVSUp5R4Jn7KK0dMtSQViX3Q&s'
  }
];

const Farming = () => {
  return (
    <div style={styles.container}>
      {farmingGames.map((game, idx) => (
        <Card key={idx} {...game} />
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

export default Farming;

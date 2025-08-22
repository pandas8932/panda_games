const mongoose = require('mongoose');
const Game = require('./models/game');
require('dotenv').config();

const games = [
  {
    title: 'Dice Game',
    description: 'Throw the dice and test your Luck',
    image: 'https://res.cloudinary.com/diilqdk7o/image/upload/v1755439487/%E0%A4%B8%E0%A4%82%E0%A4%96%E0%A5%8D%E0%A4%AF%E0%A4%BE_%E0%A4%95%E0%A5%87_%E0%A4%98%E0%A5%87%E0%A4%B0%E0%A5%87_uxihgc.png',
    route: '/games/dicegame',
    category: 'earning',
    minBet: 10,
    maxBet: 1000
  },
  {
    title: 'Mines',
    description: 'Navigate through mines to earn coins',
    image: 'https://storage.googleapis.com/kickthe/assets/images/games/mines-hacksawgaming/gb/gbp/tile_large.jpg',
    route: '/games/minesgame',
    category: 'earning',
    minBet: 10,
    maxBet: 1000
  },
  {
    title: 'Sudoku',
    description: 'Solve logic puzzles to earn coins',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    route: '/games/sudoku',
    category: 'farming',
    minBet: 0,
    maxBet: 0
  },
  {
    title: 'Tic-Tac-Toe',
    description: 'play this simple game to earn coins',
    image: 'https://m.media-amazon.com/images/I/411RqsooQ3L.png',
    route: '/games/tictactoe',
    category: 'farming',
    minBet: 5,
    maxBet: 500
  },
  {
    title: 'Chess Arena',
    description: 'Play with AI, Real world players to earn coins',
    image: 'https://imgs.search.brave.com/zgAaBELdS7bRBNlMoOeNa-vu1Kpvmdk-me0PygQthGE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzIxLzY0/LzUzLzIxNjQ1M2Fm/MGUwYWQ5ZmIyYTVi/NjZjM2EzM2VhYTdk/LmpwZw',
    route: '/games/chess',
    category: 'farming',
    minBet: 20,
    maxBet: 2000
  }
];

const seedGames = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    // Clear existing games
    await Game.deleteMany({});
    console.log('Cleared existing games');

    // Insert new games
    const insertedGames = await Game.insertMany(games);
    console.log(`Inserted ${insertedGames.length} games`);

    console.log('Games seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding games:', error);
    process.exit(1);
  }
};

seedGames();

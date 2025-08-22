import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SudokuPreGame.css';

const SudokuPreGame = () => {
  const [difficulty, setDifficulty] = useState('easy');
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState({
    easy: { completedLevels: 0, totalTime: 0, totalCoins: 0 },
    medium: { completedLevels: 0, totalTime: 0, totalCoins: 0 },
    hard: { completedLevels: 0, totalTime: 0, totalCoins: 0 }
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchProgress();
  }, []);

  // Refresh progress when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchProgress();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    // Set level to next available level when progress changes
    const nextLevel = progress[difficulty].completedLevels + 1;
    if (nextLevel <= 30) {
      setLevel(nextLevel);
    }
  }, [progress, difficulty]);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/sudoku/progress', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleStartGame = () => {
    const nextLevel = progress[difficulty].completedLevels + 1;
    if (nextLevel <= 30) {
      navigate('/games/sudoku', { 
        state: { difficulty, level: nextLevel } 
      });
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const coinRewards = { easy: 10, medium: 20, hard: 30 };

  return (
    <div className="sudoku-pregame">
      <div className="pregame-container">
        {/* Header */}
        <div className="pregame-header">
          <h1 className="game-title">SUDOKU</h1>
          <p className="game-description">
            Sudoku is a logic-based, combinatorial number-placement puzzle. 
            The objective is to fill a 9x9 grid with digits so that each column, 
            each row, and each of the nine 3x3 subgrids contains all of the digits from 1 to 9.
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="difficulty-section">
          <div className="difficulty-indicator">
            <div className="difficulty-dot"></div>
            <span className="difficulty-text">{difficulty.toUpperCase()}</span>
          </div>
          
          <div className="difficulty-slider">
            <input
              type="range"
              min="0"
              max="2"
              value={difficulty === 'easy' ? 0 : difficulty === 'medium' ? 1 : 2}
                             onChange={(e) => {
                 const difficulties = ['easy', 'medium', 'hard'];
                 const newDifficulty = difficulties[e.target.value];
                 setDifficulty(newDifficulty);
                 // Set to next available level for this difficulty
                 const nextLevel = progress[newDifficulty].completedLevels + 1;
                 setLevel(nextLevel <= 30 ? nextLevel : 1);
               }}
              className="slider"
            />
            <p className="slider-text">DRAG TO ADJUST DIFFICULTY</p>
          </div>
        </div>

        {/* Progress Display */}
        <div className="progress-section">
          <div className="progress-card">
            <h3>Progress</h3>
            <div className="progress-stats">
              <div className="stat">
                <span className="stat-label">Completed:</span>
                <span className="stat-value">{progress[difficulty].completedLevels}/30</span>
              </div>
              <div className="stat">
                <span className="stat-label">Next Level:</span>
                <span className="stat-value">{progress[difficulty].completedLevels + 1}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Total Time:</span>
                <span className="stat-value">{formatTime(progress[difficulty].totalTime)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Coins Earned:</span>
                <span className="stat-value">{progress[difficulty].totalCoins}</span>
              </div>
            </div>
          </div>
        </div>



        {/* Action Buttons */}
        <div className="action-buttons">
          <div className="level-navigation">
            <button 
              className="nav-arrow"
              onClick={() => {
                // Go to any completed level (for replay)
                const completedLevels = progress[difficulty].completedLevels;
                if (completedLevels > 0) {
                  const levelToGo = Math.min(completedLevels, 30);
                  navigate('/games/sudoku', { 
                    state: { difficulty, level: levelToGo } 
                  });
                }
              }}
              disabled={progress[difficulty].completedLevels === 0}
            >
              ←
            </button>
            
            <button className="play-button" onClick={handleStartGame}>
              <span>PLAY</span>
              <span>LEVEL {progress[difficulty].completedLevels + 1}</span>
            </button>
            
            <button 
              className="nav-arrow"
              onClick={() => {
                // Go to next level only if current level is completed
                const nextLevel = progress[difficulty].completedLevels + 2;
                if (nextLevel <= 30) {
                  navigate('/games/sudoku', { 
                    state: { difficulty, level: nextLevel } 
                  });
                }
              }}
              disabled={progress[difficulty].completedLevels >= 29}
            >
              →
            </button>
          </div>
          
          <button className="help-button">
            <span>?</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SudokuPreGame;

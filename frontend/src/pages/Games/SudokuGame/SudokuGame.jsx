import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SudokuGame.css';

const SudokuGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { difficulty = 'easy', level = 1 } = location.state || {};
  
  const [gameId, setGameId] = useState(null);
  const [puzzle, setPuzzle] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [userGrid, setUserGrid] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [pencilMarks, setPencilMarks] = useState(Array(9).fill().map(() => Array(9).fill().map(() => [])));
  const [selectedCell, setSelectedCell] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const [isPaused, setIsPaused] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);

  const timerRef = useRef(null);
  const gameContainerRef = useRef(null);

  useEffect(() => {
    startGame();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPaused && !isCompleted) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, isCompleted]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (isCompleted) return;
      
      const key = event.key;
      
      // Arrow key navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        event.preventDefault();
        if (!selectedCell) {
          setSelectedCell({ row: 0, col: 0 });
          return;
        }
        
        let { row, col } = selectedCell;
        
        switch (key) {
          case 'ArrowUp':
            row = row > 0 ? row - 1 : 8;
            break;
          case 'ArrowDown':
            row = row < 8 ? row + 1 : 0;
            break;
          case 'ArrowLeft':
            col = col > 0 ? col - 1 : 8;
            break;
          case 'ArrowRight':
            col = col < 8 ? col + 1 : 0;
            break;
        }
        
        setSelectedCell({ row, col });
        return;
      }
      
      if (!selectedCell) return;
      
      if (key >= '1' && key <= '9') {
        const number = parseInt(key);
        if (event.shiftKey) {
          handlePencilMarkInput(number);
        } else {
          handleNumberInput(number);
        }
      } else if (key === 'Backspace' || key === 'Delete') {
        const { row, col } = selectedCell;
        const newUserGrid = [...userGrid];
        newUserGrid[row][col] = 0;
        setUserGrid(newUserGrid);
        updateGame({ row, col, number: 0 });
        setSelectedCell(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedCell, isCompleted, userGrid]);

  const startGame = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/sudoku/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ difficulty, level })
      });

      if (response.ok) {
        const data = await response.json();
        setGameId(data.gameId);
        setPuzzle(data.puzzle);
        setUserGrid(data.userGrid);
        setPencilMarks(data.pencilMarks);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to start game');
        navigate('/games/sudoku-pregame');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game');
      navigate('/games/sudoku-pregame');
    }
  };

  const updateGame = async (updates) => {
    if (!gameId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/sudoku/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gameId,
          timeSpent,
          ...updates
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUserGrid(data.userGrid);
        setPencilMarks(data.pencilMarks);
        setIsCompleted(data.isCompleted);
        
        if (data.isCompleted) {
          setCoinsEarned(data.coinsEarned);
          setShowCompletion(true);
        }
      }
    } catch (error) {
      console.error('Error updating game:', error);
    }
  };

  const handleCellClick = (row, col) => {
    if (isCompleted || puzzle[row][col] !== 0) return;
    
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (number) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    const newUserGrid = [...userGrid];
    newUserGrid[row][col] = number;
    setUserGrid(newUserGrid);
    
    // Clear pencil marks for this cell
    const newPencilMarks = [...pencilMarks];
    newPencilMarks[row][col] = [];
    setPencilMarks(newPencilMarks);
    
    // Update pencil marks for related cells
    updatePencilMarksForCell(row, col, number);
    
    updateGame({ row, col, number });
    setSelectedCell(null);
  };

  const handlePencilMarkInput = (number) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    const newPencilMarks = [...pencilMarks];
    const currentMarks = [...newPencilMarks[row][col]];
    
    const markIndex = currentMarks.indexOf(number);
    if (markIndex > -1) {
      currentMarks.splice(markIndex, 1);
    } else {
      currentMarks.push(number);
      currentMarks.sort();
    }
    
    newPencilMarks[row][col] = currentMarks;
    setPencilMarks(newPencilMarks);
    
    updateGame({ row, col, number, pencilMark: true });
    setSelectedCell(null);
  };

  // Auto-mark possible numbers for all empty cells
  const handleAutoMark = () => {
    const newPencilMarks = Array(9).fill().map(() => Array(9).fill().map(() => []));
    
    // For each empty cell, calculate possible numbers
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (userGrid[row][col] === 0) {
          const possibleNumbers = getPossibleNumbers(row, col);
          newPencilMarks[row][col] = possibleNumbers;
        }
      }
    }
    
    setPencilMarks(newPencilMarks);
    
    // Update the game state
    updateGame({ autoMark: true });
  };

  // Update pencil marks when a number is entered
  const updatePencilMarksForCell = (row, col, number) => {
    const newPencilMarks = [...pencilMarks];
    
    // Remove this number from pencil marks in the same row, column, and box
    for (let r = 0; r < 9; r++) {
      if (r !== row) {
        const index = newPencilMarks[r][col].indexOf(number);
        if (index > -1) {
          newPencilMarks[r][col].splice(index, 1);
        }
      }
    }
    
    for (let c = 0; c < 9; c++) {
      if (c !== col) {
        const index = newPencilMarks[row][c].indexOf(number);
        if (index > -1) {
          newPencilMarks[row][c].splice(index, 1);
        }
      }
    }
    
    // Remove from 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col)) {
          const index = newPencilMarks[r][c].indexOf(number);
          if (index > -1) {
            newPencilMarks[r][c].splice(index, 1);
          }
        }
      }
    }
    
    setPencilMarks(newPencilMarks);
  };

  // Get possible numbers for a cell
  const getPossibleNumbers = (row, col) => {
    const possible = [];
    
    // Check numbers 1-9
    for (let num = 1; num <= 9; num++) {
      if (isValidMove(row, col, num)) {
        possible.push(num);
      }
    }
    
    return possible;
  };

  // Check if a number is valid in a cell
  const isValidMove = (row, col, number) => {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && userGrid[row][c] === number) {
        return false;
      }
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && userGrid[r][col] === number) {
        return false;
      }
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && userGrid[r][c] === number) {
          return false;
        }
      }
    }
    
    return true;
  };



  const handleReset = async () => {
    if (!gameId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/sudoku/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gameId })
      });

      if (response.ok) {
        const data = await response.json();
        setUserGrid(data.userGrid);
        setPencilMarks(data.pencilMarks);
        setTimeSpent(0);
        setIsCompleted(false);
        setShowCompletion(false);
        setCoinsEarned(0);
      }
    } catch (error) {
      console.error('Error resetting game:', error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCell = (row, col) => {
    const value = userGrid[row][col];
    const isOriginal = puzzle[row][col] !== 0;
    const isUserFilled = !isOriginal && value !== 0;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const cellPencilMarks = pencilMarks[row][col];
    
    return (
      <div
        key={`${row}-${col}`}
        data-row={row}
        data-col={col}
        className={`sudoku-cell ${isOriginal ? 'original' : ''} ${isUserFilled ? 'user-filled' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => handleCellClick(row, col)}
      >
        {value !== 0 ? (
          <span className="cell-number">{value}</span>
        ) : cellPencilMarks.length > 0 ? (
          <div className="pencil-marks">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <span
                key={num}
                className={`pencil-mark ${cellPencilMarks.includes(num) ? 'active' : ''}`}
              >
                {cellPencilMarks.includes(num) ? num : ''}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="sudoku-game" ref={gameContainerRef}>
      <div className="game-container">
        {/* Left Sidebar */}
        <div className="game-sidebar">
          <div className="timer">
            <span className="timer-label">Timer</span>
            <span className="timer-value">{formatTime(timeSpent)}</span>
          </div>
          
          <div className="game-controls">
            <button 
              className="control-button"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            
            <button 
              className="control-button"
              onClick={handleReset}
            >
              Reset
            </button>
            
            <button 
              className="control-button"
              onClick={handleAutoMark}
            >
              Remark
            </button>
            
            <button 
              className="control-button"
              onClick={() => setShowInstructions(true)}
            >
              Help
            </button>
            
            <button 
              className="control-button"
              onClick={() => navigate('/games/sudoku-pregame')}
            >
              Menu
            </button>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="game-main">
          {/* Header */}
          <div className="game-header">
            <div className="game-info">
              <h2>Sudoku - Level {level}</h2>
              <p className="difficulty-text">{difficulty.toUpperCase()}</p>
            </div>
          </div>

          {/* Game Grid */}
          <div className="sudoku-grid">
            {Array(9).fill().map((_, row) => (
              <div key={row} className="grid-row">
                {Array(9).fill().map((_, col) => renderCell(row, col))}
              </div>
            ))}
          </div>
        </div>



        {/* Completion Modal */}
        {showCompletion && (
          <div className="completion-modal">
            <div className="completion-content">
              <h2>🎉 Puzzle Completed!</h2>
              <p>Congratulations! You solved the puzzle in {formatTime(timeSpent)}</p>
              {coinsEarned > 0 && (
                <p className="coins-earned">+{coinsEarned} coins earned!</p>
              )}
              <div className="completion-buttons">
                <button onClick={() => {
                  setShowCompletion(false);
                  navigate('/games/sudoku-pregame');
                }}>
                  Next Level
                </button>
                <button onClick={() => setShowCompletion(false)}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions Modal */}
        {showInstructions && (
          <div className="instructions-modal">
            <div className="instructions-content">
              <h3>How to Play Sudoku</h3>
              <ul>
                <li>Fill the 9x9 grid with numbers 1-9</li>
                <li>Each row, column, and 3x3 box must contain all numbers 1-9</li>
                <li>Click on a cell to select it</li>
                <li>Use arrow keys to navigate the grid</li>
                <li>Type numbers 1-9 to fill the cell</li>
                <li>Hold Shift + number to add pencil marks</li>
                <li>Press Backspace/Delete to clear a cell</li>
                <li>Click "Remark" to auto-mark possible numbers</li>
                <li>Complete the puzzle to earn coins!</li>
              </ul>
              <button onClick={() => setShowInstructions(false)}>
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SudokuGame;

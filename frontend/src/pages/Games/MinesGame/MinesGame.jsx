import { useState, useEffect, useRef } from "react";
import API from "../../../api/axios";

export default function MinesGame() {
  const [bet, setBet] = useState('');
  const [mines, setMines] = useState(3);
  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [balance, setBalance] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [showMultiplierTable, setShowMultiplierTable] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const winSound = useRef(new Audio("/sounds/win.mp3"));

  const GRID_SIZE = 25; // 5x5 grid
  const MAX_MINES = 24;
  const MIN_MINES = 1;

  // Multiplier table data (simplified version)
  const multiplierTable = [
    [1.01, 1.02, 1.03, 1.04, 1.05, 1.06, 1.07, 1.08, 1.09, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15, 1.16, 1.17, 1.18, 1.19, 1.20, 1.21, 1.22, 1.23, 24.75],
    [1.02, 1.04, 1.06, 1.08, 1.10, 1.12, 1.14, 1.16, 1.18, 1.20, 1.22, 1.24, 1.26, 1.28, 1.30, 1.32, 1.34, 1.36, 1.38, 1.40, 1.42, 1.44, 1.46],
    [1.03, 1.06, 1.09, 1.12, 1.15, 1.18, 1.21, 1.24, 1.27, 1.30, 1.33, 1.36, 1.39, 1.42, 1.45, 1.48, 1.51, 1.54, 1.57, 1.60, 1.63, 1.66],
    [1.04, 1.08, 1.12, 1.16, 1.20, 1.24, 1.28, 1.32, 1.36, 1.40, 1.44, 1.48, 1.52, 1.56, 1.60, 1.64, 1.68, 1.72, 1.76, 1.80, 1.84],
    [1.05, 1.10, 1.15, 1.20, 1.25, 1.30, 1.35, 1.40, 1.45, 1.50, 1.55, 1.60, 1.65, 1.70, 1.75, 1.80, 1.85, 1.90, 1.95, 2.00],
    [1.06, 1.12, 1.18, 1.24, 1.30, 1.36, 1.42, 1.48, 1.54, 1.60, 1.66, 1.72, 1.78, 1.84, 1.90, 1.96, 2.02, 2.08, 2.14],
    [1.07, 1.14, 1.21, 1.28, 1.35, 1.42, 1.49, 1.56, 1.63, 1.70, 1.77, 1.84, 1.91, 1.98, 2.05, 2.12, 2.19, 2.26],
    [1.08, 1.16, 1.24, 1.32, 1.40, 1.48, 1.56, 1.64, 1.72, 1.80, 1.88, 1.96, 2.04, 2.12, 2.20, 2.28, 2.36],
    [1.09, 1.18, 1.27, 1.36, 1.45, 1.54, 1.63, 1.72, 1.81, 1.90, 1.99, 2.08, 2.17, 2.26, 2.35, 2.44],
    [1.10, 1.20, 1.30, 1.40, 1.50, 1.60, 1.70, 1.80, 1.90, 2.00, 2.10, 2.20, 2.30, 2.40, 2.50],
    [1.11, 1.22, 1.33, 1.44, 1.55, 1.66, 1.77, 1.88, 1.99, 2.10, 2.21, 2.32, 2.43, 2.54],
    [1.12, 1.24, 1.36, 1.48, 1.60, 1.72, 1.84, 1.96, 2.08, 2.20, 2.32, 2.44, 2.56],
    [1.13, 1.26, 1.39, 1.52, 1.65, 1.78, 1.91, 2.04, 2.17, 2.30, 2.43, 2.56],
    [1.14, 1.28, 1.42, 1.56, 1.70, 1.84, 1.98, 2.12, 2.26, 2.40, 2.54],
    [1.15, 1.30, 1.45, 1.60, 1.75, 1.90, 2.05, 2.20, 2.35, 2.50],
    [1.16, 1.32, 1.48, 1.64, 1.80, 1.96, 2.12, 2.28, 2.44],
    [1.17, 1.34, 1.51, 1.68, 1.85, 2.02, 2.19, 2.36],
    [1.18, 1.36, 1.54, 1.72, 1.90, 2.08, 2.26],
    [1.19, 1.38, 1.57, 1.76, 1.95, 2.14],
    [1.20, 1.40, 1.60, 1.80, 2.00],
    [1.21, 1.42, 1.63, 1.84],
    [1.22, 1.44, 1.66],
    [1.23, 1.46],
    [24.75]
  ];

  useEffect(() => {
    fetchUser();
    initializeGrid();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(res.data.coins);
    } catch (err) {
      console.error("User fetch failed:", err);
    }
  };

  const initializeGrid = () => {
    const newGrid = Array(GRID_SIZE).fill(null).map((_, index) => ({
      id: index,
      isMine: false,
      multiplier: 1,
      revealed: false
    }));
    setGrid(newGrid);
    setRevealed([]);
    setGameStarted(false);
    setGameOver(false);
    setCurrentMultiplier(1);
    setTotalWinnings(0);
    setShowResult(false);
  };

  const startGame = async () => {
    try {
      // Allow playing with 0 coins
      const betAmount = parseFloat(bet) || 0;
      
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/mines/start",
        { bet: betAmount, mines },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGrid(res.data.grid);
      setGameStarted(true);
      setGameOver(false);
      setCurrentMultiplier(1);
      setTotalWinnings(0);
      setRevealed([]);
      setBalance(res.data.balance);

      return res.data;
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const [isRevealing, setIsRevealing] = useState(false);

  const revealTile = async (tileId) => {
    if (!gameStarted || gameOver || revealed.includes(tileId) || isRevealing) return;
    
    setIsRevealing(true);

    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/mines/reveal",
        { tileId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { isMine, multiplier, newBalance, gameEnded } = res.data;
      
      setRevealed([...revealed, tileId]);
      setCurrentMultiplier(multiplier);
      setBalance(newBalance);

      if (isMine) {
        setGameOver(true);
        setGameStarted(false);
        // Reveal all mines
        const updatedGrid = grid.map(tile => ({
          ...tile,
          revealed: tile.isMine
        }));
        setGrid(updatedGrid);
        
        // Show loss message
        setResultMessage("You hit a mine! Game Over!");
        setShowResult(true);
      } else if (gameEnded) {
        // All safe tiles revealed
        setGameOver(true);
        setGameStarted(false);
        setTotalWinnings(bet * multiplier);
        
        if (res.data.win) {
          winSound.current.currentTime = 0;
          winSound.current.play().catch((e) => console.warn("Sound play error:", e));
          
          // Show win message
          setResultMessage(`Congratulations! You won ${bet * multiplier} coins!`);
          setShowResult(true);
        }
      }

      // Notify others that coins changed
      window.dispatchEvent(
        new CustomEvent("coinsUpdated", {
          detail: { coins: newBalance },
        })
      );

      return res.data;
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsRevealing(false);
    }
  };

  const cashOut = async () => {
    if (!gameStarted || gameOver) return;

    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/mines/cashout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGameOver(true);
      setGameStarted(false);
      setTotalWinnings(res.data.winnings);
      setBalance(res.data.balance);

      if (res.data.win) {
        winSound.current.currentTime = 0;
        winSound.current.play().catch((e) => console.warn("Sound play error:", e));
        
        // Show win message
        setResultMessage(`Great job! You cashed out and won ${res.data.winnings} coins!`);
        setShowResult(true);
      }

      // Notify others that coins changed
      window.dispatchEvent(
        new CustomEvent("coinsUpdated", {
          detail: { coins: res.data.balance },
        })
      );

      return res.data;
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleRestart = () => {
    setShowResult(false);
    initializeGrid();
  };

  const renderTile = (tile) => {
    const isRevealed = revealed.includes(tile.id);
    // Don't expose mine information to client - only show what's been revealed
    const isGameOverMine = gameOver && isRevealed && tile.isMine;

    return (
      <div
        key={tile.id}
        onClick={() => revealTile(tile.id)}
        style={{
          ...styles.tile,
          backgroundColor: isRevealed 
            ? (tile.isMine ? '#ff4444' : '#44ff44') 
            : '#333',
          cursor: (gameStarted && !gameOver && !isRevealed && !isRevealing) ? 'pointer' : 'default',
          opacity: isRevealed ? 1 : 0.8,
        }}
      >
        {isRevealed && !tile.isMine && (
          <span style={styles.multiplier}>💎</span>
        )}
        {isRevealed && tile.isMine && (
          <span style={styles.mine}>💣</span>
        )}
        {isGameOverMine && (
          <span style={styles.mine}>💣</span>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.gamePanel}>
        <div style={styles.content}>
          {/* Left Side - Controls */}
          <div style={styles.controls}>
            {/* Amount Section */}
            <div style={styles.section}>
              <label style={styles.label}>Amount</label>
              <div style={styles.amountContainer}>
                <input
                  type="number"
                  value={bet}
                  onChange={(e) => setBet(parseFloat(e.target.value) || 0)}
                  style={styles.input}
                  disabled={gameStarted}
                  step="0.01"
                />
                <div style={styles.currencyIcon}>G</div>
              </div>
              <div style={styles.amountButtons}>
                <button
                  onClick={() => setBet(bet / 2)}
                  style={styles.smallButton}
                  disabled={gameStarted}
                >
                  ½
                </button>
                <button
                  onClick={() => setBet(bet * 2)}
                  style={styles.smallButton}
                  disabled={gameStarted}
                >
                  2x
                </button>
              </div>
            </div>

            {/* Mines Section */}
            <div style={styles.section}>
              <label style={styles.label}>Mines</label>
              <select
                value={mines}
                onChange={(e) => setMines(parseInt(e.target.value))}
                style={styles.select}
                disabled={gameStarted}
              >
                {Array.from({ length: MAX_MINES }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            {/* Play Button - Hidden during game */}
            {!gameStarted && (
              <button
                onClick={startGame}
                style={styles.playButton}
              >
                Play
              </button>
            )}

            {/* Cashout Button - Show during game */}
            {gameStarted && !gameOver && (
              <button
                onClick={cashOut}
                style={styles.cashoutButton}
              >
                Cash Out 💰
              </button>
            )}

            {/* Multiplier Table Button */}
            <button
              onClick={() => setShowMultiplierTable(!showMultiplierTable)}
              style={styles.tableButton}
            >
              {showMultiplierTable ? "Hide" : "Show"} Multiplier Table
            </button>

            {/* Instructions Button */}
            <button
              onClick={() => setShowInstructions(true)}
              style={styles.instructionsButton}
            >
              How to Play
            </button>

            {/* Security Notice */}
            <div style={styles.securityNotice}>
              <p>🔒 Game is secured - mine positions are hidden from inspection</p>
            </div>

            {/* Game Status */}
            {gameStarted && !gameOver && (
              <div style={styles.statusBox}>
                <p>💎 Current Multiplier: ×{currentMultiplier}</p>
                <p>💰 Potential Win: {(parseFloat(bet) || 0) * currentMultiplier} coins</p>
              </div>
            )}
          </div>

          {/* Right Side - Game Grid */}
          <div style={styles.gameArea}>
            <div style={styles.gridContainer}>
              <div style={styles.grid}>
                {grid.map(renderTile)}
              </div>
            </div>
          </div>
        </div>

        {/* Multiplier Table */}
        {showMultiplierTable && (
          <div style={styles.tableContainer}>
            <h3 style={styles.tableTitle}>MINES</h3>
            <div style={styles.tableWrapper}>
              <div style={styles.tableHeader}>
                <div style={styles.cornerCell}></div>
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} style={styles.headerCell}>{i + 1}</div>
                ))}
              </div>
              <div style={styles.tableBody}>
                {multiplierTable.map((row, rowIndex) => (
                  <div key={rowIndex} style={styles.tableRow}>
                    <div style={styles.rowLabel}>{rowIndex + 1}</div>
                    {row.map((value, colIndex) => (
                      <div key={colIndex} style={styles.tableCell}>
                        {value.toFixed(2)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Popup */}
      {showResult && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <h3 style={styles.popupTitle}>
              {resultMessage.includes("won") ? "🎉 Victory!" : "💥 Game Over!"}
            </h3>
            <p style={styles.popupMessage}>{resultMessage}</p>
            <div style={styles.popupButtons}>
              <button
                onClick={handleRestart}
                style={styles.popupButton}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div style={styles.popupOverlay}>
          <div style={styles.instructionsPopup}>
            <h3 style={styles.popupTitle}>💎 How to Play Mines</h3>
            <div style={styles.instructionsContent}>
              <div style={styles.instructionSection}>
                <h4 style={styles.instructionSubtitle}>🎯 Objective</h4>
                <p>Reveal safe tiles while avoiding mines to earn multipliers and cash out your winnings!</p>
              </div>
              
              <div style={styles.instructionSection}>
                <h4 style={styles.instructionSubtitle}>🎮 Gameplay</h4>
                <ul style={styles.instructionList}>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Set your bet amount and choose number of mines (1-24)</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Click "Play" to start the game</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Click tiles to reveal them - avoid the mines!</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Each safe tile increases your multiplier</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Cash out anytime to collect your winnings</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Hit a mine and you lose your bet</li>
                </ul>
              </div>

              <div style={styles.instructionSection}>
                <h4 style={styles.instructionSubtitle}>💰 Multipliers</h4>
                <ul style={styles.instructionList}>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>More mines = higher risk = higher potential payouts</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>More diamonds revealed = higher multiplier</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Check the multiplier table for exact values</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Winnings = Bet × Current Multiplier</li>
                </ul>
              </div>

              <div style={styles.instructionSection}>
                <h4 style={styles.instructionSubtitle}>🎲 Strategy</h4>
                <ul style={styles.instructionList}>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Start with fewer mines to learn the game</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Cash out early to secure smaller wins</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Risk more mines for bigger potential payouts</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Don't get greedy - know when to stop!</li>
                </ul>
              </div>
            </div>
            <div style={styles.popupButtons}>
              <button
                onClick={() => setShowInstructions(false)}
                style={styles.popupButton}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "0",
    color: "#fff",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#1a1a2e",
  },
  gamePanel: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    backgroundColor: "#16213e",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
  },
  content: {
    display: "flex",
    gap: "40px",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  controls: {
    flex: "0 0 220px",
    display: "flex",
    flexDirection: "column",
    gap: "25px",
    backgroundColor: "#1a1a2e",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid #2a2a2a",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  label: {
    fontSize: "14px",
    color: "#ccc",
    fontWeight: "500",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  amountContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "16px 40px 16px 16px",
    backgroundColor: "#2a2a2a",
    border: "1px solid #444",
    borderRadius: "8px",
    color: "white",
    fontSize: "16px",
    outline: "none",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  currencyIcon: {
    position: "absolute",
    right: "16px",
    width: "20px",
    height: "20px",
    backgroundColor: "#ffd700",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
    color: "black",
  },
  amountButtons: {
    display: "flex",
    gap: "8px",
  },
  smallButton: {
    flex: 1,
    padding: "12px 12px",
    backgroundColor: "#2a2a2a",
    border: "1px solid #444",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  select: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#2a2a2a",
    border: "1px solid #444",
    borderRadius: "8px",
    color: "white",
    fontSize: "16px",
    outline: "none",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  playButton: {
    padding: "18px",
    backgroundColor: "#00ff88",
    border: "none",
    borderRadius: "8px",
    color: "black",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  cashoutButton: {
    padding: "18px",
    backgroundColor: "#ff6b35",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  tableButton: {
    padding: "12px",
    backgroundColor: "#2a2a2a",
    border: "1px solid #444",
    borderRadius: "6px",
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  instructionsButton: {
    padding: "12px",
    backgroundColor: "#2a2a2a",
    border: "1px solid #444",
    borderRadius: "6px",
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  securityNotice: {
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    border: "1px solid rgba(255, 215, 0, 0.3)",
    borderRadius: "6px",
    padding: "8px 12px",
    marginTop: "10px",
    textAlign: "center",
  },
  statusBox: {
    backgroundColor: "#2a2a2a",
    padding: "15px",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    border: "1px solid #444",
  },
  cashoutButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#ffc107",
    border: "none",
    borderRadius: "6px",
    color: "black",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  gameArea: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "700px",
  },
  gridContainer: {
    backgroundColor: "#1a1a2e",
    padding: "30px",
    borderRadius: "12px",
    border: "1px solid #2a2a2a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "12px",
    maxWidth: "550px",
  },
  tile: {
    width: "90px",
    height: "90px",
    border: "2px solid #444",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  },
  multiplier: {
    color: "#00ff88",
    fontWeight: "bold",
  },
  mine: {
    fontSize: "28px",
  },
  tableContainer: {
    marginTop: "30px",
    backgroundColor: "#1a1a2e",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #2a2a2a",
  },
  tableTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "white",
    textAlign: "center",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  tableHeader: {
    display: "flex",
    borderBottom: "1px solid #444",
  },
  cornerCell: {
    width: "60px",
    height: "40px",
    backgroundColor: "#2a2a2a",
    borderRight: "1px solid #444",
    borderBottom: "1px solid #444",
  },
  headerCell: {
    width: "80px",
    height: "40px",
    backgroundColor: "#ff4444",
    borderRight: "1px solid #444",
    borderBottom: "1px solid #444",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
    color: "white",
  },
  tableBody: {
    display: "flex",
    flexDirection: "column",
  },
  tableRow: {
    display: "flex",
  },
  rowLabel: {
    width: "60px",
    height: "40px",
    backgroundColor: "#00ff88",
    borderRight: "1px solid #444",
    borderBottom: "1px solid #444",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
    color: "black",
  },
  tableCell: {
    width: "80px",
    height: "40px",
    backgroundColor: "#333",
    borderRight: "1px solid #444",
    borderBottom: "1px solid #444",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    color: "black",
  },
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  popup: {
    backgroundColor: "#2a2a2a",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
    maxWidth: "400px",
    border: "1px solid #444",
  },
  popupTitle: {
    fontSize: "24px",
    marginBottom: "15px",
    color: "#fff",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  popupMessage: {
    fontSize: "16px",
    marginBottom: "20px",
    color: "#ccc",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  popupButtons: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
  popupButton: {
    padding: "12px 24px",
    backgroundColor: "#00ff88",
    border: "none",
    borderRadius: "6px",
    color: "black",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  instructionsPopup: {
    backgroundColor: "#2a2a2a",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
    maxWidth: "400px",
    border: "1px solid #444",
  },
  instructionsContent: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "20px",
  },
  instructionSection: {
    textAlign: "left",
    paddingLeft: "20px",
  },
  instructionSubtitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#00ff88",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  instructionList: {
    listStyle: "none",
    padding: "0",
    margin: "0",
    textAlign: "left",
  },
};

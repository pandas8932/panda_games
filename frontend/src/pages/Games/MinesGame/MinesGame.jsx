import { useState, useEffect, useRef } from "react";
import API from "../../../api/axios";

export default function MinesGame() {
  const [bet, setBet] = useState(10);
  const [mines, setMines] = useState(3);
  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [showGuide, setShowGuide] = useState(false);
  
  // Autoplay features
  const [rounds, setRounds] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [stopAt, setStopAt] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  
  const stopAutoplay = useRef(false);
  const winSound = useRef(new Audio("/sounds/win.mp3"));

  const GRID_SIZE = 25; // 5x5 grid
  const MAX_MINES = 24;
  const MIN_MINES = 1;

  useEffect(() => {
    fetchUser();
    fetchHistory();
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

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/mines/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed:", err);
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
  };

  const startGame = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/mines/start",
        { bet, mines },
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

  const revealTile = async (tileId) => {
    if (!gameStarted || gameOver || revealed.includes(tileId)) return;

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
      } else if (gameEnded) {
        // All safe tiles revealed
        setGameOver(true);
        setGameStarted(false);
        setTotalWinnings(bet * multiplier);
        
        if (res.data.win) {
          winSound.current.currentTime = 0;
          winSound.current.play().catch((e) => console.warn("Sound play error:", e));
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
      fetchHistory();

      if (res.data.win) {
        winSound.current.currentTime = 0;
        winSound.current.play().catch((e) => console.warn("Sound play error:", e));
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

  const autoplay = async () => {
    setPlaying(true);
    stopAutoplay.current = false;
    setCurrentRound(0);

    for (let i = 0; i < rounds; i++) {
      if (stopAutoplay.current) break;
      
      setCurrentRound(i + 1);
      
      while (paused) await new Promise((r) => setTimeout(r, 300));

      // Start new game
      const gameData = await startGame();
      if (!gameData) break;

      // Auto-reveal tiles until we hit a mine or cash out
      let tilesRevealed = 0;
      const maxTilesToReveal = Math.floor(Math.random() * 10) + 5; // Random strategy
      
      for (let j = 0; j < maxTilesToReveal; j++) {
        if (stopAutoplay.current) break;
        
        // Find unrevealed tiles
        const unrevealedTiles = grid.filter(tile => !revealed.includes(tile.id));
        if (unrevealedTiles.length === 0) break;
        
        // Pick random tile
        const randomTile = unrevealedTiles[Math.floor(Math.random() * unrevealedTiles.length)];
        const result = await revealTile(randomTile.id);
        
        if (!result || result.isMine) break;
        
        tilesRevealed++;
        await new Promise((r) => setTimeout(r, 200)); // Small delay between reveals
      }

      // Cash out if we haven't hit a mine
      if (!gameOver) {
        await cashOut();
      }

      if (stopAt && balance >= stopAt) {
        alert(`🎯 Target ${stopAt} coins reached. Stopping.`);
        break;
      }

      if (balance < 100) {
        alert(`⚠️ Balance dropped below 100. Stopping.`);
        break;
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    setPlaying(false);
    setCurrentRound(0);
  };

  const renderTile = (tile) => {
    const isRevealed = revealed.includes(tile.id);
    const isGameOverMine = gameOver && tile.isMine;

    return (
      <div
        key={tile.id}
        onClick={() => revealTile(tile.id)}
        style={{
          ...styles.tile,
          backgroundColor: isRevealed 
            ? (tile.isMine ? '#ff4444' : '#44ff44') 
            : isGameOverMine 
              ? '#ff4444' 
              : '#2a2a2a',
          cursor: (gameStarted && !gameOver && !isRevealed) ? 'pointer' : 'default',
          opacity: isRevealed || isGameOverMine ? 1 : 0.8,
        }}
      >
        {isRevealed && !tile.isMine && (
          <span style={styles.multiplier}>×{tile.multiplier}</span>
        )}
        {isRevealed && tile.isMine && (
          <span style={styles.mine}>💣</span>
        )}
        {isGameOverMine && !isRevealed && (
          <span style={styles.mine}>💣</span>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <h2 style={styles.title}>💣 Mines Game</h2>

        <div style={styles.fieldRow}>
          <label>💸 Bet:</label>
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(+e.target.value)}
            style={styles.input}
            disabled={gameStarted}
          />
          <button
            onClick={() => setBet(bet * 2)}
            style={styles.button("#ffaa00")}
            disabled={gameStarted}
          >
            2x
          </button>
        </div>

        <div style={styles.fieldRow}>
          <label>💣 Mines:</label>
          <input
            type="range"
            min={MIN_MINES}
            max={MAX_MINES}
            value={mines}
            onChange={(e) => setMines(+e.target.value)}
            style={styles.slider}
            disabled={gameStarted}
          />
          <span style={styles.mineCount}>{mines}</span>
        </div>

        <div style={styles.field}>
          <label>🔁 Auto Play Rounds:</label>
          <input
            type="number"
            value={rounds}
            onChange={(e) => setRounds(+e.target.value)}
            style={styles.input}
            disabled={playing}
          />
        </div>

        <div style={styles.field}>
          <label>🎯 Stop at Balance:</label>
          <input
            type="number"
            value={stopAt || ""}
            onChange={(e) => setStopAt(+e.target.value)}
            style={styles.input}
            disabled={playing}
          />
        </div>

        <div style={styles.buttons}>
          {!gameStarted && !playing && (
            <button
              onClick={startGame}
              style={styles.button("#00e0ff")}
            >
              Start Game 💣
            </button>
          )}
          
          {gameStarted && !gameOver && (
            <button
              onClick={cashOut}
              style={styles.button("#00ff88")}
            >
              Cash Out 💰
            </button>
          )}
          
          <button
            onClick={autoplay}
            disabled={playing || gameStarted}
            style={styles.button("#00ff88")}
          >
            Auto Play
          </button>
          
          <button
            onClick={() => setPaused(!paused)}
            disabled={!playing}
            style={styles.button("#ffaa00")}
          >
            {paused ? "▶️ Resume" : "⏸️ Pause"}
          </button>
          
          <button
            onClick={() => {
              stopAutoplay.current = true;
              setPaused(false);
            }}
            disabled={!playing}
            style={styles.button("#ff0044")}
          >
            ⛔ Stop
          </button>
        </div>

        {playing && (
          <div style={styles.statusBox}>
            <p>🔄 Auto Playing: Round {currentRound}/{rounds}</p>
            <p>💰 Balance: {balance} coins</p>
          </div>
        )}

        {gameStarted && !gameOver && (
          <div style={styles.statusBox}>
            <p>💎 Current Multiplier: ×{currentMultiplier}</p>
            <p>💰 Potential Win: {bet * currentMultiplier} coins</p>
          </div>
        )}

        {gameOver && (
          <div style={styles.resultBox}>
            <p>{totalWinnings > 0 ? "🎉 You Won!" : "❌ You Lost"}</p>
            <p>💰 Winnings: {totalWinnings} coins</p>
            <p>💰 Balance: {balance} coins</p>
          </div>
        )}

        {/* Mines Grid */}
        <div style={styles.gridContainer}>
          <div style={styles.grid}>
            {grid.map(renderTile)}
          </div>
        </div>

        <hr style={{ margin: "20px 0", borderColor: "#333" }} />

        <button
          onClick={() => setShowGuide(!showGuide)}
          style={styles.button("#4444ff")}
        >
          {showGuide ? "❌ Hide Guide" : "❓ How to Play"}
        </button>

        {showGuide && (
          <div style={styles.guideBox}>
            <h4>📘 How Mines Game Works:</h4>
            <ul>
              <li>Set your bet and choose number of mines (1-24)</li>
              <li>Click tiles to reveal them - avoid the mines!</li>
              <li>Each safe tile increases your multiplier</li>
              <li>Cash out anytime to collect your winnings</li>
              <li>Hit a mine and you lose your bet</li>
              <li>More mines = higher risk = higher potential payouts</li>
            </ul>
          </div>
        )}

        <div style={styles.historyBox}>
          <h4>🕒 Game History (Last 10):</h4>
          <ul style={{ fontSize: "14px", paddingLeft: "20px" }}>
            {history.map((game, i) => (
              <li key={i}>
                Bet {game.bet} | Mines {game.mines} | Tiles {game.tilesRevealed} | 
                Multiplier ×{game.multiplier} → {game.win ? "✅ Win" : "❌ Lose"} | 
                💰 {game.win ? `+${game.payout}` : `-${game.bet}`}
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.disclaimer}>
          ⚠️ This game is for entertainment purposes only. Play responsibly. No
          real money is involved.
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "30px",
    color: "#fff",
    fontFamily: "sans-serif",
  },
  panel: {
    maxWidth: "800px",
    margin: "auto",
    backgroundColor: "#1c1c1c",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 0 10px rgba(0, 224, 255, 0.2)",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#00e0ff",
  },
  field: { marginBottom: "15px" },
  fieldRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "15px",
  },
  input: {
    flex: 1,
    padding: "8px",
    backgroundColor: "#2a2a2a",
    border: "1px solid #444",
    color: "white",
    borderRadius: "6px",
    fontSize: "14px",
  },
  slider: {
    flex: 1,
    margin: "0 10px",
  },
  mineCount: {
    minWidth: "30px",
    textAlign: "center",
    fontWeight: "bold",
    color: "#ff4444",
  },
  button: (color) => ({
    flex: 1,
    padding: "10px",
    fontSize: "14px",
    backgroundColor: color,
    color: "#000",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    minWidth: "100px",
    fontWeight: "bold",
  }),
  buttons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "20px",
  },
  gridContainer: {
    display: "flex",
    justifyContent: "center",
    margin: "20px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "8px",
    maxWidth: "400px",
  },
  tile: {
    width: "60px",
    height: "60px",
    border: "2px solid #444",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  },
  multiplier: {
    color: "#00ff88",
    fontWeight: "bold",
  },
  mine: {
    fontSize: "24px",
  },
  statusBox: {
    textAlign: "center",
    fontSize: "16px",
    backgroundColor: "#222",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "10px",
  },
  resultBox: {
    textAlign: "center",
    fontSize: "16px",
    backgroundColor: "#222",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "10px",
  },
  guideBox: {
    marginTop: "20px",
    backgroundColor: "#222",
    padding: "15px",
    borderRadius: "10px",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  historyBox: {
    marginTop: "20px",
    backgroundColor: "#1b1b1b",
    padding: "15px",
    borderRadius: "10px",
  },
  disclaimer: {
    marginTop: "20px",
    fontSize: "12px",
    color: "#aaa",
    borderTop: "1px solid #333",
    paddingTop: "10px",
  },
};

import { useState, useEffect, useRef } from "react";
import API from "../../../api/axios";

export default function DiceGame() {
  const [bet, setBet] = useState(0.00);
  const [target, setTarget] = useState(49);
  const [over, setOver] = useState(false);
  const [result, setResult] = useState(null);
  const [rounds, setRounds] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [paused, setPaused] = useState(false);
  const [stopAt, setStopAt] = useState(null);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);

  const stopAutoplay = useRef(false);
  const winSound = useRef(new Audio("/sounds/win.mp3"));

  useEffect(() => {
    fetchUser();
    fetchHistory();
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
      const res = await API.get("/dice/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed:", err);
    }
  };

  const playDice = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/dice/play",
        { bet, target, over },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResult(res.data);
      setBalance(res.data.balance);
      fetchHistory();

      if (res.data.win) {
        winSound.current.currentTime = 0;
        winSound.current
          .play()
          .catch((e) => console.warn("Sound play error:", e));
      }
      setBalance(res.data.balance);

      // Notify others (like Navbar) that coins changed
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
    setRolling(true);
    stopAutoplay.current = false;

    for (let i = 0; i < rounds; i++) {
      if (stopAutoplay.current) break;
      while (paused) await new Promise((r) => setTimeout(r, 300));

      const res = await playDice();
      if (!res) break;

      if (stopAt && res.balance >= stopAt) {
        alert(`🎯 Target ${stopAt} coins reached. Stopping.`);
        break;
      }

      if (res.balance < 100) {
        alert(`⚠️ Balance dropped below 100. Stopping.`);
        break;
      }

      await new Promise((r) => setTimeout(r, 800));
    }

    setRolling(false);
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
                  disabled={rolling}
                  step="0.01"
                />
                <div style={styles.currencyIcon}>G</div>
              </div>
              <div style={styles.amountButtons}>
                <button
                  onClick={() => setBet(bet / 2)}
                  style={styles.smallButton}
                  disabled={rolling}
                >
                  ½
                </button>
                <button
                  onClick={() => setBet(bet * 2)}
                  style={styles.smallButton}
                  disabled={rolling}
                >
                  2x
                </button>
              </div>
            </div>

            {/* Target Section */}
            <div style={styles.section}>
              <label style={styles.label}>Target: {target}</label>
              <input
                type="range"
                min={2}
                max={99}
                value={target}
                onChange={(e) => setTarget(+e.target.value)}
                style={styles.slider}
                disabled={rolling}
              />
            </div>

            {/* Over/Under Toggle */}
            <div style={styles.section}>
              <label style={styles.label}>Direction</label>
              <div style={styles.toggleContainer}>
                <button
                  style={{
                    ...styles.toggleButton,
                    backgroundColor: !over ? "#00ff88" : "#2a2a2a",
                    color: !over ? "black" : "white"
                  }}
                  onClick={() => setOver(false)}
                  disabled={rolling}
                >
                  Under
                </button>
                <button
                  style={{
                    ...styles.toggleButton,
                    backgroundColor: over ? "#00ff88" : "#2a2a2a",
                    color: over ? "black" : "white"
                  }}
                  onClick={() => setOver(true)}
                  disabled={rolling}
                >
                  Over
                </button>
              </div>
            </div>

            {/* Auto Play Settings */}
            <div style={styles.section}>
              <label style={styles.label}>Auto Play Rounds</label>
              <input
                type="number"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value) || 0)}
                style={styles.input}
                disabled={rolling}
              />
            </div>

            <div style={styles.section}>
              <label style={styles.label}>Stop at Balance</label>
              <input
                type="number"
                value={stopAt || ""}
                onChange={(e) => setStopAt(parseFloat(e.target.value) || null)}
                style={styles.input}
                disabled={rolling}
                step="0.01"
              />
            </div>

            {/* Play Button */}
            <button
              onClick={playDice}
              disabled={rolling}
              style={styles.playButton}
            >
              Roll 🎲
            </button>

            {/* Auto Play Button */}
            <button
              onClick={autoplay}
              disabled={rolling}
              style={styles.autoPlayButton}
            >
              Auto Play
            </button>

            {/* Instructions Button */}
            <button
              onClick={() => setShowInstructions(true)}
              style={styles.instructionsButton}
            >
              How to Play
            </button>

            {/* Game Status */}
            {result && (
              <div style={styles.statusBox}>
                <p>{result.win ? "🎉 You Win!" : "❌ You Lose"}</p>
                <p>💰 Balance: {balance} coins</p>
                <p>🎯 Rolled: {result.rolled}</p>
              </div>
            )}

            {rolling && (
              <div style={styles.statusBox}>
                <p>🔄 Auto Playing...</p>
                <p>💰 Balance: {balance} coins</p>
                <button
                  onClick={() => setPaused(!paused)}
                  style={styles.controlButton}
                >
                  {paused ? "▶️ Resume" : "⏸️ Pause"}
                </button>
                <button
                  onClick={() => {
                    stopAutoplay.current = true;
                    setPaused(false);
                  }}
                  style={styles.stopButton}
                >
                  ⛔ Stop
                </button>
              </div>
            )}
          </div>

          {/* Right Side - Game Area */}
          <div style={styles.gameArea}>
            <div style={styles.diceContainer}>
              <div style={styles.diceDisplay}>
                <span style={styles.diceIcon}>🎲</span>
                <div style={styles.diceInfo}>
                  <h3 style={styles.diceTitle}>Dice Game</h3>
                  <p style={styles.diceDescription}>
                    Roll the dice and predict if the result will be over or under your target!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div style={styles.popupOverlay}>
          <div style={styles.instructionsPopup}>
            <h3 style={styles.popupTitle}>🎲 How to Play Dice</h3>
            <div style={styles.instructionsContent}>
              <div style={styles.instructionSection}>
                <h4 style={styles.instructionSubtitle}>🎯 Objective</h4>
                <p>Predict if the dice roll will be over or under your target number!</p>
              </div>
              
              <div style={styles.instructionSection}>
                <h4 style={styles.instructionSubtitle}>🎮 Gameplay</h4>
                <ul style={styles.instructionList}>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Set your bet amount</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Choose a target number (2-99)</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Select "Over" or "Under"</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Click "Roll" to play</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Win if your prediction is correct!</li>
                </ul>
              </div>

              <div style={styles.instructionSection}>
                <h4 style={styles.instructionSubtitle}>💰 Payouts</h4>
                <ul style={styles.instructionList}>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Payout depends on the risk level</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Closer to 50 = safer = lower payout</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Further from 50 = riskier = higher payout</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Target 50 = 1.98x payout</li>
                </ul>
              </div>

              <div style={styles.instructionSection}>
                <h4 style={styles.instructionSubtitle}>🎲 Strategy</h4>
                <ul style={styles.instructionList}>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Start with targets close to 50 for safer bets</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Use extreme targets (2 or 99) for high risk/reward</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Try auto play for multiple rounds</li>
                  <li style={{ marginBottom: "8px", color: "#ccc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>Set stop limits to manage your bankroll</li>
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
  slider: {
    width: "100%",
    height: "6px",
    borderRadius: "3px",
    background: "#2a2a2a",
    outline: "none",
    opacity: "0.7",
    transition: "opacity .2s",
  },
  toggleContainer: {
    display: "flex",
    backgroundColor: "#2a2a2a",
    borderRadius: "8px",
    padding: "4px",
    gap: "2px",
  },
  toggleButton: {
    flex: 1,
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
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
  autoPlayButton: {
    padding: "14px",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
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
  statusBox: {
    backgroundColor: "#2a2a2a",
    padding: "15px",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    border: "1px solid #444",
  },
  controlButton: {
    marginTop: "8px",
    padding: "8px 16px",
    backgroundColor: "#ffc107",
    border: "none",
    borderRadius: "6px",
    color: "black",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  stopButton: {
    marginTop: "8px",
    marginLeft: "8px",
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
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
  diceContainer: {
    backgroundColor: "#1a1a2e",
    padding: "40px",
    borderRadius: "12px",
    border: "1px solid #2a2a2a",
    textAlign: "center",
  },
  diceDisplay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  diceIcon: {
    fontSize: "80px",
  },
  diceInfo: {
    textAlign: "center",
  },
  diceTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#00ff88",
    marginBottom: "10px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  diceDescription: {
    fontSize: "16px",
    color: "#ccc",
    lineHeight: "1.5",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
  instructionsPopup: {
    backgroundColor: "#2a2a2a",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
    maxWidth: "500px",
    border: "1px solid #444",
  },
  popupTitle: {
    fontSize: "24px",
    marginBottom: "15px",
    color: "#fff",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
};

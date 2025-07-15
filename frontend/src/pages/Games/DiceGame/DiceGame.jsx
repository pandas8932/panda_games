import { useState, useEffect, useRef } from "react";
import API from "../../../api/axios";

export default function DiceGame() {
  const [bet, setBet] = useState(10);
  const [target, setTarget] = useState(49);
  const [over, setOver] = useState(false);
  const [result, setResult] = useState(null);
  const [rounds, setRounds] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [paused, setPaused] = useState(false);
  const [stopAt, setStopAt] = useState(null);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [showGuide, setShowGuide] = useState(false);

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
      <div style={styles.panel}>
        <h2 style={styles.title}>🎲 Dice Game</h2>

        <div style={styles.fieldRow}>
          <label>💸 Bet:</label>
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(+e.target.value)}
            style={styles.input}
          />
          <button
            onClick={() => setBet(bet * 2)}
            style={styles.button("#ffaa00")}
          >
            2x
          </button>
        </div>

        <div style={styles.field}>
          <label>🔁 Auto Play Rounds:</label>
          <input
            type="number"
            value={rounds}
            onChange={(e) => setRounds(+e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>🎯 Stop at Balance:</label>
          <input
            type="number"
            value={stopAt || ""}
            onChange={(e) => setStopAt(+e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>🎯 Target: {target}</label>
          <input
            type="range"
            min={2}
            max={99}
            value={target}
            onChange={(e) => setTarget(+e.target.value)}
          />
        </div>

        <div style={styles.toggle}>
          <label>
            <input
              type="radio"
              checked={!over}
              onChange={() => setOver(false)}
            />{" "}
            Under
          </label>
          <label>
            <input
              type="radio"
              checked={over}
              onChange={() => setOver(true)}
              style={{ marginLeft: "20px" }}
            />{" "}
            Over
          </label>
        </div>

        <div style={styles.buttons}>
          <button
            onClick={playDice}
            disabled={rolling}
            style={styles.button("#00e0ff")}
          >
            Roll 🎲
          </button>
          <button
            onClick={autoplay}
            disabled={rolling}
            style={styles.button("#00ff88")}
          >
            Auto Play
          </button>
          <button
            onClick={() => setPaused(!paused)}
            disabled={!rolling}
            style={styles.button("#ffaa00")}
          >
            {paused ? "▶️ Resume" : "⏸️ Pause"}
          </button>
          <button
            onClick={() => {
              stopAutoplay.current = true;
              setPaused(false);
            }}
            disabled={!rolling}
            style={styles.button("#ff0044")}
          >
            ⛔ Stop
          </button>
        </div>

        {result && (
          <div style={styles.resultBox}>
            <p>{result.win ? "🎉 You Win!" : "❌ You Lose"}</p>
            <p>💰 Balance: {balance} coins</p>
            <p>🎯 Rolled: {result.rolled}</p>
          </div>
        )}

        <hr style={{ margin: "20px 0", borderColor: "#333" }} />

        <button
          onClick={() => setShowGuide(!showGuide)}
          style={styles.button("#4444ff")}
        >
          {showGuide ? "❌ Hide Guide" : "❓ How to Play"}
        </button>

        {showGuide && (
          <div style={styles.guideBox}>
            <h4>📘 How Dice Game Works:</h4>
            <ul>
              <li>Set a bet and choose a target number (2–99)</li>
              <li>Pick "Under" or "Over"</li>
              <li>If the rolled number is in your favor, you win!</li>
              <li>
                Payout depends on the risk (closer to 50 is safer, lower payout)
              </li>
            </ul>
          </div>
        )}

        <div style={styles.historyBox}>
          <h4>🕒 Game History (Last 10):</h4>
          <ul style={{ fontSize: "14px", paddingLeft: "20px" }}>
            {history.map((game, i) => (
              <li key={i}>
                Bet {game.bet} | Target {game.target} |{" "}
                {game.over ? "Over" : "Under"} | 🎯 {game.rolled} →{" "}
                {game.win ? "✅ Win" : "❌ Lose"} | 💰 +{game.payout}
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
    maxWidth: "600px",
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
  toggle: {
    marginBottom: "20px",
    display: "flex",
    gap: "20px",
    color: "#ccc",
  },
  buttons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "20px",
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

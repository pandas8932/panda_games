import { useState } from "react";
import axios from "../api/axios";
import './Signin.css';

const Signin = ({ onSwitch }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("/auth/login", { identifier, password });
      localStorage.setItem("token", res.data.token);
      // Navigate or call success callback here, if you want
      window.location.href = "/home"; // You can replace this with navigate() if you're using react-router
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-wrapper slide-in">
      <div className="form-box">
        <h2>Welcome Back</h2>

        <form className="form" onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
          <p className="link-text">
            Don’t have an account? <span className="link" onClick={onSwitch}>Sign up</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signin;

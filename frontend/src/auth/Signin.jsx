import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import './Signin.css';

const SignIn = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", { identifier, password });
      localStorage.setItem("token", res.data.token);
      navigate("/homepage");
    } catch (err) {
      alert("Login failed");
    }
  };

 return (
  <div className="signin-container">
    <div className="signin-box">
      <h2 className="signin-title">Sign In</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email or Username</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Sign In</button>
      </form>

      <p className="auth-link">
        Don’t have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  </div>
);
};

export default SignIn;

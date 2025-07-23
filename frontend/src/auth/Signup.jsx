import { useState } from "react";
import axios from "../api/axios";
import "./Signup.css";

const Signup = ({ onSwitch }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("/auth/register", form);
      onSwitch(); // Go to sign-in on successful register
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-wrapper slide-in">
      <div className="form-box">
        <h2>Create Your Account</h2>

        <form className="form" onSubmit={handleRegister}>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
          <p className="link-text">
            Already have an account? <span className="link" onClick={onSwitch}>Sign in</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;

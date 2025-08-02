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
      onSwitch();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-wrapper slide-in">
      <div className="form-container">
      
        <form className="form" onSubmit={handleRegister}>
            <h1 className="form-heading">Create Your Account</h1>
          {error && <div className="error-message">{error}</div>}
<div className="inputs">
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            required
          />
           <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
          </div>
         
          <p className="link-text">
            Already have an account? <span className="link" onClick={onSwitch}>Sign in</span>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Signup;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import './Signup.css';

const SignUp = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.post("/auth/register", form);
      navigate("/signin", { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">Create Your Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              name="username" 
              type="text" 
              value={form.username} 
              onChange={handleChange} 
              required 
              placeholder="Enter your username"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              placeholder="Enter your email"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input 
              id="phone"
              name="phone" 
              type="tel" 
              value={form.phone} 
              onChange={handleChange} 
              required 
              placeholder="Enter your phone number"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              name="password" 
              type="password" 
              value={form.password} 
              onChange={handleChange} 
              required 
              placeholder="Create a password"
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
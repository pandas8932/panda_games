import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import './Signup.css'

const SignUp = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/register", form);
      alert("Registered successfully");
      navigate("/signin");
    } catch (err) {
      alert("Registration failed");
    }
  };

return (
  <div className="signup-container">
    <div className="signup-box">
      <h2 className="signup-title">Sign Up</h2>
      <form onSubmit={handleRegister}>
        <div className="input-group">
          <label>Username</label>
          <input name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="submit-btn">Sign Up</button>
      </form>

      <p className="auth-link">
        Already have an account? <Link to="/signin">Sign In</Link>
      </p>
    </div>
  </div>
);
};

export default SignUp;

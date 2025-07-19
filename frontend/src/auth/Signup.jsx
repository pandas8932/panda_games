import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "./signup.css";

const Signup = () => {
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
    <div className="split-container">
      {/* Left Side */}
      <div className="left-side">
        <img
          src="https://res.cloudinary.com/diilqdk7o/image/upload/v1752903396/ChatGPT_Image_Jul_19_2025_10_11_28_AM_ilrnam.png"
          alt="Visual"
          className="side-image"
        />
        <div className="pandagames-text">
          {"PandaGames".split("").map((char, index) => (
            <span className={`char char-${index}`} key={index}>
              {char}
            </span>
          ))}
        </div>
      </div>

      {/* Right Side */}
      <div className="right-side">
        <div className="right-background"></div>

        <div className="custom-heading">Create Your Account</div>

        <form className="signup-form" onSubmit={handleRegister}>
          {error && <div className="error-message">{error}</div>}

          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            className="custom-input input-username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="custom-input input-email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            className="custom-input input-phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            className="custom-input input-password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />
          <button
            type="submit"
            className="custom-button"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "SIGN UP"}
          </button>

          <p className="signin-text">
            Already have an account?{" "}
            <Link to="/signin" className="signin-link">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;

import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const backgroundImage =
    "https://res.cloudinary.com/diilqdk7o/image/upload/v1752764921/theme_wtxhtw.jpg";
  const navigate = useNavigate();

  return (
    <div
      className="landing-page"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="content-wrapper">
        <h1 className="panda-title">
          <span className="word word1">PANDA</span>
          <span className="word word2">GAMES</span>
        </h1>
        <button className="sign-in-button" onClick={() => navigate("/signin")}>
          Login
        </button>
        <p className="register-text">
          New user?{" "}
          <span className="register-link" onClick={() => navigate("/signup")}>
            Click here to register
          </span>
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
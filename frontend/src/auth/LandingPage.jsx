import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const [shrink, setShrink] = useState(false);
  const navigate = useNavigate();

  const handleEnter = () => {
    setShrink(true);
    setTimeout(() => {
      navigate("/auth", { state: { fromLanding: true } });
    }, 1000); // Match CSS
  };

  return (
    <div className={`landing-wrapper ${shrink ? "shrink-active" : ""}`}>
      <div
        className="landing-content"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/diilqdk7o/image/upload/v1753069752/Resize_image_project_zvycai.png')",
        }}
      >
        {!shrink && (
          <div className="text-wrapper">
            <h1 className="panda-title">
              <span className="panda-text" data-text="Panda">Panda</span>
              <span className="games-text" data-text="Games">Games</span>
            </h1>
            <button className="sign-in-button" onClick={handleEnter}>Enter</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;

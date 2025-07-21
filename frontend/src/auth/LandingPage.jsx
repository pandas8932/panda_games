import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const [animateExit, setAnimateExit] = useState(false);
  const navigate = useNavigate();

  const backgroundImage =
    "https://res.cloudinary.com/diilqdk7o/image/upload/v1753069752/Resize_image_project_zvycai.png";

  const handleEnter = () => {
    setAnimateExit(true);
    setTimeout(() => {
      navigate("/signup");
    }, 1000); // Match with animation duration
  };

  return (
    <div
      className={`landing-page ${animateExit ? "slide-left-out" : ""}`}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="content-wrapper">
        <h1 className="panda-title">
          <span className="panda-text" data-text="Panda">Panda</span>
          <span className="games-text" data-text="Games">Games</span>
        </h1>

        <button className="sign-in-button" onClick={handleEnter}>
          Enter
        </button>
      </div>
    </div>
  );
};

export default LandingPage;

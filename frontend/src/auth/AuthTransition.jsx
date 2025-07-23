import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Signup from "./Signup";
import Signin from "./Signin";
import "./authtransition.css";

const AuthTransition = () => {
  const [showSignin, setShowSignin] = useState(false);
  const [animating, setAnimating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.fromLanding) {
      setShowSignin(false); // Start with Signup if from landing
    }
  }, [location]);

  const handleSwitch = () => {
    setAnimating(true);
    setTimeout(() => {
      setShowSignin(prev => !prev);
      setAnimating(false);
    }, 800);
  };

  return (
    <div className={`auth-wrapper ${animating ? "animating" : ""} ${showSignin ? "show-signin" : "show-signup"}`}>
      <div className="auth-bg" />
      <div className="auth-form">
        {showSignin ? <Signin onSwitch={handleSwitch} /> : <Signup onSwitch={handleSwitch} />}
      </div>
    </div>
  );
};

export default AuthTransition;

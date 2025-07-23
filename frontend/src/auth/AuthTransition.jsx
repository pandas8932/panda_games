import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Signup from "./Signup";
import Signin from "./Signin";
import "./AuthTransition.css";

const AuthTransition = () => {
  const [view, setView] = useState("signup");
  const [transitionState, setTransitionState] = useState("idle");
  const location = useLocation();

  useEffect(() => {
    if (location.state?.fromLanding) {
      setView("signup");
    }
  }, [location]);

  const handleSwitch = () => {
    if (transitionState !== "idle") return;
    setTransitionState("exiting");
    setTimeout(() => {
      setView((prev) => (prev === "signup" ? "signin" : "signup"));
      setTransitionState("idle");
    }, 800);
  };

  const FormComponent = view === "signup" ? Signup : Signin;

  return (
   <div className={`auth-wrapper view-${view} transition-${transitionState}`}>
  <div className="auth-bg">
    {view === "signup" && (
      <div className="auth-text-wrapper">
        <h1 className="auth-panda-title">
          <div className="auth-word">
            <span className="letter slide-top" style={{ animationDelay: "0s" }} data-text="P">P</span>
            <span className="letter slide-right" style={{ animationDelay: "0.2s" }} data-text="A">A</span>
            <span className="letter slide-left" style={{ animationDelay: "0.4s" }} data-text="N">N</span>
            <span className="letter slide-bottom" style={{ animationDelay: "0.6s" }} data-text="D">D</span>
            <span className="letter slide-top" style={{ animationDelay: "0.8s" }} data-text="A">A</span>
          </div>
          <div className="auth-word">
            <span className="letter slide-left" style={{ animationDelay: "1s" }} data-text="G">G</span>
            <span className="letter slide-top" style={{ animationDelay: "1.2s" }} data-text="A">A</span>
            <span className="letter slide-right" style={{ animationDelay: "1.4s" }} data-text="M">M</span>
            <span className="letter slide-bottom" style={{ animationDelay: "1.6s" }} data-text="E">E</span>
            <span className="letter slide-top" style={{ animationDelay: "1.8s" }} data-text="S">S</span>
          </div>
        </h1>
      </div>
    )}

  {view === "signin" && (
  <div className="auth-text-wrapper-signin">
    <div className="signin-word-wrapper">
      <div className="signin-word">
        {"PANDA".split("").map((char, i) => (
          <span
            key={`p${i}`}
            className="signin-letter bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
            data-text={char}
          >
            {char}
          </span>
        ))}
      </div>
      <div className="signin-word">
        {"GAMES".split("").map((char, i) => (
          <span
            key={`g${i}`}
            className="signin-letter flip"
            style={{ animationDelay: `${1 + i * 0.2}s` }}
            data-text={char}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  </div>
)}
  </div>

  <div className="auth-form-container">
    <FormComponent onSwitch={handleSwitch} />
  </div>
</div>
  );
};

export default AuthTransition;

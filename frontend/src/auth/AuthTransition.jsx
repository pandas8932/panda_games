import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Signup from "./Signup";
import Signin from "./Signin";
import "./AuthTransition.css";

const AuthTransition = () => {
  // 'view' tracks which component to show: 'signup' or 'signin'
  const [view, setView] = useState("signup");
  // 'transitionState' tracks the animation: 'idle' or 'exiting'
  const [transitionState, setTransitionState] = useState("idle");

  const location = useLocation();

  useEffect(() => {
    // This logic to handle navigation from the landing page remains the same
    if (location.state?.fromLanding) {
      setView("signup");
    }
  }, [location]);

  const handleSwitch = () => {
    // 1. Don't do anything if an animation is already running
    if (transitionState !== "idle") return;

    // 2. Start the exit animation
    setTransitionState("exiting");

    // 3. Wait for the animation to finish (must match CSS duration)
    setTimeout(() => {
      // 4. After the animation, swap the component view
      setView(prev => (prev === "signup" ? "signin" : "signup"));
      // 5. Reset the animation state to 'idle' so the new component is in its final position
      setTransitionState("idle");
    }, 400); // This duration must match the 'transition' time in your CSS
  };

  // Conditionally choose the component to render based on the 'view' state
  const FormComponent = view === "signup" ? Signup : Signin;

  return (
    // The CSS classes are now driven by the new state variables
    <div className={`auth-wrapper view-${view} transition-${transitionState}`}>
      <div className="auth-bg" />
      <div className="auth-form-container">
        <FormComponent onSwitch={handleSwitch} />
      </div>
    </div>
  );
};

export default AuthTransition;

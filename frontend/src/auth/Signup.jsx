import "./signup.css";

const Signup = ({ onSwitch }) => {
  return (
    <div className="signup-wrapper slide-in">
      <div className="form-box">
        <h2>Create Your Account</h2>
        <form className="form">
          <input type="text" placeholder="Username" required />
          <input type="email" placeholder="Email" required />
          <input type="tel" placeholder="Phone" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Sign Up</button>
          <p className="link-text">
            Already have an account? <span className="link" onClick={onSwitch}>Sign in</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;

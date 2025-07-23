import "./Signin.css";

const Signin = ({ onSwitch }) => {
  return (
    <div className="signin-wrapper slide-in">
      <div className="form-box">
        <h2>Welcome Back</h2>
        <form className="form">
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Sign In</button>
          <p className="link-text">
            Don’t have an account? <span className="link" onClick={onSwitch}>Sign up</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signin;

import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <nav className="home-nav">
          <div className="nav-logo">YourLogo</div>
          <div className="nav-links">
            <Link to="/features" className="nav-link">Features</Link>
            <Link to="/pricing" className="nav-link">Pricing</Link>
            <Link to="/about" className="nav-link">About</Link>
          </div>
          <div className="nav-auth">
            <Link to="/signin" className="auth-link secondary">Sign In</Link>
            <Link to="/signup" className="auth-link primary">Get Started</Link>
          </div>
        </nav>
      </header>

      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Build something <span className="highlight">amazing</span> today
          </h1>
          <p className="hero-subtitle">
            Our platform helps you create, collaborate, and grow your projects faster than ever before.
          </p>
          <div className="hero-cta">
            <Link to="/signup" className="cta-button primary">Start for free</Link>
            <Link to="/demo" className="cta-button secondary">See demo</Link>
          </div>
        </div>
        <div className="hero-image">
          {/* Placeholder for hero image - would be replaced with actual image */}
          <div className="image-placeholder"></div>
        </div>
      </main>

      <section className="features-section">
        <h2 className="section-title">Why choose us</h2>
        <div className="features-grid">
          {[
            {
              icon: '⚡',
              title: 'Lightning Fast',
              description: 'Optimized for performance with instant load times'
            },
            {
              icon: '🔒',
              title: 'Secure',
              description: 'Enterprise-grade security for your peace of mind'
            },
            {
              icon: '🔄',
              title: 'Always Updated',
              description: 'Regular updates with new features and improvements'
            }
          ].map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-logo">YourLogo</div>
          <div className="footer-links">
            <Link to="/privacy" className="footer-link">Privacy</Link>
            <Link to="/terms" className="footer-link">Terms</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Your Company. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
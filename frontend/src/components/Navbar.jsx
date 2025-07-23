import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaUserCircle } from 'react-icons/fa';
import axios from '../api/axios'; // ✅ updated import

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [coins, setCoins] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username || 'User');
        fetchUserData(token);
      } catch (err) {
        console.error('Token decoding failed:', err);
      }
    }

    // 🟡 Listen for coin updates after gameplay
    const handleCoinsUpdate = (e) => {
      if (e.detail?.coins != null) {
        setCoins(e.detail.coins);
      }
    };

    window.addEventListener('coinsUpdated', handleCoinsUpdate);

    // 🔁 Cleanup on unmount
    return () => {
      window.removeEventListener('coinsUpdated', handleCoinsUpdate);
    };
  }, []);

  const fetchUserData = async (token) => {
    try {
      const res = await axios.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = res.data;
      setUsername(data.username);
      setCoins(data.coins);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUsername('');
    setCoins(0);
    navigate('/signin');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <Link to="/" style={styles.link}>GameHub</Link>
      </div>
      <div style={styles.centerText}>
        {isLoggedIn && <span style={styles.greeting}>Hello, {username}!</span>}
      </div>
      <div style={styles.links}>
        {isLoggedIn ? (
          <div style={styles.profileContainer}>
            <FaUserCircle size={24} onClick={() => setShowDropdown(!showDropdown)} style={{ cursor: 'pointer' }} />
            {showDropdown && (
              <div style={styles.dropdown}>
                <p><strong>Coins:</strong> {coins}</p>
                <button onClick={handleLogout} style={styles.dropdownButton}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/signin" style={styles.link}>Sign In</Link>
            <Link to="/signup" style={styles.link}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#282c34',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    position: 'relative',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  centerText: {
    fontSize: '16px',
  },
  greeting: {
    color: 'white',
    marginRight: '20px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
  },
  profileContainer: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: '35px',
    right: 0,
    backgroundColor: '#444',
    border: '1px solid #666',
    borderRadius: '5px',
    padding: '10px',
    minWidth: '120px',
    zIndex: 1000,
  },
  dropdownButton: {
    background: 'none',
    border: '1px solid white',
    color: 'white',
    padding: '5px 10px',
    cursor: 'pointer',
    borderRadius: '4px',
    marginTop: '10px',
    width: '100%',
  },
};

export default Navbar;

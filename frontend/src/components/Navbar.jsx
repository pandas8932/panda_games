import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaUserCircle, FaSearch } from 'react-icons/fa';
import axios from '../api/axios';

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

    const handleCoinsUpdate = (e) => {
      if (e.detail?.coins != null) {
        setCoins(e.detail.coins);
      }
    };

    window.addEventListener('coinsUpdated', handleCoinsUpdate);

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
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      {/* Profile Icon (replacing yellow dot) */}
      <div style={styles.profileIcon}>
        {isLoggedIn ? (
          <FaUserCircle 
            size={32} 
            onClick={() => setShowDropdown(!showDropdown)} 
            style={{ cursor: 'pointer', color: '#FFD700' }} 
          />
        ) : (
          <FaUserCircle size={32} style={{ color: '#FFD700' }} />
        )}
        {showDropdown && (
          <div style={styles.dropdown}>
            <p><strong>Coins:</strong> {coins}</p>
            <button onClick={handleLogout} style={styles.dropdownButton}>Logout</button>
          </div>
        )}
      </div>
      
      {/* Navigation Links */}
      <div style={styles.navLinks}>
        <Link to="/home" style={styles.navLink}>HOME</Link>
        <Link to="/" style={styles.navLink}>SHOP</Link>
        <Link to="/history" style={styles.navLink}>HISTORY</Link>
      </div>
      
      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBar}>
          <div style={styles.searchToggle}></div>
          <span style={styles.searchText}>Find a game</span>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundImage: 'url(https://res.cloudinary.com/diilqdk7o/image/upload/v1754966408/ChatGPT_Image_Aug_12_2025_08_07_52_AM_fen2lj.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    position: 'relative',
    height: '60px',
  },
  profileIcon: {
    flexShrink: 0,
    position: 'relative',
  },
  navLinks: {
    display: 'flex',
    gap: '30px',
    marginLeft: '20px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '14px',
    letterSpacing: '1px',
  },
  searchContainer: {
    marginLeft: 'auto',
  },
  searchBar: {
    backgroundColor: '#E0E0E0', // Light grey
    borderRadius: '20px',
    padding: '8px 15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: '150px',
  },
  searchToggle: {
    width: '12px',
    height: '12px',
    backgroundColor: 'black',
    borderRadius: '50%',
    border: '2px solid white',
  },
  searchText: {
    color: 'black',
    fontSize: '14px',
  },
  dropdown: {
    position: 'absolute',
    top: '35px',
    left: 0,
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

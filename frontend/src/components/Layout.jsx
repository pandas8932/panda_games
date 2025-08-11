import React from 'react';
import Navbar from './Navbar';
import { Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/signin' || location.pathname === '/signup';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main style={{ 
        paddingTop: hideNavbar ? 0 : '70px',
        backgroundColor: 'transparent',
        margin: 0,
        padding: hideNavbar ? 0 : '70px 0 0 0'
      }}>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;


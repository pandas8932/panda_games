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
        backgroundColor: 'transparent',
        margin: 0,
        padding: 0
      }}>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;


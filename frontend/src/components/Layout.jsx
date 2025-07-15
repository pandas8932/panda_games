import React from 'react';
import Navbar from './Navbar';
import { Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/signin' || location.pathname === '/signup';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main style={{ paddingTop: hideNavbar ? 0 : '70px' }}>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;


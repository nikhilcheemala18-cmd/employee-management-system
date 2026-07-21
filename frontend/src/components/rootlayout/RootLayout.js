import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link, Outlet } from 'react-router-dom';
import './RootLayout.css';
import LandingPage from '../landing/LandingPage';

const RootLayout = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <div className="public-shell">
      <nav className="landing-nav">
        <div className="landing-nav__inner">
          <Link className="landing-nav__brand" to="/">
            Employee Management
          </Link>

          <div className="landing-nav__links">
            <Link className="app-button app-button--soft" to="/ownerLogin">
              Owner Portal
            </Link>
            <Link className="app-button app-button--soft" to="/operatorLogin">
              Operator Portal
            </Link>
            <Link className="app-button app-button--primary text-white" to="/adminLogin">
              Admin Portal
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow-1 mb-4">
        {isLandingPage ? <LandingPage /> : <Outlet />}
      </main>
    </div>
  );
};

export default RootLayout;

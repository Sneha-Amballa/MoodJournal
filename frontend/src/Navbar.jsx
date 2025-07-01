import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/auth');
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h1 className="title">
          <span className="blue">Mood</span>
          <span className="purple">Journal</span>
        </h1>
      </div>
      <div className="navbar-right">
        <a
          href="/journal"
          className={`nav-link ${location.pathname === '/journal' ? 'active' : ''}`}
        >
          Journal
        </a>
        <a
          href="/dashboard"
          className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          Dashboard
        </a>
        <button className="signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Navbar;

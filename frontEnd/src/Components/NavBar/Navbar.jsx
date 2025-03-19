import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          SumDoc
        </Link>
        <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <ul>
            <li className="nav-item">
              <Link to="/" className="nav-links">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/AI" className="nav-links">
                AI
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/documents" className="nav-links">
              Documents
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-links">
                about
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/login" className="nav-links">
                Login
              </Link>
            </li>
          </ul>
        </div>
        <div className="hamburger" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
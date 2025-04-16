import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/Home.css';

export const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="main-header">
      <div className="restaurant-name">Nero</div>

      {/* Hamburger-icon */}
      <div className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      <nav className={`main-nav ${isOpen ? 'show' : ''}`}>
        <ul>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/booking">Booking</NavLink>
          </li>
          <li>
            <NavLink to="/contact">Contact</NavLink>
          </li>
          <li>
            <NavLink to="/admin" className="admin-link">
              Admin
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

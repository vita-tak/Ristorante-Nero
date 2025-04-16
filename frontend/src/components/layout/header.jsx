import { NavLink } from 'react-router-dom';
import '../../styles/Nav.css';

export const Header = () => {
  return (
    <nav>
      <ul>
        <li>
          <NavLink to='/'>Home</NavLink>
        </li>
        <li>
          <NavLink to='/booking'>Booking</NavLink>
        </li>
        <li>
          <NavLink to='/contact'>Contact</NavLink>
        </li>
        <li>
          <NavLink to='/admin'>Admin</NavLink>
        </li>
      </ul>
    </nav>
  );
};

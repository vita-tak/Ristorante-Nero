import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../styles/Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📧 Form submitted:', formData);
    // Here you would typically send the data to a server
    alert('Message sent! Thank you for contacting us.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className='contact-page-wrapper'>
      {/* Navigation Header */}
      <header className='main-header'>
        <Link to='/' className='restaurant-name'>
          Nero
        </Link>

        {/* Hamburger menu for mobile */}
        <div className='hamburger' onClick={toggleMenu}>
          <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${isMenuOpen ? 'open' : ''}`}></div>
        </div>

        <nav className={`main-nav ${isMenuOpen ? 'show' : ''}`}>
          <ul>
            <li>
              <NavLink to='/'>HOME</NavLink>
            </li>
            <li>
              <NavLink to='/booking'>BOOKING</NavLink>
            </li>
            <li>
              <NavLink to='/contact'>CONTACT</NavLink>
            </li>
            <li>
              <NavLink to='/admin' className='admin-link'>
                ADMIN
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>

      <div className='contact-content'>
        <div className='contact-form-container'>
          <h2>Contact Us</h2>
          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label htmlFor='name'>Name</label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='email'>Email</label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='message'>Message</label>
              <textarea
                id='message'
                name='message'
                value={formData.message}
                onChange={handleChange}
                required></textarea>
            </div>

            <button type='submit' className='submit-btn'>
              Send
            </button>
          </form>
        </div>

        <div className='opening-hours-container'>
          <h2>Opening hours</h2>
          <div className='hours-grid'>
            <div className='days-column'>
              <p>Monday - Thursday</p>
              <p>Friday - Saturday</p>
              <p>Sunday</p>
            </div>
            <div className='times-column'>
              <p>10:00 - 23:00</p>
              <p>12:00 - 23:30</p>
              <p>Closed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className='main-footer'>
        <div className='footer-content'>
          <p className='copyright'>
            © 2025 Ristorante Nero – True taste of Italian tradition
          </p>
        </div>
      </footer>
    </div>
  );
}

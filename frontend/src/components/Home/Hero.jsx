import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="hero-dark">
      <div className="hero-inner-wrapper">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Welcome to Ristorante Nero</h1>
          <p>Fine Neapolitan Dining Experience</p>
          <Link to="/booking">
            <button>Book a Table</button>
          </Link>
        </div>
      </div>
      <div className="scroll-down">
        <a href="#menu">↓ Scroll to menu</a>
      </div>
    </section>
  );
};

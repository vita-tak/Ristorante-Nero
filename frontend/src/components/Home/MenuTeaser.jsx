import margherita from '../../assets/menu/margherita.jpg';
import pappardelle from '../../assets/menu/pappardelle.jpg';
import tiramisu from '../../assets/menu/tiramisu.jpg';

export const MenuTeaser = () => {
  return (
    <section id='menu' className='menu-fullscreen'>
      <div className='menu-overlay'></div>

      <div className='menu-teaser'>
        <h2>Our Signature Dishes</h2>
        <p className='menu-subtitle'>
          A taste of Naples – handcrafted with love and fire
        </p>

        <div className='menu-cards'>
          <div className='menu-card'>
            <div
              className='menu-image'
              style={{ backgroundImage: `url(${margherita})` }}></div>
            <div className='menu-text'>
              <h3>Margherita Napoletana</h3>
              <p>
                San Marzano tomato, mozzarella di bufala, fresh basil, olive oil
              </p>
            </div>
          </div>

          <div className='menu-card'>
            <div
              className='menu-image'
              style={{ backgroundImage: `url(${pappardelle})` }}></div>
            <div className='menu-text'>
              <h3>Pappardelle al Ragù</h3>
              <p>
                Slow-cooked beef & pork ragù with homemade pappardelle pasta
              </p>
            </div>
          </div>

          <div className='menu-card'>
            <div
              className='menu-image'
              style={{ backgroundImage: `url(${tiramisu})` }}></div>
            <div className='menu-text'>
              <h3>Tiramisu Nero</h3>
              <p>Classic Italian tiramisu with a touch of espresso liqueur</p>
            </div>
          </div>
        </div>
      </div>

      <footer className='main-footer'>
        <div className='footer-content'>
          <p className='copyright'>
            © 2025 Ristorante Nero – True taste of Italian tradition
          </p>
        </div>
      </footer>
    </section>
  );
};

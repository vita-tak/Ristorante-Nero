import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Booking.css';
import blockchainService from '../services/blockchain';
import bookingStorage from '../utils/bookingStorage';

function Booking() {
  // State for hamburger menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle hamburger menu
  const toggleMenu = () => {
    console.log('🍔 Toggling menu state');
    setIsMenuOpen(!isMenuOpen);
  };

  // Debug log to confirm component rendering
  useEffect(() => {
    console.log('🚀 Booking component rendered');

    // Check blockchain connection on component mount
    const checkBlockchainStatus = async () => {
      try {
        console.log(
          '🔍 Checking blockchain initialization status on component mount'
        );
        await blockchainService.initialize();
        console.log(
          '✅ Blockchain service initialized with mock data:',
          blockchainService.useMockData
        );
      } catch (error) {
        console.error('❌ Failed to initialize blockchain on mount:', error);
      }
    };

    checkBlockchainStatus();

    // Add listener for blockchain timeout events
    const handleBlockchainTimeout = (event) => {
      console.log('⏰ Blockchain timeout event received:', event.detail);

      // Handle availability check timeout
      if (
        event.detail.operation === 'checkAvailability' &&
        isCheckingAvailability
      ) {
        console.log('🔄 Forcing availability check to complete');
        setIsCheckingAvailability(false);
        setAvailabilityChecked(true);
        setTablesAvailable(true); // Assume tables are available to let user continue
        console.log('🛑 Forced tables available state after timeout');
      }
    };

    window.addEventListener('blockchain_timeout', handleBlockchainTimeout);

    // Cleanup
    return () => {
      window.removeEventListener('blockchain_timeout', handleBlockchainTimeout);
    };
  }, []);

  // State for form inputs
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [tablesAvailable, setTablesAvailable] = useState(false);

  // State for booking form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);

  // Loading states
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // State for warnings and errors
  const [warningMessage, setWarningMessage] = useState('');

  // Handle availability check using blockchain service
  const checkAvailability = async () => {
    if (!date) {
      console.log('⚠️ Date is required to check availability');
      setWarningMessage('Please select a date to check availability.');
      return;
    }

    // Clear any previous warnings
    setWarningMessage('');
    console.log('🚦 STARTING availability check flow');
    setIsCheckingAvailability(true);
    console.log('🔍 Checking availability...', { numberOfPeople, date, time });

    try {
      // Set a UI timeout in case the blockchain service doesn't respond
      const uiTimeout = setTimeout(() => {
        if (isCheckingAvailability) {
          console.log(
            '⏱️ UI timeout for availability check, forcing completion'
          );
          setIsCheckingAvailability(false);
          setAvailabilityChecked(true);
          setTablesAvailable(true); // Assume tables are available to let user continue
          console.log('🛑 Forced tables available state after timeout');
        }
      }, 20000); // 20 second UI timeout

      // Convert time from "18:00" format to integer 18
      const timeValue = parseInt(time.split(':')[0]);
      console.log('⏲️ Converted time value:', timeValue);

      // Add log to show we're calling the blockchain service
      console.log('☎️ Calling blockchain service checkAvailability method');

      // Check availability using blockchain service
      const availabilityResult = await blockchainService.checkAvailability(
        date,
        timeValue,
        numberOfPeople
      );

      console.log('✅ Blockchain service returned:', availabilityResult);
      clearTimeout(uiTimeout);

      // Critical fix: Use a single atomic update for all state changes to prevent race conditions
      console.log('🔄 Updating all state variables at once');

      // First check if there are no tables available at all
      if (!availabilityResult.available) {
        console.log('❌ No tables available for this date and time');
        setWarningMessage(
          `No tables available for this date and time. All ${availabilityResult.totalTables} tables are booked.`
        );
        setIsCheckingAvailability(false);
        setAvailabilityChecked(true);
        setTablesAvailable(false);
        return;
      }

      // If there are tables available but also existing bookings, show warning and prevent proceeding
      if (availabilityResult.tablesBooked > 0) {
        console.log(
          '⚠️ Bookings already exist for this date and time:',
          availabilityResult.tablesBooked
        );

        // Display elegant warning message and prevent proceeding
        setWarningMessage(
          `This time slot (${date} at ${time}) already has ${
            availabilityResult.tablesBooked
          } existing ${
            availabilityResult.tablesBooked === 1 ? 'booking' : 'bookings'
          }. Please select a different date or time to avoid duplicate bookings.`
        );
        setIsCheckingAvailability(false);
        return;
      }

      // Tables are available and no existing bookings
      console.log(
        `🍽️ Tables AVAILABLE: ${availabilityResult.tablesAvailable} of ${availabilityResult.totalTables} tables remaining`
      );
      setIsCheckingAvailability(false);
      setAvailabilityChecked(true);
      setTablesAvailable(true);
    } catch (error) {
      console.error('❌ Error checking availability:', error);
      setWarningMessage('Error checking availability. Please try again.');
      console.log('🔄 Resetting isCheckingAvailability due to error');
      setIsCheckingAvailability(false);
    } finally {
      // Don't reset checking state here, it's handled in the try block
      console.log('🏁 COMPLETED availability check flow');
    }
  };

  // Handle form reset when clicking "Search again"
  const handleSearchAgain = () => {
    console.log('🔄 Searching again...');
    setAvailabilityChecked(false);
    setTablesAvailable(false);
    setBookingSuccess(false);
  };

  // Handle booking submission
  const handleBookTable = async (e) => {
    e.preventDefault();

    if (!gdprConsent) {
      console.log('⚠️ GDPR consent required!');
      return;
    }

    // Convert time from "18:00" format to integer 18
    const timeValue = parseInt(time.split(':')[0]);

    // Check for duplicate bookings with the same name before creating
    console.log('🔍 Checking for duplicate bookings with name:', name);

    try {
      const duplicateCheck = await blockchainService.checkAvailability(
        date,
        timeValue,
        numberOfPeople,
        name
      );

      // If a duplicate booking exists with the same name, prevent booking
      if (duplicateCheck.hasDuplicateBooking) {
        console.log('⚠️ Duplicate booking detected for name:', name);
        alert(
          `A booking already exists for ${name} on ${date} at ${time}. Please use a different name or choose another date/time.`
        );
        return;
      }

      // Otherwise, proceed with creating the booking
      setIsCreatingBooking(true);

      // Create booking data object
      const bookingData = {
        name,
        email,
        phone,
        date,
        time: timeValue,
        numberOfGuests: numberOfPeople,
      };

      console.log('📝 Creating booking with details:', bookingData);

      // Use bookingStorage to save the booking
      const result = await bookingStorage.saveBooking(bookingData);

      if (result.success) {
        console.log(`🎉 Booking successful! Booking ID: ${result.bookingId}`);
        setBookingSuccess(true);
      }
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  // Format today's date as YYYY-MM-DD for min date attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className='booking-page-wrapper'>
      {/* Navigation Header */}
      <header className='main-header'>
        <Link to='/' className='restaurant-name'>
          Nero
        </Link>

        {/* Hamburger menu icon */}
        <div
          className={`hamburger ${isMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}>
          <div className='bar'></div>
          <div className='bar'></div>
          <div className='bar'></div>
        </div>

        <nav className={`main-nav ${isMenuOpen ? 'show' : ''}`}>
          <ul>
            <li>
              <Link to='/'>HOME</Link>
            </li>
            <li>
              <Link to='/booking' className='active'>
                BOOKING
              </Link>
            </li>
            <li>
              <Link to='/contact'>CONTACT</Link>
            </li>
            <li>
              <Link to='/admin' className='admin-link'>
                ADMIN
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className='booking-page'>
        <div className='booking-container'>
          <h1>BOOK YOUR TABLE HERE</h1>

          {/* Warning Message */}
          {warningMessage && (
            <div className='warning-message'>
              <p>{warningMessage}</p>
            </div>
          )}

          {bookingSuccess ? (
            <div className='booking-success'>
              <h2>Thank you for your booking!</h2>
              <p>
                Your table has been reserved. We look forward to seeing you
                soon.
              </p>
              <button className='search-again-btn' onClick={handleSearchAgain}>
                Make another booking
              </button>
            </div>
          ) : !availabilityChecked ? (
            <div className='booking-form initial'>
              <p className='instruction'>
                Enter number of people and date to see available times.
              </p>

              <div className='form-group'>
                <label htmlFor='numberOfPeople'>Number of people</label>
                <select
                  id='numberOfPeople'
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <div className='form-group'>
                <label htmlFor='date'>Date</label>
                <input
                  type='date'
                  id='date'
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                  required
                />
              </div>

              <div className='time-selection'>
                <label className='time-label'>
                  <input
                    type='radio'
                    name='time'
                    value='18:00'
                    checked={time === '18:00'}
                    onChange={() => setTime('18:00')}
                  />
                  <span>18:00</span>
                </label>

                <label className='time-label'>
                  <input
                    type='radio'
                    name='time'
                    value='21:00'
                    checked={time === '21:00'}
                    onChange={() => setTime('21:00')}
                  />
                  <span>21:00</span>
                </label>
              </div>

              <button
                className='check-availability-btn'
                onClick={checkAvailability}
                disabled={!date || isCheckingAvailability}>
                {isCheckingAvailability ? 'Checking...' : 'Check availability'}
              </button>
            </div>
          ) : !tablesAvailable ? (
            <div className='no-tables-message'>
              <h2>No tables are available.</h2>
              <p>Please try a different date or number of guests.</p>
              <button className='search-again-btn' onClick={handleSearchAgain}>
                Search again
              </button>
            </div>
          ) : (
            <div className='booking-form details'>
              <form onSubmit={handleBookTable}>
                <div className='form-group'>
                  <label htmlFor='name'>Name</label>
                  <input
                    type='text'
                    id='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='email'>Email</label>
                  <input
                    type='email'
                    id='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='phone'>Phone number</label>
                  <input
                    type='tel'
                    id='phone'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className='gdpr-consent'>
                  <label>
                    <input
                      type='checkbox'
                      checked={gdprConsent}
                      onChange={(e) => setGdprConsent(e.target.checked)}
                      required
                    />
                    <span>
                      I consent to my information being stored in accordance
                      with GDPR.
                    </span>
                  </label>
                </div>

                <button
                  type='submit'
                  className='book-table-btn'
                  disabled={
                    !name ||
                    !email ||
                    !phone ||
                    !gdprConsent ||
                    isCreatingBooking
                  }>
                  {isCreatingBooking ? 'Processing...' : 'BOOK A TABLE'}
                </button>
              </form>
            </div>
          )}
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

export default Booking;

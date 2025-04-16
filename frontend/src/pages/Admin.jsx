import { useState, useEffect } from 'react';
import blockchainService from '../services/blockchain';
import bookingStorage from '../utils/bookingStorage';
import { validateBookingForm } from '../utils/validation';
import '../styles/Admin.css';
import { NavLink, Link } from 'react-router-dom';

function Admin() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('bookings');
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(5);

  const [bookingForm, setBookingForm] = useState({
    id: '',
    name: '',
    numberOfGuests: 1,
    date: '',
    time: 18,
    restaurantId: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const MAX_TABLES = 15;
  const GUESTS_PER_TABLE = 6;
  const TIME_SLOTS = [
    { value: 18, label: '18:00' },
    { value: 21, label: '21:00' },
  ];

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchBookings();
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar');
      const burgerMenu = document.querySelector('.burger-menu');

      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        burgerMenu &&
        !burgerMenu.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const data = await blockchainService.getRestaurants();
      setRestaurants(data);
      if (data.length > 0 && !selectedRestaurant) {
        setSelectedRestaurant(data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError('Failed to fetch restaurants');
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      // Use bookingStorage service instead of direct blockchain call
      const data = await bookingStorage.getAllBookings();
      console.log('📋 Admin: Fetched bookings', data);
      setBookings(data);
    } catch (err) {
      console.error('❌ Admin: Error fetching bookings', err);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    if (!newRestaurantName.trim()) return;

    setLoading(true);
    try {
      await blockchainService.createRestaurant(newRestaurantName);
      setNewRestaurantName('');
      setShowCreateForm(false);
      fetchRestaurants();
    } catch (err) {
      console.log(err);
      setError('Failed to create restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateBookingForm(bookingForm, GUESTS_PER_TABLE);

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    // Check table availability
    if (!isTableAvailable(bookingForm.date, bookingForm.time)) {
      setError('No tables available for the selected date and time');
      return;
    }

    setLoading(true);
    setFormErrors({});
    setError('');

    try {
      // Use bookingStorage service instead of direct blockchain call
      const result = await bookingStorage.saveBooking({
        numberOfGuests: bookingForm.numberOfGuests,
        name: bookingForm.name,
        date: bookingForm.date,
        time: bookingForm.time,
        email: 'admin@restaurant.com', // Default email for admin-created bookings
        phone: '000-000-0000', // Default phone for admin-created bookings
      });

      if (result.success) {
        console.log('✅ Admin: Booking created successfully', result);
        resetBookingForm();
        fetchBookings();
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (err) {
      console.error('❌ Admin: Error creating booking', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBooking = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateBookingForm(bookingForm, GUESTS_PER_TABLE);

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setLoading(true);
    setFormErrors({});
    setError('');

    try {
      // Use bookingStorage service instead of direct blockchain call
      const success = await bookingStorage.updateBooking({
        id: bookingForm.id,
        numberOfGuests: bookingForm.numberOfGuests,
        name: bookingForm.name,
        date: bookingForm.date,
        time: bookingForm.time,
        email: bookingForm.email || 'admin@restaurant.com',
        phone: bookingForm.phone || '000-000-0000',
      });

      if (success) {
        console.log('✅ Admin: Booking updated successfully');
        setIsEditing(false);
        resetBookingForm();
        fetchBookings();
      } else {
        throw new Error('Failed to update booking');
      }
    } catch (err) {
      console.error('❌ Admin: Error updating booking', err);
      setError('Failed to update booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use bookingStorage service instead of direct blockchain call
      const success = await bookingStorage.deleteBooking(id);

      if (success) {
        console.log('✅ Admin: Booking deleted successfully');
        fetchBookings();
      } else {
        throw new Error('Failed to delete booking');
      }
    } catch (err) {
      console.error('❌ Admin: Error deleting booking', err);
      setError('Failed to delete booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isTableAvailable = (date, time) => {
    const bookingsForDateTime = bookings.filter(
      (booking) => booking.date === date && booking.time === time
    );

    return bookingsForDateTime.length < MAX_TABLES;
  };

  const resetBookingForm = () => {
    setBookingForm({
      id: '',
      name: '',
      numberOfGuests: 1,
      date: '',
      time: 18,
      restaurantId: '',
    });
    setFormErrors({});
    setError('');
  };

  const startEditing = (booking) => {
    setBookingForm({
      id: booking.id,
      name: booking.name,
      numberOfGuests: booking.numberOfGuests,
      date: booking.date,
      time: booking.time,
      restaurantId: booking.restaurantId,
    });
    setIsEditing(true);
  };

  const formatTime = (time) => {
    return `${time}:00`;
  };

  const searchBookings = (bookingsArray, query) => {
    if (!query.trim()) return bookingsArray;

    const lowercaseQuery = query.toLowerCase();
    return bookingsArray.filter(
      (booking) =>
        booking.name.toLowerCase().includes(lowercaseQuery) ||
        booking.id.toString().includes(lowercaseQuery) ||
        booking.date.includes(lowercaseQuery) ||
        booking.numberOfGuests.toString().includes(lowercaseQuery) ||
        formatTime(booking.time).includes(lowercaseQuery)
    );
  };

  const getFilteredBookings = () => {
    return searchBookings(bookings, searchQuery);
  };

  const getCurrentBookings = () => {
    const filteredBookings = getFilteredBookings();
    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    return filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  };

  const getBookingsCount = (date) => {
    const counts = {};
    TIME_SLOTS.forEach((slot) => {
      counts[slot.value] = bookings.filter(
        (booking) => booking.date === date && booking.time === slot.value
      ).length;
    });
    return counts;
  };

  const getAvailableTables = (date) => {
    const bookingCounts = getBookingsCount(date);
    const available = {};

    TIME_SLOTS.forEach((slot) => {
      available[slot.value] = MAX_TABLES - bookingCounts[slot.value];
    });

    return available;
  };

  const getTotalAvailableTables = () => {
    return (
      getAvailableTables(selectedDate)[18] +
      getAvailableTables(selectedDate)[21]
    );
  };

  const getAvailableTablesForDate = (time) => {
    return getAvailableTables(selectedDate)[time];
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const formatDisplayDate = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateString === today) {
      return 'Today';
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='admin-container'>
      {/* Burger Menu */}
      <div className='burger-menu' onClick={toggleSidebar}>
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M3 12H21'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M3 6H21'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M3 18H21'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className='sidebar-header'>
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M12 2L2 7L12 12L22 7L12 2Z'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M2 17L12 22L22 17'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M2 12L12 17L22 12'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <h2>Restaurant Admin</h2>
        </div>

        <div className='restaurants-section'>
          <div className='section-header'>
            <h3>Restaurants</h3>
            <button
              className='add-button'
              onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? '×' : '+'}
            </button>
          </div>

          {showCreateForm && (
            <div className='create-restaurant-form'>
              <form onSubmit={handleCreateRestaurant}>
                <input
                  type='text'
                  value={newRestaurantName}
                  onChange={(e) => setNewRestaurantName(e.target.value)}
                  placeholder='Restaurant Name'
                  className='form-control'
                  required
                />
                <button
                  type='submit'
                  className='create-restaurant-btn'
                  disabled={loading}>
                  {loading ? 'Creating...' : 'Create Restaurant'}
                </button>
              </form>
            </div>
          )}

          <div className='restaurants-list'>
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className={`restaurant-item ${
                  selectedRestaurant?.id === restaurant.id ? 'active' : ''
                }`}
                onClick={() => {
                  setSelectedRestaurant(restaurant);
                  if (window.innerWidth <= 768) {
                    setSidebarOpen(false);
                  }
                }}>
                <div>{restaurant.name}</div>
                <div className='restaurant-rating'>ID: {restaurant.id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='main-content'>
        {selectedRestaurant && (
          <>
            <div className='dashboard-header'>
              <div>
                <h1 className='dashboard-title'>Restaurant Dashboard</h1>
                <p className='dashboard-subtitle'>
                  Manage bookings and restaurant information
                </p>
              </div>

              {/* Date Selector */}
              <div className='date-selector'>
                {/* <label>Viewing availability for:</label> */}
                <input
                  type='date'
                  value={selectedDate}
                  onChange={handleDateChange}
                  className='date-input'
                />
                {/* <span className="date-display">{formatDisplayDate(selectedDate)}</span> */}
              </div>
            </div>

            {/* Stats Grid */}
            <div className='stats-grid'>
              <div className='stat-card'>
                <div className='stat-label'>Total Bookings</div>
                <div className='stat-value'>{bookings.length}</div>
                <div className='stat-context'>+2 from yesterday</div>
                <div className='stat-icon'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M16 2V6'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M8 2V6'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M3 10H21'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
              </div>

              <div className='stat-card'>
                <div className='stat-label'>Available Tables</div>
                <div className='stat-value'>{getTotalAvailableTables()}</div>
                <div className='stat-context'>
                  For {formatDisplayDate(selectedDate)}
                </div>
                <div className='stat-icon'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M3 3H21V21H3V3Z'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M3 9H21'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M3 15H21'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M9 3V21'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M15 3V21'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
              </div>

              <div className='stat-card'>
                <div className='stat-label'>18:00 Sitting</div>
                <div className='stat-value'>
                  {getAvailableTablesForDate(18)}
                </div>
                <div className='stat-context'>Tables available</div>
                <div className='stat-icon'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'>
                    <circle
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M12 6V12L16 14'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
              </div>

              <div className='stat-card'>
                <div className='stat-label'>21:00 Sitting</div>
                <div className='stat-value'>
                  {getAvailableTablesForDate(21)}
                </div>
                <div className='stat-context'>Tables available</div>
                <div className='stat-icon'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'>
                    <circle
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M12 6V12L8 14'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className='tab-container'>
              <div className='tab-header'>
                <div
                  className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookings')}>
                  Bookings
                </div>
                <div
                  className={`tab ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}>
                  Restaurant Info
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'bookings' ? (
              <>
                {/* Bookings for Restaurant */}
                <div className='booking-section-header'>
                  <h3>Bookings for {selectedRestaurant.name}</h3>
                  <p>View and manage all reservations</p>
                </div>

                {/* Create New Booking Form */}
                <div className='booking-form'>
                  <h3>{isEditing ? 'Edit Booking' : 'Create New Booking'}</h3>
                  <form
                    onSubmit={
                      isEditing ? handleEditBooking : handleCreateBooking
                    }>
                    <div className='form-row'>
                      <div className='form-group'>
                        <label className='form-label'>Guest Name</label>
                        <input
                          type='text'
                          value={bookingForm.name}
                          onChange={(e) => {
                            setBookingForm({
                              ...bookingForm,
                              name: e.target.value,
                            });
                            if (formErrors.name) {
                              setFormErrors({ ...formErrors, name: null });
                            }
                          }}
                          className={`form-control ${
                            formErrors.name ? 'is-invalid' : ''
                          }`}
                          placeholder='Enter guest name'
                        />
                        {formErrors.name && (
                          <div className='error-message'>{formErrors.name}</div>
                        )}
                      </div>

                      <div className='form-group'>
                        <label className='form-label'>Number of Guests</label>
                        <input
                          type='number'
                          min='1'
                          max={GUESTS_PER_TABLE}
                          value={bookingForm.numberOfGuests}
                          onChange={(e) => {
                            setBookingForm({
                              ...bookingForm,
                              numberOfGuests: parseInt(e.target.value),
                            });
                            if (formErrors.numberOfGuests) {
                              setFormErrors({
                                ...formErrors,
                                numberOfGuests: null,
                              });
                            }
                          }}
                          className={`form-control ${
                            formErrors.numberOfGuests ? 'is-invalid' : ''
                          }`}
                        />
                        {formErrors.numberOfGuests && (
                          <div className='error-message'>
                            {formErrors.numberOfGuests}
                          </div>
                        )}
                      </div>

                      <div className='form-group'>
                        <label className='form-label'>Date</label>
                        <input
                          type='date'
                          value={bookingForm.date}
                          onChange={(e) => {
                            setBookingForm({
                              ...bookingForm,
                              date: e.target.value,
                            });
                            if (formErrors.date) {
                              setFormErrors({ ...formErrors, date: null });
                            }
                          }}
                          className={`form-control ${
                            formErrors.date ? 'is-invalid' : ''
                          }`}
                        />
                        {formErrors.date && (
                          <div className='error-message'>{formErrors.date}</div>
                        )}
                      </div>

                      <div className='form-group'>
                        <label className='form-label'>Time</label>
                        <select
                          value={bookingForm.time}
                          onChange={(e) => {
                            setBookingForm({
                              ...bookingForm,
                              time: parseInt(e.target.value),
                            });
                            if (formErrors.time) {
                              setFormErrors({ ...formErrors, time: null });
                            }
                          }}
                          className={`form-control ${
                            formErrors.time ? 'is-invalid' : ''
                          }`}>
                          {TIME_SLOTS.map((slot) => (
                            <option key={slot.value} value={slot.value}>
                              {slot.label}
                            </option>
                          ))}
                        </select>
                        {formErrors.time && (
                          <div className='error-message'>{formErrors.time}</div>
                        )}
                      </div>
                    </div>

                    <div className='form-actions'>
                      <button
                        type='submit'
                        className='btn btn-primary'
                        disabled={loading}>
                        {loading
                          ? 'Saving...'
                          : isEditing
                          ? 'Update Booking'
                          : 'Create Booking'}
                      </button>

                      {isEditing && (
                        <button
                          type='button'
                          onClick={() => {
                            setIsEditing(false);
                            resetBookingForm();
                          }}
                          className='btn btn-secondary'>
                          Cancel
                        </button>
                      )}
                    </div>

                    {error && <div className='error-message'>{error}</div>}
                  </form>
                </div>

                {/* Current Bookings */}
                <div className='current-bookings'>
                  <div className='booking-section-header'>
                    <h3>Current Bookings</h3>
                    <div className='search-container'>
                      <input
                        type='text'
                        className='search-input'
                        placeholder='Search bookings...'
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                      {searchQuery && (
                        <button
                          className='clear-search'
                          onClick={() => setSearchQuery('')}>
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  <div className='bookings-table'>
                    <table className='table'>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Guest Name</th>
                          <th>Guests</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCurrentBookings().length === 0 ? (
                          <tr>
                            <td colSpan='6' className='text-center'>
                              {searchQuery
                                ? 'No bookings match your search'
                                : 'No bookings found'}
                            </td>
                          </tr>
                        ) : (
                          getCurrentBookings().map((booking) => (
                            <tr key={booking.id}>
                              <td>{booking.id}</td>
                              <td>{booking.name}</td>
                              <td>{booking.numberOfGuests}</td>
                              <td>{booking.date}</td>
                              <td>{formatTime(booking.time)}</td>
                              <td>
                                <div className='flex gap-2'>
                                  <button
                                    onClick={() => startEditing(booking)}
                                    className='action-btn'
                                    style={{
                                      backgroundColor: 'var(--dark-warning)',
                                      marginRight: '8px',
                                    }}>
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteBooking(booking.id)
                                    }
                                    className='action-btn'
                                    style={{
                                      backgroundColor: 'var(--dark-danger)',
                                    }}
                                    disabled={loading}>
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {getFilteredBookings().length > 0 && (
                      <div className='pagination'>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className='pagination-button'>
                          &laquo; Prev
                        </button>

                        <div className='pagination-info'>
                          Page {currentPage} of{' '}
                          {Math.ceil(
                            getFilteredBookings().length / bookingsPerPage
                          )}
                        </div>

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(
                                prev + 1,
                                Math.ceil(
                                  getFilteredBookings().length / bookingsPerPage
                                )
                              )
                            )
                          }
                          disabled={
                            currentPage >=
                            Math.ceil(
                              getFilteredBookings().length / bookingsPerPage
                            )
                          }
                          className='pagination-button'>
                          Next &raquo;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className='restaurant-info-tab'>
                <div className='info-header'>
                  <h2>Restaurant Information</h2>
                  <p className='info-subtitle'>
                    Details about {selectedRestaurant.name}
                  </p>
                </div>

                <div className='info-cards-grid'>
                  {/* Capacity Card */}
                  <div className='info-card'>
                    <div className='info-card-header'>
                      <div className='info-card-icon'>
                        <svg
                          width='16'
                          height='16'
                          viewBox='0 0 24 24'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                      </div>
                      <h3>Capacity</h3>
                    </div>
                    <div className='info-card-content'>
                      <div className='info-data-row'>
                        <span className='info-label'>Tables:</span>
                        <span className='info-value'>{MAX_TABLES}</span>
                      </div>
                      <div className='info-data-row'>
                        <span className='info-label'>Guests per table:</span>
                        <span className='info-value'>
                          Up to {GUESTS_PER_TABLE}
                        </span>
                      </div>
                      <div className='info-data-row'>
                        <span className='info-label'>Maximum capacity:</span>
                        <span className='info-value'>
                          {MAX_TABLES * GUESTS_PER_TABLE} guests
                        </span>
                      </div>
                      <div className='info-data-row'>
                        <span className='info-label'>Times:</span>
                        <span className='info-value'>18:00 and 21:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Admin;

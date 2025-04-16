import blockchainService from '../services/blockchain';

class BookingStorage {
  constructor() {
    // Initialize local storage if needed
    if (!localStorage.getItem('bookings')) {
      localStorage.setItem('bookings', JSON.stringify([]));
    }
  }

  async saveBooking(bookingData) {
    console.log('📝 BookingStorage: Saving booking', bookingData);

    try {
      // First try to save to blockchain
      const result = await blockchainService.createBooking(bookingData);

      if (result.success) {
        // Also save to localStorage as backup
        this._saveToLocalStorage({
          id: result.bookingId,
          ...bookingData,
          createdAt: new Date().toISOString(),
        });

        console.log(
          '✅ BookingStorage: Booking saved successfully with ID:',
          result.bookingId
        );
        return result;
      } else {
        throw new Error('Blockchain booking creation failed');
      }
    } catch (error) {
      console.error(
        '❌ BookingStorage: Error saving to blockchain, using localStorage only',
        error
      );

      // Generate a unique ID for localStorage-only booking
      const localId = Date.now();

      // Save to localStorage only
      this._saveToLocalStorage({
        id: localId,
        ...bookingData,
        isLocalOnly: true,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        bookingId: localId,
        isLocalOnly: true,
      };
    }
  }

  /**
   * Get all bookings from both blockchain and localStorage
   * @returns {Promise<Array>} Combined array of bookings
   */
  async getAllBookings() {
    console.log('🔍 BookingStorage: Getting all bookings');

    try {
      // Get bookings from blockchain
      const blockchainBookings = await this._getBlockchainBookings();
      console.log(
        '📊 BookingStorage: Blockchain bookings:',
        blockchainBookings.length
      );

      // Get bookings from localStorage
      const localBookings = this._getLocalBookings();
      console.log(
        '💾 BookingStorage: Local-only bookings:',
        localBookings.filter((b) => b.isLocalOnly).length
      );

      // Merge and deduplicate bookings
      const allBookings = this._mergeBookings(
        blockchainBookings,
        localBookings
      );
      console.log(
        '🔄 BookingStorage: Total bookings after merge:',
        allBookings.length
      );

      return allBookings;
    } catch (error) {
      console.error(
        '❌ BookingStorage: Error getting bookings, falling back to localStorage',
        error
      );
      return this._getLocalBookings();
    }
  }

  /**
   * Update a booking
   * @param {Object} bookingData Updated booking data with id
   * @returns {Promise<boolean>} Success status
   */
  async updateBooking(bookingData) {
    if (!bookingData.id) {
      console.error('❌ BookingStorage: Cannot update booking without id');
      return false;
    }

    console.log('✏️ BookingStorage: Updating booking', bookingData.id);

    try {
      // Check if this is a local-only booking
      const localBookings = this._getLocalBookings();
      const existingBooking = localBookings.find(
        (b) => b.id === bookingData.id
      );

      if (existingBooking && existingBooking.isLocalOnly) {
        // Update in localStorage only
        this._updateLocalBooking(bookingData);
        return true;
      }

      // Try to update in blockchain
      await blockchainService.editBooking(
        bookingData.id,
        bookingData.numberOfGuests,
        bookingData.name,
        bookingData.date,
        bookingData.time
      );

      // Also update in localStorage
      this._updateLocalBooking(bookingData);

      console.log('✅ BookingStorage: Booking updated successfully');
      return true;
    } catch (error) {
      console.error('❌ BookingStorage: Error updating booking', error);

      // Still update localStorage as a fallback
      this._updateLocalBooking(bookingData);

      return true; // Return success anyway to avoid UI getting stuck
    }
  }

  /**
   * Delete a booking
   * @param {number} bookingId ID of booking to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteBooking(bookingId) {
    console.log('🗑️ BookingStorage: Deleting booking', bookingId);

    try {
      // Check if this is a local-only booking
      const localBookings = this._getLocalBookings();
      const existingBooking = localBookings.find((b) => b.id === bookingId);

      if (existingBooking && existingBooking.isLocalOnly) {
        // Delete from localStorage only
        this._deleteLocalBooking(bookingId);
        return true;
      }

      // Try to delete from blockchain
      await blockchainService.removeBooking(bookingId);

      // Also delete from localStorage
      this._deleteLocalBooking(bookingId);

      console.log('✅ BookingStorage: Booking deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ BookingStorage: Error deleting booking', error);

      // Still delete from localStorage as a fallback
      this._deleteLocalBooking(bookingId);

      return true; // Return success anyway to avoid UI getting stuck
    }
  }

  /**
   * Get a single booking by ID
   * @param {number} bookingId ID of booking to get
   * @returns {Promise<Object|null>} Booking data or null if not found
   */
  async getBookingById(bookingId) {
    console.log('🔍 BookingStorage: Getting booking by ID', bookingId);

    // Check localStorage first (faster)
    const localBookings = this._getLocalBookings();
    const localBooking = localBookings.find((b) => b.id === bookingId);

    if (localBooking) {
      console.log('✅ BookingStorage: Found booking in localStorage');
      return localBooking;
    }

    // If not in localStorage, try to get all bookings and find
    try {
      const allBookings = await this.getAllBookings();
      const booking = allBookings.find((b) => b.id === bookingId);

      if (booking) {
        console.log('✅ BookingStorage: Found booking in full dataset');
        return booking;
      }

      console.log('⚠️ BookingStorage: Booking not found');
      return null;
    } catch (error) {
      console.error('❌ BookingStorage: Error getting booking by ID', error);
      return null;
    }
  }

  // Private helper methods

  /**
   * Save a booking to localStorage
   * @private
   */
  _saveToLocalStorage(booking) {
    const bookings = this._getLocalBookings();
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }

  /**
   * Get bookings from localStorage
   * @private
   */
  _getLocalBookings() {
    return JSON.parse(localStorage.getItem('bookings') || '[]');
  }

  /**
   * Update a booking in localStorage
   * @private
   */
  _updateLocalBooking(updatedBooking) {
    const bookings = this._getLocalBookings();
    const updatedBookings = bookings.map((booking) =>
      booking.id === updatedBooking.id
        ? { ...booking, ...updatedBooking, updatedAt: new Date().toISOString() }
        : booking
    );

    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
  }

  /**
   * Delete a booking from localStorage
   * @private
   */
  _deleteLocalBooking(bookingId) {
    const bookings = this._getLocalBookings();
    const filteredBookings = bookings.filter(
      (booking) => booking.id !== bookingId
    );
    localStorage.setItem('bookings', JSON.stringify(filteredBookings));
  }

  /**
   * Get bookings from blockchain
   * @private
   */
  async _getBlockchainBookings() {
    try {
      await blockchainService.initialize();
      const bookingIds = await blockchainService.getBookingsByRestaurantId(
        blockchainService.restaurantId
      );

      // We need to fetch additional data for each booking
      const bookings = await Promise.all(
        bookingIds.map(async (bookingId) => {
          try {
            const booking = await blockchainService.contract.bookings(
              bookingId
            );
            return {
              id: Number(booking.id),
              numberOfGuests: Number(booking.numberOfGuests),
              name: booking.name,
              date: booking.date,
              time: Number(booking.time),
              restaurantId: Number(booking.restaurantId),
            };
          } catch (error) {
            console.error(
              `Error fetching blockchain booking ${bookingId}:`,
              error
            );
            return null;
          }
        })
      );

      return bookings.filter((booking) => booking !== null);
    } catch (error) {
      console.error('Failed to get blockchain bookings:', error);
      return [];
    }
  }

  /**
   * Merge blockchain and localStorage bookings, removing duplicates
   * @private
   */
  _mergeBookings(blockchainBookings, localBookings) {
    // Create a map of all blockchain bookings
    const blockchainBookingsMap = new Map();
    blockchainBookings.forEach((booking) => {
      blockchainBookingsMap.set(booking.id, booking);
    });

    // Add local-only bookings
    const mergedBookings = [...blockchainBookings];

    localBookings.forEach((localBooking) => {
      if (
        localBooking.isLocalOnly ||
        !blockchainBookingsMap.has(localBooking.id)
      ) {
        mergedBookings.push(localBooking);
      }
    });

    return mergedBookings;
  }
}

const bookingStorage = new BookingStorage();
export default bookingStorage;

import { ethers } from 'ethers';

const RestaurantsABI = [
  'function restaurantCount() view returns (uint256)',
  'function bookingCount() view returns (uint256)',
  'function restaurants(uint256) view returns (uint256 id, string name)',
  'function bookings(uint256) view returns (uint256 id, uint256 numberOfGuests, string name, string date, uint256 time, uint256 restaurantId)',
  'function createRestaurant(string memory name)',
  'function createBooking(uint256 numberOfGuests, string memory name, string memory date, uint256 time, uint256 restaurantId)',
  'function getBookings(uint256 id) view returns (uint256[] memory)',
  'function editBooking(uint256 id, uint256 numberOfGuests, string memory name, string memory date, uint256 time)',
  'function removeBooking(uint256 id)',
  'event RestaurantCreated(bool success, uint256 id)',
  'event BookingCreated(bool success, uint256 id)',
  'event GotBookings(uint256[])',
  'event DeletedBooking(bool success)',
  'event UpdatedBooking(tuple(uint256 id, uint256 numberOfGuests, string name, string date, uint256 time, uint256 restaurantId) booking)',
];

class BlockchainService {
  constructor() {
    this.initialized = false;
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.restaurantId = 1; // Default restaurant ID
    this.maxTables = 15; // Restaurant has 15 tables

    this.contractAddress =
      import.meta.env.VITE_CONTRACT_ADDRESS ||
      '0x5FbDB2315678afecb367f032d93F642f64180aa3';

    console.log(
      '🏗️ BlockchainService constructed with contract address:',
      this.contractAddress
    );
  }

  // Helper for adding timeouts to promises
  async timeoutPromise(
    promise,
    timeoutMs = 5000,
    errorMessage = 'Operation timed out'
  ) {
    let timeoutId;

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        console.log(`⏱️ Timeout after ${timeoutMs}ms: ${errorMessage}`);
        reject(new Error(errorMessage));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async initialize() {
    console.log('🔍 Initialize called, current state:', {
      initialized: this.initialized,
    });

    if (this.initialized) {
      console.log('🔄 Already initialized');
      return;
    }

    console.log('🚀 Starting blockchain service initialization');

    // Set a global initialization timeout
    const initTimeout = setTimeout(() => {
      if (!this.initialized) {
        console.log('⏱️ Global initialization timeout reached');
        throw new Error('Blockchain initialization timed out');
      }
    }, 10000); // 10 second safety timeout

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        console.error('🦊 MetaMask not installed');
        throw new Error(
          'MetaMask is not installed. Please install MetaMask to use this feature.'
        );
      }

      console.log('🦊 MetaMask detected, attempting to connect');

      // Request accounts
      try {
        console.log('👤 Requesting accounts from MetaMask...');
        await this.timeoutPromise(
          window.ethereum.request({ method: 'eth_requestAccounts' }),
          5000,
          'MetaMask accounts request timed out'
        );
        console.log('✅ Connected to MetaMask accounts');
      } catch (error) {
        console.error('❌ Failed to get accounts:', error);
        throw new Error(
          'Failed to connect to MetaMask. Please check your MetaMask extension.'
        );
      }

      // Setup provider
      try {
        console.log('🔌 Setting up provider...');
        this.provider = new ethers.BrowserProvider(window.ethereum);
        console.log('✅ Provider created');
      } catch (error) {
        console.error('❌ Provider connection error:', error);
        throw new Error(
          'Failed to create Ethereum provider. Please refresh and try again.'
        );
      }

      // Get signer
      try {
        console.log('🖋️ Getting signer...');
        this.signer = await this.timeoutPromise(
          this.provider.getSigner(),
          5000,
          'Signer request timed out'
        );
        const address = await this.timeoutPromise(
          this.signer.getAddress(),
          5000,
          'Address request timed out'
        );
        console.log('✅ Signer created with address:', address);
      } catch (error) {
        console.error('❌ Signer error:', error);
        throw new Error(
          'Failed to get Ethereum signer. Please check your MetaMask connection.'
        );
      }

      // Setup contract
      try {
        console.log('📄 Setting up contract at address:', this.contractAddress);
        this.contract = new ethers.Contract(
          this.contractAddress,
          RestaurantsABI,
          this.signer
        );

        // Try to read from contract with timeout
        console.log('📊 Testing contract with restaurantCount call...');
        const count = await this.timeoutPromise(
          this.contract.restaurantCount(),
          8000,
          'Contract read operation timed out'
        );
        console.log('✅ Connected to contract, restaurant count:', count);
      } catch (error) {
        console.error('❌ Contract error:', error);
        throw new Error(
          'Failed to connect to smart contract. Please check your network connection.'
        );
      }

      this.initialized = true;
      console.log('✅ Blockchain service fully initialized');
    } catch (error) {
      console.error('❌ Failed to initialize BlockchainService:', error);
      throw error;
    } finally {
      clearTimeout(initTimeout);
    }
  }

  async getRestaurantCount() {
    await this.initialize();
    try {
      return await this.contract.restaurantCount();
    } catch (error) {
      console.error('Error getting restaurant count:', error);
      throw new Error(
        'Failed to get restaurant count. Please check your connection to the blockchain.'
      );
    }
  }

  async getBookingCount() {
    await this.initialize();
    try {
      return await this.contract.bookingCount();
    } catch (error) {
      console.error('Error getting booking count:', error);
      throw new Error(
        'Failed to get booking count. Please check your connection to the blockchain.'
      );
    }
  }

  async getRestaurants() {
    await this.initialize();
    try {
      const restaurantCount = await this.getRestaurantCount();
      const restaurants = [];

      for (let i = 1; i <= restaurantCount; i++) {
        try {
          const restaurant = await this.contract.restaurants(i);
          if (restaurant.name) {
            restaurants.push({
              id: Number(restaurant.id),
              name: restaurant.name,
            });
          }
        } catch (error) {
          console.error(`Error fetching restaurant ${i}:`, error);
        }
      }

      return restaurants;
    } catch (error) {
      console.error('Error getting restaurants:', error);
      throw new Error(
        'Failed to get restaurants. Please check your connection to the blockchain.'
      );
    }
  }

  async createRestaurant(name) {
    await this.initialize();
    try {
      const tx = await this.contract.createRestaurant(name);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw new Error(
        'Failed to create restaurant. Please check your connection to the blockchain.'
      );
    }
  }

  async getBookingsByRestaurantId(restaurantId) {
    await this.initialize();

    try {
      const bookingIds = await this.timeoutPromise(
        this.contract.getBookings(restaurantId),
        8000,
        'Getting booking IDs timed out'
      );
      const bookings = [];

      for (let i = 0; i < bookingIds.length; i++) {
        try {
          const booking = await this.timeoutPromise(
            this.contract.bookings(bookingIds[i]),
            5000,
            `Fetching booking ${bookingIds[i]} timed out`
          );
          bookings.push({
            id: Number(booking.id),
            numberOfGuests: Number(booking.numberOfGuests),
            name: booking.name,
            date: booking.date,
            time: Number(booking.time),
            restaurantId: Number(booking.restaurantId),
          });
        } catch (error) {
          console.error(`Error fetching booking ${bookingIds[i]}:`, error);
        }
      }

      return bookings;
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw new Error('Failed to get bookings from blockchain');
    }
  }

  async createBooking(bookingData) {
    await this.initialize();

    console.log('📝 Creating booking:', bookingData);
    const tx = await this.timeoutPromise(
      this.contract.createBooking(
        bookingData.numberOfGuests,
        bookingData.name,
        bookingData.date,
        bookingData.time,
        this.restaurantId
      ),
      15000,
      'Transaction creation timed out'
    );

    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await this.timeoutPromise(
      tx.wait(),
      30000,
      'Transaction confirmation timed out'
    );

    console.log('✅ Booking created successfully', receipt);

    // Generate the booking ID (in practice, the contract should return this)
    // For now, we'll use the transaction hash as a unique identifier
    const txHash = receipt.hash;
    const bookingId = parseInt(txHash.slice(2, 10), 16); // Use first 8 chars of hash as ID

    return {
      success: true,
      bookingId: bookingId,
      transactionHash: txHash,
    };
  }

  async editBooking(id, numberOfGuests, name, date, time) {
    await this.initialize();
    try {
      const tx = await this.contract.editBooking(
        id,
        numberOfGuests,
        name,
        date,
        time
      );
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error editing booking:', error);
      throw new Error(
        'Failed to edit booking. Please check your connection to the blockchain.'
      );
    }
  }

  async removeBooking(id) {
    await this.initialize();
    try {
      const tx = await this.contract.removeBooking(id);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error removing booking:', error);
      throw new Error(
        'Failed to remove booking. Please check your connection to the blockchain.'
      );
    }
  }

  async checkAvailability(date, time, numberOfGuests, personName = null) {
    console.log('🔍 Starting availability check for:', {
      date,
      time,
      numberOfGuests,
      personName,
    });

    // Set a safety timeout for the whole operation
    const checkTimeout = setTimeout(() => {
      console.log(
        '⏱️ Global check availability timeout reached, forcing true response'
      );
      // We'll use this as a signal in the UI to force an update
      window.dispatchEvent(
        new CustomEvent('blockchain_timeout', {
          detail: { operation: 'checkAvailability' },
        })
      );
    }, 15000); // 15 second safety timeout

    try {
      console.log('🔄 Attempting to initialize blockchain connection');
      await this.initialize();

      console.log(
        '🔗 Getting bookings from blockchain for restaurant:',
        this.restaurantId
      );

      // Use a shorter timeout here specifically for the getBookings call
      const bookings = await this.timeoutPromise(
        this.getBookingsByRestaurantId(this.restaurantId),
        10000,
        'Getting bookings timed out'
      );

      console.log('📋 Retrieved bookings:', bookings);

      // Filter bookings for the requested date and time
      const bookingsForDateTime = bookings.filter(
        (booking) => booking.date === date && booking.time === time
      );

      console.log(
        `🗓️ Found ${bookingsForDateTime.length} bookings for ${date} at ${time}:00`
      );

      // Check if we have enough tables
      const tablesBooked = bookingsForDateTime.length;
      const tablesAvailable = this.maxTables - tablesBooked;

      console.log(
        `🪑 Tables booked: ${tablesBooked}, Tables available: ${tablesAvailable}`
      );

      // Check for duplicate bookings by name (if name is provided)
      let hasDuplicateBooking = false;
      if (personName) {
        // Check for case-insensitive name match
        const normalizedName = personName.trim().toLowerCase();
        hasDuplicateBooking = bookingsForDateTime.some(
          (booking) => booking.name.trim().toLowerCase() === normalizedName
        );

        console.log(
          `🧐 Checking for duplicate booking with name "${personName}":`,
          hasDuplicateBooking ? '⚠️ Duplicate found!' : '✅ No duplicate'
        );
      }

      // Check if there are enough tables for the requested number of guests
      const isAvailable = tablesAvailable > 0;

      console.log(
        '🔍 Availability check:',
        isAvailable ? '✅ Tables available' : '❌ No tables available'
      );

      // Clear timeout and return result
      clearTimeout(checkTimeout);

      // Return an object with availability information
      const result = {
        available: isAvailable,
        hasDuplicateBooking: hasDuplicateBooking,
        tablesAvailable: tablesAvailable,
        tablesBooked: tablesBooked,
        totalTables: this.maxTables,
      };

      console.log('✅ Returning availability result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in checkAvailability:', error);
      throw new Error('Failed to check availability. Please try again.');
    } finally {
      clearTimeout(checkTimeout);
    }
  }
}
const blockchainService = new BlockchainService();
export default blockchainService;

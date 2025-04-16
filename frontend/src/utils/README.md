# Administrationspanel - Guide för bokningslagring

## Snabbstart

```javascript
import bookingStorage from '../utils/bookingStorage';

// Exempel: Läsa in alla bokningar i din Admin-komponent
useEffect(() => {
  const laddaBokningar = async () => {
    setLaddning(true);
    try {
      const bokningar = await bookingStorage.getAllBookings();
      setBokningar(bokningar);
    } catch (error) {
      console.error('Kunde inte ladda bokningar:', error);
    } finally {
      setLaddning(false);
    }
  };

  laddaBokningar();
}, []);
```

## Tillgängliga metoder

### 1. Hämta alla bokningar

```javascript
// Hämta alla bokningar från både blockchain och localStorage
const bokningar = await bookingStorage.getAllBookings();
```

### 2. Hämta en enskild bokning

```javascript
// Hämta en bokning med ID
const bokning = await bookingStorage.getBookingById(bokningsId);
```

### 3. Skapa en ny bokning

```javascript
// Skapa en ny bokning
const bokningsData = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '123-456-7890',
  date: '2025-05-01',
  time: 18, // 18:00
  numberOfGuests: 4,
};

const resultat = await bookingStorage.saveBooking(bokningsData);
// resultat = { success: true, bookingId: 123 }
```

### 4. Uppdatera en bokning

```javascript
// Uppdatera en befintlig bokning
const uppdateradData = {
  id: bokningsId, // Måste inkludera ID
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '123-456-7890',
  date: '2025-05-02',
  time: 21, // 21:00
  numberOfGuests: 2,
};

const framgång = await bookingStorage.updateBooking(uppdateradData);
```

### 5. Ta bort en bokning

```javascript
// Ta bort en bokning
const framgång = await bookingStorage.deleteBooking(bokningsId);
```

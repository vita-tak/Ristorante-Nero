export const validateBookingForm = (formData, guestsPerTable) => {
    const errors = {};

    // Validate name
    if (!formData.name.trim()) {
        errors.name = 'Guest name is required';
    } else if (formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
    }

    // Validate number of guests
    if (!formData.numberOfGuests) {
        errors.numberOfGuests = 'Number of guests is required';
    } else if (formData.numberOfGuests < 1) {
        errors.numberOfGuests = 'At least 1 guest is required';
    } else if (formData.numberOfGuests > guestsPerTable) {
        errors.numberOfGuests = `Maximum ${guestsPerTable} guests per table`;
    }

    // Validate date
    if (!formData.date) {
        errors.date = 'Date is required';
    } else {
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            errors.date = 'Date cannot be in the past';
        }
    }

    // Validate time
    if (!formData.time && formData.time !== 0) {
        errors.time = 'Time is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { studentName, studentDOB, parentName, parentPhone, parentEmail, eventName, eventId } = req.body;
    
    const newBooking = new Booking({
      studentName,
      studentDOB,
      parentName,
      parentPhone,
      parentEmail,
      eventName,
      eventId
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Fetch bookings by event ID
router.get('/event/:eventId', async (req, res) => {
  try {
    const bookings = await Booking.find({ eventId: req.params.eventId });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;

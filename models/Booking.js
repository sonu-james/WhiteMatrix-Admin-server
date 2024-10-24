const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentDOB: { type: Date, required: true },
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  parentEmail: { type: String, required: true },
  eventName: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true } // Reference to Event model
}, {
  timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

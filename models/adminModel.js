const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  fullName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true } // New field to store the user ID

});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;

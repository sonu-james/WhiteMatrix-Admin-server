// models/personalUser.js

const mongoose = require('mongoose');

const personalUserSchema = new mongoose.Schema({
  username: { type: String, default: null }, // Allow null or provide a default value
  email: { type: String, required: true },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+?[0-9]+$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  password: { type: String, default: null }, // Allow null or provide a default value
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  agreeTerms: { type: Boolean, default: true } // Allow null or provide a default value
});

const PersonalUser = mongoose.model('PersonalUser', personalUserSchema);
module.exports = PersonalUser;

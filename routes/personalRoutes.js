// routes/personalRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const PersonalUser = require('../models/personalUser'); // Adjust the path as necessary

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, email, phoneNumber, password, firstName, lastName, confirmPassword, agreeTerms } = req.body;

  // Validate password
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    // Check if user with the same email or phone number already exists
    const existingUser = await PersonalUser.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or phone number already exists.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create and save new user
    const newUser = new PersonalUser({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      firstName,
      lastName,
      agreeTerms,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});

router.post('/checkout', async (req, res) => {
  const { email, phoneNumber, firstName, lastName } = req.body;

  try {
    // Check if user with the same email or phone number already exists
    const existingUser = await PersonalUser.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or phone number already exists. Please Login to checkout.' });
    }

    // Create and save new user with default values for other fields
    const newUser = new PersonalUser({
      username: null, // or provide a default username if needed
      email,
      phoneNumber,
      password: null, // Default to null as this is not provided
      firstName,
      lastName,
      agreeTerms: null // Default to null or use default value as needed
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});


// Sign-In Route
router.post('/signin', async (req, res) => {
    const { emailOrPhone, password } = req.body;
  
    try {
      // Find the user by email or phone number
      const user = await PersonalUser.findOne({
        $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }]
      });
  
      if (!user) {
        return res.status(400).json({ message: 'Email/phone is incorrect' });
      }
  
      // Check if the password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Password is incorrect' });
      }
  
      // Successful sign-in
      res.status(200).json({ message: 'Sign-in successful', user });
    } catch (err) {
      console.error('Sign-in error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });


  // New route to search for parents
router.get('/search', async (req, res) => {
  const { query } = req.query;

  try {
    const parent = await PersonalUser.findOne({
      $or: [{ email: query }, { phoneNumber: query }]
    });

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    res.status(200).json(parent);
  } catch (error) {
    console.error('Error searching parent:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});

//Route to update parent by id
router.put('/parent/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, phoneNumber, firstName, lastName, agreeTerms } = req.body;

  try {
    const updatedParent = await PersonalUser.findByIdAndUpdate(
      id,
      { username, email, phoneNumber, firstName, lastName, agreeTerms },
      { new: true }
    );

    if (!updatedParent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    res.status(200).json(updatedParent);
  } catch (error) {
    console.error('Error updating parent:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});

// New route to delete parent by id
router.delete('/parent/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedParent = await PersonalUser.findByIdAndDelete(id);

    if (!deletedParent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    res.status(200).json({ message: 'Parent deleted successfully' });
  } catch (error) {
    console.error('Error deleting parent:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});

module.exports = router;

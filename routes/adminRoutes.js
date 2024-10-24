const express = require('express');
const router = express.Router();
const Admin = require('../models/adminModel');
const bcrypt = require('bcrypt');

router.post('/signin', async (req, res) => {
  const { name, password } = req.body;

  try {
    const admin = await Admin.findOne({ name });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Sign-in successful', admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


//change password routes here
router.post('/change-password/:id', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { id } = req.params;

  try {
    // Find the admin by ID
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if the current password matches
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password in the database
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

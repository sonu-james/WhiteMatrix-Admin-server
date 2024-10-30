const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Adjust the path as necessary
const nodemailer = require('nodemailer');
const Admin = require('../models/adminModel');
const Course = require('../models/Course');
const fs = require('fs');

const router = express.Router();

// Set up multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/signup', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'crFile', maxCount: 1 },
  { name: 'academyImg', maxCount: 1 }
]), async (req, res) => {
  const { username, email, phoneNumber, fullName, designation, description, location, website,licenseNo, instaId, agreeTerms } = req.body;

  const files = req.files;
  const fileBase64 = {};

  if (files) {
    if (files.logo) fileBase64.logo = files.logo[0].buffer.toString('base64');
    if (files.crFile) fileBase64.crFile = files.crFile[0].buffer.toString('base64');
    if (files.academyImg) fileBase64.academyImg = files.academyImg[0].buffer.toString('base64');
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or phone number already exists.' });
    }

    // Construct the new user object based on the updated schema
    const newUser = new User({
      username,
      email,
      phoneNumber,
      fullName,
      designation,
      description,
      location,
      licenseNo,
      website: website || null, // Optional
      instaId: instaId || null, // Optional
      logo: fileBase64.logo,
      crFile: fileBase64.crFile,
      academyImg: fileBase64.academyImg,
      agreeTerms: agreeTerms === 'true', // Ensure agreeTerms is parsed as a Boolean
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
    const existingAdmin = await Admin.findOne({ name: email });
    if (existingAdmin) {
      console.log('Admin with this email already exists');
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    // Hash the phone number to use as password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(phoneNumber, salt);
    const role= "provider";
    // Create a new Admin account using the provided user data
    const admin = new Admin({
      name: email,
      password: hashedPassword,
      fullName: fullName,
      role: role,
      userId: newUser._id
    });

    // Save the new Admin account
    await admin.save();
    console.log('Admin saved successfully:', admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});
// Sign-In Route
router.post('/signin', async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    // Find the user by email or phone number
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Eemail/phone is incorrect' });
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
router.get('/pending', async (req, res) => {
  try {
    const pendingUsers = await User.find({ verificationStatus: 'pending' });
    console.log('Fetched Pending Users:', pendingUsers); // Debugging log
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error.message); // Debugging log for errors
    res.status(400).json({ message: error.message });
  }
});

router.get('/accepted', async (req, res) => {
  try {
    const acceptedUsers = await User.find({ verificationStatus: 'accepted' });
    console.log('Fetched Accepted Users:', acceptedUsers); // Debugging log
    res.status(200).json(acceptedUsers);
  } catch (error) {
    console.error('Error fetching accepted users:', error.message); // Debugging log for errors
    res.status(400).json({ message: error.message });
  }
});

router.post('/verify/:id', async (req, res) => {
  try {
    const { email, phone, fullName, role } = req.body;

    // Check if the admin with this email already exists
    const existingAdmin = await Admin.findOne({ name: email });
    if (existingAdmin) {
      console.log('Admin with this email already exists');
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    // Hash the phone number to use as password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(phone, salt);

    // Create a new Admin account using the provided user data
    const admin = new Admin({
      name: email,
      password: hashedPassword,
      fullName: fullName,
      role: role,
      userId: req.params.id 
    });

    // Save the new Admin account
    await admin.save();
    console.log('Admin saved successfully:', admin);
    const url= "https://main.d3781xttwrodcq.amplifyapp.com/";
    // Update the user verification status
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'accepted' },
      { new: true }
    );

    console.log('User verification status updated:', user);
    const welcomeMessage = `
    Dear ${fullName},
    
    We are happy to inform you that your account has been verified by KidGage.
    To get started, please login using the following credentials: 
    Link to Activity Manager:${url}
    Username: ${email}
    Password: ${phone}
    
    Please complete your profile after logging in.
    
    Welcome to KidGage Team!
  `;
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'whitematrix2024@gmail.com',
      pass: 'tkxj mgpk cewx crni'
    }
  });

  // Set up email data
  const mailOptions = {
    from: 'whitematrix2024@gmail.com', // sender address
    to: email, // recipient email address
    subject: 'Welcome to KidGage!', // Subject of the email
    text: welcomeMessage, // Plain text body
  };

  // Send email
  await transporter.sendMail(mailOptions);
  console.log('Welcome email sent successfully to:', email);

  // Send a response back to the client
  res.status(200).json({ message: 'User verified and admin account created successfully', user });
  } catch (error) {
    console.error('Error in verify route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Rejection endpoint
router.post('/reject/:id', async (req, res) => {
  const { username, email, fullName, reason } = req.body;
  const { id } = req.params; // Extract the user ID from the request parameters

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'whitematrix2024@gmail.com',
        pass: 'tkxj mgpk cewx crni'
      }
    });

    // Construct the email message
    const mailOptions = {
      from: 'whitematrix2024@gmail.com',
      to: email,
      subject: 'Application Rejected',
      text: `Dear ${fullName},

We hope this message finds you well.

We regret to inform you that your application with ${username} has been rejected. After careful consideration, we have decided not to proceed with your application at this time.

Reason for Rejection:
${reason}

We appreciate the time and effort you invested in your application and encourage you to apply again in the future. Should you have any questions or require further clarification, please do not hesitate to reach out to us.

Thank you for your interest in being a part of Kidgage. We wish you all the best in your future endeavors.

Best regards,
Team Kidgage`};

    // Send the email
    await transporter.sendMail(mailOptions);

    // Delete the user from the database
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: 'User rejected and email sent successfully' });
  } catch (error) {
    console.error('Error rejecting user or sending email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search Route
router.get('/search', async (req, res) => {
  const { query } = req.query;

  try {
    // Find the user by email or phone number
    const user = await User.findOne({
      $or: [{ email: query }, { phoneNumber: query }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Send the user details
    res.status(200).json(user);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/allUser',async (req,res)=>{
  try {
    // Fetch all users with the specified fields (username, logo)
    const users = await User.find();
    console.log('Fetched Users:', users); // Debugging log
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message); // Debugging log for errors
    res.status(400).json({ message: error.message });
  }
})



router.get('/all', async (req, res) => {
  try {
    // Fetch only verified users with the specified fields (username, logo)
    const users = await User.find({ verificationStatus: 'verified' }, 'username logo email');
    console.log('Fetched Users:', users); // Debugging log
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message); // Debugging log for errors
    res.status(400).json({ message: error.message });
  }
});
router.get('/provider/:id', async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(200).json(provider);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.put('/update/:id', upload.fields([{ name: 'logo' }, { name: 'crFile' }, { name: 'academyImg' }]), async (req, res) => {
  const { id } = req.params;
  const { username, email, phoneNumber, fullName, designation, description, location, website, instaId, licenseNo } = req.body;

  // Convert files to base64 if they are provided
  let logoBase64 = null;
  let crFileBase64 = null;
  let academyImgBase64 = null;

  if (req.files.logo) {
    logoBase64 = req.files.logo[0].buffer.toString('base64');
  }
  if (req.files.crFile) {
    crFileBase64 = req.files.crFile[0].buffer.toString('base64');
  }
  if (req.files.academyImg) {
    academyImgBase64 = req.files.academyImg[0].buffer.toString('base64');
  }
  console.log('Received files:', req.files);
  console.log('Received body:', req.body);
  
  try {
    const updatedUser = await User.findByIdAndUpdate(id, {
      username,
      email,
      phoneNumber,
      fullName,
      designation,
      description,
      location,
      website,
      instaId,
      licenseNo,
      logo: logoBase64 || undefined, // Only update logo if a new file is provided
      crFile: crFileBase64 || undefined, // Only update CR file if a new file is provided
      academyImg: academyImgBase64 || undefined // Only update academyImg if a new file is provided
    }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});

// New route to delete academy by id
router.delete('/academy/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAcademy = await User.findByIdAndDelete(id);

    if (!deletedAcademy) {
      return res.status(404).json({ message: 'Academy not found' });
    }
    // Delete all courses associated with this academy
    await Course.deleteMany({ providerId: id });
    
    res.status(200).json({ message: 'Academy and associated courses deleted successfully' });
  } catch (error) {
    console.error('Error deleting academy and courses:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});

router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Fetch user details from the database
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/email/:email', async (req, res) => {
  const { email } = req.params;
  try {
      const provider = await User.findOne({ email: email }); // Check for email field match
      if (!provider) {
          return res.status(404).json({ message: 'Provider not found' });
      }
      res.json(provider);
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
});
router.post('/complete/:userId', upload.fields([{ name: 'academyImg' }, { name: 'logo' }]), async (req, res) => {
  const { userId } = req.params;
  const { licenseNo } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the license number and verification status
    user.licenseNo = licenseNo;
    user.verificationStatus = 'verified'; // Set the verification status to 'verified'

    // Convert files to Base64 and update the user record
    if (req.files) {
      if (req.files.academyImg && req.files.academyImg[0]) {
        user.academyImg = req.files.academyImg[0].buffer.toString('base64'); // Convert Academy Image to Base64
      }

      if (req.files.logo && req.files.logo[0]) {
        user.logo = req.files.logo[0].buffer.toString('base64'); // Convert Logo to Base64
      }
    }

    await user.save();

    res.json({ message: 'User details updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/edit/:userId', upload.fields([{ name: 'academyImg' }, { name: 'logo' }]), async (req, res) => {
  const { userId } = req.params;
  const { licenseNo, fullName, designation, description, website, instaId, location, email, phoneNumber } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(req.files.logo);
    // Update the license number and verification status
    user.licenseNo = licenseNo;
    user.fullName = fullName;
    user.designation = designation;
    user.description = description;
    user.location = location;
    user.website = website||null;
    user.instaId = instaId|| null;
    user.email = email;
    user.phoneNumber = phoneNumber;


    // Convert files to Base64 and update the user record
    if (req.files) {
      if (req.files.academyImg && req.files.academyImg[0]) {
        user.academyImg = req.files.academyImg[0].buffer.toString('base64'); // Convert Academy Image to Base64
      }

      if (req.files.logo && req.files.logo[0]) {
        user.logo = req.files.logo[0].buffer.toString('base64'); // Convert Logo to Base64
      }
    }

    await user.save();

    res.json({ message: 'User details updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/edits/:userId', upload.fields([{ name: 'academyImg' }, { name: 'logo' }, { name: 'crFile' }]), async (req, res) => {
  const { userId } = req.params;
  const { licenseNo, fullName, designation, description, website, instaId, location, email, phoneNumber } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Update the license number and verification status
    user.licenseNo = licenseNo;
    user.fullName = fullName;
    user.designation = designation;
    user.description = description;
    user.location = location;
    user.website = website||null;
    user.instaId = instaId|| null;
    user.email = email;
    user.phoneNumber = phoneNumber;


    // Convert files to Base64 and update the user record
    if (req.files) {
      if (req.files.academyImg && req.files.academyImg[0]) {
        user.academyImg = req.files.academyImg[0].buffer.toString('base64'); // Convert Academy Image to Base64
      }

      if (req.files.logo && req.files.logo[0]) {
        user.logo = req.files.logo[0].buffer.toString('base64'); // Convert Logo to Base64
      }
      if (req.files.crFile && req.files.crFile[0]) {
        user.crFile = req.files.crFile[0].buffer.toString('base64'); // Convert Logo to Base64
      }
    }

    await user.save();

    res.json({ message: 'User details updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;

const express = require('express');
const multer = require('multer');
const Poster = require('../models/Poster'); // Adjust the path as necessary

const router = express.Router();

// Set up multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to add a new poster
router.post('/add', upload.single('image'), async (req, res) => {
  const { name, description, location, link, startDate, endDate } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Image is required' });
  }

  const imageBase64 = req.file.buffer.toString('base64');

  try {
    const newPoster = new Poster({
      name,
      description,
      location,
      link,
      startDate,
      endDate,
      image: imageBase64,
    });

    const savedPoster = await newPoster.save();
    res.status(201).json(savedPoster);
  } catch (error) {
    console.error('Error saving poster:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});

// Route to fetch all posters or wishlist posters based on query parameter
router.get('/', async (req, res) => {
  const { wishlist } = req.query;

  try {
    let posters;
    if (wishlist === 'true') {
      posters = await Poster.find({ wishlist: true });
    } else {
      posters = await Poster.find();
    }

    console.log('Fetched posters:', posters.length); // Logging number of posters fetched
    res.status(200).json(posters);
  } catch (error) {
    console.error('Error fetching posters:', error); // More detailed logging
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});

// Route to update a specific poster by ID
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, description, location, link, startDate, endDate } = req.body;
  let imageBase64 = null;

  if (req.file) {
    imageBase64 = req.file.buffer.toString('base64');
  }

  try {
    const updatedPoster = await Poster.findByIdAndUpdate(id, {
      name,
      description,
      location,
      link,
      startDate,
      endDate,
      image: imageBase64 || undefined, // Only update image if a new file is provided
    }, { new: true });

    if (!updatedPoster) {
      return res.status(404).json({ message: 'Poster not found' });
    }

    res.status(200).json(updatedPoster);
  } catch (error) {
    console.error('Error updating poster:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});

// Route to delete a specific poster by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPoster = await Poster.findByIdAndDelete(id);
    if (!deletedPoster) {
      return res.status(404).json({ message: 'Poster not found' });
    }
    res.status(200).json({ message: 'Poster deleted successfully' });
  } catch (error) {
    console.error('Error deleting poster:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});

// Route to update the wishlist status of a poster
router.put('/:id/wishlist', async (req, res) => {
  const { id } = req.params;
  const { wishlist } = req.body;

  try {
    const updatedPoster = await Poster.findByIdAndUpdate(id, { wishlist }, { new: true });

    if (!updatedPoster) {
      return res.status(404).json({ message: 'Poster not found' });
    }

    res.status(200).json(updatedPoster);
  } catch (error) {
    console.error('Error updating wishlist:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});

// Route to fetch a specific poster by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const poster = await Poster.findById(id);
    if (!poster) {
      return res.status(404).json({ message: 'Poster not found' });
    }
    res.status(200).json(poster);
  } catch (error) {
    console.error('Error fetching poster:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});
module.exports = router;

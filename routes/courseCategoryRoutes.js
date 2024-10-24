const express = require('express');
const multer = require('multer');
const CourseCategory = require('../models/CourseCategory'); // Adjust the path as necessary

const router = express.Router();

// Set up multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/add', upload.single('image'), async (req, res) => {
  const { name } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Image is required' });
  }

  const imageBase64 = req.file.buffer.toString('base64');

  try {
    const newCourseCategory = new CourseCategory({
      name,
      image: imageBase64,
    });

    const savedCourseCategory = await newCourseCategory.save();
    res.status(201).json(savedCourseCategory);
  } catch (error) {
    console.error('Error saving course category:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
});

router.get('/categories', async (req, res) => {
    try {
        const categories = await CourseCategory.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Update a course category
router.put('/update/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    let updateFields = { name };
  
    if (req.file) {
      const imageBase64 = req.file.buffer.toString('base64');
      updateFields.image = imageBase64;
    }
  
    try {
      const updatedCourseCategory = await CourseCategory.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );
  
      if (!updatedCourseCategory) {
        return res.status(404).json({ message: 'Course category not found' });
      }
  
      res.json(updatedCourseCategory);
    } catch (error) {
      console.error('Error updating course category:', error);
      res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
  });


// Delete a course category
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedCourseCategory = await CourseCategory.findByIdAndDelete(id);
  
      if (!deletedCourseCategory) {
        return res.status(404).json({ message: 'Course category not found' });
      }
  
      res.json({ message: 'Course category deleted successfully' });
    } catch (error) {
      console.error('Error deleting course category:', error);
      res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
});


module.exports = router;

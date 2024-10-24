const express = require('express');
const router = express.Router();
const User = require('../models/User');  // Adjust path as necessary
const Course = require('../models/Course');  // Adjust path as necessary

// Route to search for a provider by email
router.get('/search', async (req, res) => {
    const { email } = req.query;  // Read email from query parameters
    try {
        const provider = await User.findOne({ email });
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        res.json(provider);
    } catch (error) {
        console.error('Error fetching provider:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Route to get courses by provider ID
router.get('/courses/:providerId', async (req, res) => {
    const { providerId } = req.params;
    try {
        const courses = await Course.find({ providerId }).sort({ promoted: -1 });
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Route to promote or demote a course
router.post('/promote/:courseId', async (req, res) => {
    const { courseId } = req.params;
    const { promote } = req.body;  // Boolean value to promote or demote the course

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        course.promoted = promote;  // Update the promoted field
        await course.save();
        res.json({ message: promote ? 'Course promoted successfully!' : 'Course demoted successfully!' });
    } catch (error) {
        console.error('Error promoting/demoting course:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

module.exports = router;

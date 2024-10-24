// routes/studentRoutes.js
const express = require('express');
const Student = require('../models/Student');
const router = express.Router();

// Add student route
router.post('/add', async (req, res) => {
    const { parent, firstName, lastName, dob, gender, levelOfExpertise, interests } = req.body;

    try {
        const student = new Student({
            parent,
            firstName,
            lastName,
            dob,
            gender,
            levelOfExpertise,
            interests
        });

        await student.save();
        res.status(201).json(student);
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
});

// Get student by ID route
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('parent');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
});

// Update student route
router.put('/update/:id', async (req, res) => {
    const { firstName, lastName, dob, gender, levelOfExpertise, interests } = req.body;

    try {
        const student = await Student.findByIdAndUpdate(req.params.id, {
            firstName,
            lastName,
            dob,
            gender,
            levelOfExpertise,
            interests
        }, { new: true });

        if (!student) return res.status(404).json({ message: 'Student not found' });

        res.json(student);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
});


// Get students by parent ID route
router.get('/parent/:parentId', async (req, res) => {
    try {
        const students = await Student.find({ parent: req.params.parentId }).populate('parent');
        if (!students.length) return res.status(404).json({ message: 'No students found for this parent' });
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
});

// Delete student route
router.delete('/delete/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
});
module.exports = router;

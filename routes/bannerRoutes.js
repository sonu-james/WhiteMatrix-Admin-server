const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to get all banners
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find();
        res.json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route to add a banner
router.post('/addbanner', upload.single('image'), async (req, res) => {
    try {
        const { title, bookingLink } = req.body;
        const image = req.file.buffer.toString('base64');

        if (!image) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const newBanner = new Banner({
            title,
            imageUrl: `data:image/png;base64,${image}`,
            bookingLink
        });

        const savedBanner = await newBanner.save();
        res.status(201).json({ message: 'Banner added successfully', banner: savedBanner });
    } catch (error) {
        console.error('Error adding banner:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route to update a banner
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, bookingLink } = req.body;
        const updateData = { title, bookingLink };

        if (req.file) {
            const image = req.file.buffer.toString('base64');
            updateData.imageUrl = `data:image/png;base64,${image}`;
        }

        const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(200).json({ message: 'Banner updated successfully', banner: updatedBanner });
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route to delete a banner
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Banner.findByIdAndDelete(id);
        res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;


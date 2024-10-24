const express = require('express');
const router = express.Router();
const Advertisement = require('../models/Advertisement'); // Adjust path as necessary
const multer = require('multer');

// Set up multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Fetch all advertisements
router.get('/', async (req, res) => {
    try {
        const advertisements = await Advertisement.find();
        res.status(200).json(advertisements);
    } catch (error) {
        console.error('Error fetching advertisements:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Route to add a new advertisement (already exists)
router.post(
    '/addadvertisement',
    upload.fields([{ name: 'desktopImage' }, { name: 'mobileImage' }]),
    async (req, res) => {
        try {
            const { title, space } = req.body;  // Extract space from req.body
            const desktopImage = req.files['desktopImage'][0];
            const mobileImage = req.files['mobileImage'][0];

            // Convert images to Base64 strings
            const desktopImageBase64 = desktopImage.buffer.toString('base64');
            const mobileImageBase64 = mobileImage.buffer.toString('base64');

            // Create a new advertisement document
            const newAdvertisement = new Advertisement({
                title,
                desktopImage: desktopImageBase64,
                mobileImage: mobileImageBase64,
                space: Number(space)  // Use the space value from req.body and convert it to a number
            });

            // Save the advertisement to the database
            await newAdvertisement.save();

            res.status(201).json({ message: 'Advertisement added successfully!' });
        } catch (error) {
            console.error('Error adding advertisement:', error);
            res.status(500).json({ message: 'Server error. Please try again later.' });
        }
    }
);


// Route to update an advertisement
router.put('/:id', upload.fields([{ name: 'desktopImage' }, { name: 'mobileImage' }]), async (req, res) => {
    try {
        const { title } = req.body;
        const { id } = req.params;

        // Find the advertisement by ID
        const advertisement = await Advertisement.findById(id);
        if (!advertisement) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        // Update title
        advertisement.title = title;

        // Update images if provided
        if (req.files['desktopImage']) {
            const desktopImage = req.files['desktopImage'][0];
            advertisement.desktopImage = desktopImage.buffer.toString('base64');
        }
        if (req.files['mobileImage']) {
            const mobileImage = req.files['mobileImage'][0];
            advertisement.mobileImage = mobileImage.buffer.toString('base64');
        }

        // Save the updated advertisement
        await advertisement.save();
        res.status(200).json({ message: 'Advertisement updated successfully!' });
    } catch (error) {
        console.error('Error updating advertisement:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Route to delete an advertisement
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the advertisement by ID
        const deletedAd = await Advertisement.findByIdAndDelete(id);
        if (!deletedAd) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        res.status(200).json({ message: 'Advertisement deleted successfully!' });
    } catch (error) {
        console.error('Error deleting advertisement:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

module.exports = router;

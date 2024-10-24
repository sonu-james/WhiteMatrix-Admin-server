const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    desktopImage: { type: String, required: true },  // Corrected field name
    mobileImage: { type: String, required: true },
    space: { type: Number, required: true }    // Corrected field name
});

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

module.exports = Advertisement;

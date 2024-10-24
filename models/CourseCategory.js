const mongoose = require('mongoose');

const courseCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // Base64 encoded image
});

const CourseCategory = mongoose.model('CourseCategory', courseCategorySchema);
module.exports = CourseCategory;

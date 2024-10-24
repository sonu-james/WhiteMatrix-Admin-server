// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonalUser', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    levelOfExpertise: { type: String, required: true },
    interests: { type: [String], required: true }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;

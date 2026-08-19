const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
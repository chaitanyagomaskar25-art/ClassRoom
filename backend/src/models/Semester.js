const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true, min: 1, max: 8 },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  order: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Semester', semesterSchema);

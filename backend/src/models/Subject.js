const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
  code: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  order: { type: Number, required: true }
}, { timestamps: true });

subjectSchema.index({ semesterId: 1, code: 1 }, { unique: true });
module.exports = mongoose.model('Subject', subjectSchema);

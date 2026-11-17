const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'mentor'], required: true, default: 'student' },
  enrollmentNumber: { type: String, trim: true, sparse: true, unique: true },
  semester: { type: Number, min: 1, max: 8, default: 1 },
  program: { type: String, default: 'BCA', trim: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  bio: { type: String, trim: true, maxlength: 500, default: '' }
}, { timestamps: true });

userSchema.set('toJSON', {
  transform: (_doc, result) => {
    delete result.passwordHash;
    delete result.__v;
    return result;
  }
});

module.exports = mongoose.model('User', userSchema);

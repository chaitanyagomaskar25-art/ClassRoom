import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['student', 'mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'],
      required: true,
      default: 'student',
      index: true
    },
    enrollmentNumber: { type: String, trim: true, sparse: true, unique: true },
    semester: { type: Number, min: 1, max: 8, default: 1 },
    program: { type: String, default: 'BCA (Hons. with Research)', trim: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    seniorMentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    groupId: { type: String, default: '', trim: true, index: true },
    institution: { type: String, default: '', trim: true },
    avatar: { type: String, default: '', trim: true },
    profilePhoto: { type: String, default: '', trim: true },
    academicYear: { type: String, default: '', trim: true },
    batch: { type: String, default: '', trim: true },
    section: { type: String, default: 'A', trim: true },
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    careerGoals: { type: String, default: '', trim: true, maxlength: 1000 },
    bio: { type: String, trim: true, maxlength: 1000, default: '' },
    phone: { type: String, default: '', trim: true },
    xp: { type: Number, default: 0, min: 0 },
    badges: [
      {
        id: { type: String },
        title: { type: String },
        icon: { type: String },
        unlockedAt: { type: Date, default: Date.now }
      }
    ],
    tokenVersion: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, result) => {
    delete result.passwordHash;
    delete result.__v;
    return result;
  }
});

export default mongoose.model('User', userSchema);

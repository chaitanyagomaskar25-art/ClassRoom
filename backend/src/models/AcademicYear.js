import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema(
  {
    yearCode: { type: String, required: true, unique: true, trim: true }, // e.g. "2024-2025"
    title: { type: String, required: true, trim: true }, // e.g. "Academic Year 2024-2025"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
    status: { type: String, enum: ['upcoming', 'active', 'archived'], default: 'active' },
    institution: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('AcademicYear', academicYearSchema);

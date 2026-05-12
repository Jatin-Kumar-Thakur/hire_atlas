const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema(
  {
    roundNumber: { type: Number, required: true },
    type: {
      type: String,
      enum: ['DSA', 'System Design', 'Technical', 'HR', 'Assignment', 'Culture Fit', 'Other'],
      default: 'Technical',
    },
    date: { type: Date, default: null },
    status: {
      type: String,
      enum: ['Pending', 'Cleared', 'Rejected'],
      default: 'Pending',
    },
    notes: { type: String, default: '' },
  },
  { _id: true }
);

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters'],
  },
  role: {
    type: String,
    required: [true, 'Job role is required'],
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters'],
  },
  source: {
    type: String,
    enum: ['LinkedIn', 'Naukri', 'Internshala', 'Company Website', 'Referral', 'AngelList', 'Other'],
    default: 'Other',
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interview Scheduled', 'Offer', 'Rejected', 'Ghosted'],
    default: 'Applied',
  },
  jobUrl:      { type: String, trim: true, default: null },
  location:    { type: String, trim: true, default: null },
  salary:      { type: String, trim: true, default: null },
  notes:       { type: String, maxlength: [2000, 'Notes cannot exceed 2000 characters'], default: '' },
  appliedDate: { type: Date, default: Date.now },
  followUpDate:{ type: Date, default: null },
  reminderSent:{ type: Boolean, default: false },
  addedVia: {
    type: String,
    enum: ['manual', 'extension', 'import'],
    default: 'manual',
  },
  interviewRounds: [interviewRoundSchema],
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});

applicationSchema.index({ userId: 1, createdAt: -1 });
applicationSchema.index({ userId: 1, status: 1 });

applicationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Keep updatedAt fresh on patch/update queries too
applicationSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function () {
  this.set({ updatedAt: new Date() });
});

module.exports = mongoose.model('Application', applicationSchema);

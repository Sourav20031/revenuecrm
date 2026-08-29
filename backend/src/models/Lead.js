import mongoose from 'mongoose';

const { Schema } = mongoose;

export const LEAD_SOURCES = ['Website', 'Referral', 'Social Media', 'Cold Call', 'Event', 'WhatsApp', 'Other'];
export const LEAD_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
export const QUALIFICATION_STATUSES = ['New', 'Contacted', 'Qualified', 'Unqualified'];
export const PIPELINE_STAGES = ['NEW', 'QUALIFIED', 'FOLLOW_UP', 'PROPOSAL', 'WON', 'LOST'];
export const SALESPEOPLE = ['Saurav', 'Rahul', 'Priya', 'Amit'];

const leadSchema = new Schema(
  {
    name: { type: String, required: [true, 'Full name is required'], trim: true },
    company: { type: String, required: [true, 'Company name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[+]?[\d\s-]{7,15}$/, 'Please provide a valid phone number'],
    },
    source: { type: String, enum: LEAD_SOURCES, default: 'Website' },
    priority: { type: String, enum: LEAD_PRIORITIES, default: 'Medium' },
    owner: { type: String, enum: SALESPEOPLE, default: null },
    qualification: { type: String, enum: QUALIFICATION_STATUSES, default: 'New' },
    stage: { type: String, enum: PIPELINE_STAGES, default: 'NEW' },
    leadScore: { type: Number, min: 0, max: 100, default: 0 },
    tags: { type: [String], default: [] },
    requirements: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

leadSchema.index({ name: 'text', company: 'text', email: 'text' });

export default mongoose.model('Lead', leadSchema);

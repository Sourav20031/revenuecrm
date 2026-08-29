import mongoose from 'mongoose';

const { Schema } = mongoose;

export const FOLLOWUP_TYPES = ['Call', 'Meeting', 'Email', 'WhatsApp', 'Other'];
export const FOLLOWUP_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'Overdue'];

const followUpSchema = new Schema(
  {
    lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    date: { type: Date, required: [true, 'Follow-up date is required'] },
    time: { type: String, default: '' },
    type: { type: String, enum: FOLLOWUP_TYPES, default: 'Call' },
    assignedTo: { type: String, default: null },
    reminder: { type: Boolean, default: true },
    status: { type: String, enum: FOLLOWUP_STATUSES, default: 'Scheduled' },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('FollowUp', followUpSchema);

import mongoose from 'mongoose';

const { Schema } = mongoose;

export const TIMELINE_EVENT_TYPES = [
  'LEAD_CREATED',
  'LEAD_ASSIGNED',
  'QUALIFICATION_UPDATED',
  'STAGE_CHANGED',
  'TASK_CREATED',
  'FOLLOW_UP_SCHEDULED',
  'NOTE_ADDED',
  'LEAD_UPDATED',
];

const timelineEventSchema = new Schema(
  {
    lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    type: { type: String, enum: TIMELINE_EVENT_TYPES, required: true },
    description: { type: String, required: true },
    user: { type: String, default: 'System' },
  },
  { timestamps: true }
);

export default mongoose.model('TimelineEvent', timelineEventSchema);

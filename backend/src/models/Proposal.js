import mongoose from 'mongoose';

const { Schema } = mongoose;

export const PROPOSAL_STATUSES = ['Draft', 'Sent', 'Viewed', 'Negotiation', 'Accepted', 'Rejected'];

const proposalSchema = new Schema(
  {
    lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    reference: { type: String, required: [true, 'Proposal reference is required'], trim: true },
    status: { type: String, enum: PROPOSAL_STATUSES, default: 'Draft' },
    sentDate: { type: Date, default: null },
    customerEngagement: { type: String, trim: true, default: '' },
    followUp: { type: String, trim: true, default: '' },
    salesNotes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Proposal', proposalSchema);

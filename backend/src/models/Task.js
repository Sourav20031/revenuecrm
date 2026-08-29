import mongoose from 'mongoose';

const { Schema } = mongoose;

export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
export const TASK_STATUSES = ['Pending', 'In Progress', 'Completed', 'Overdue'];

const taskSchema = new Schema(
  {
    title: { type: String, required: [true, 'Task title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    lead: { type: Schema.Types.ObjectId, ref: 'Lead', default: null },
    assignedTo: { type: String, default: null },
    dueDate: { type: Date, default: null },
    priority: { type: String, enum: TASK_PRIORITIES, default: 'Medium' },
    status: { type: String, enum: TASK_STATUSES, default: 'Pending' },
  },
  { timestamps: true }
);

export default mongoose.model('Task', taskSchema);

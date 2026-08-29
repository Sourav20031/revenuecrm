import Task from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/apiResponse.js';
import { logTimelineEvent } from '../services/timelineService.js';

export const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create(req.body);

  if (task.lead) {
    await logTimelineEvent({
      lead: task.lead,
      type: 'TASK_CREATED',
      description: `Task "${task.title}" created`,
      user: task.assignedTo || 'Dev User',
    });
  }

  return created(res, task, 'Task created successfully');
});

export const getTasks = asyncHandler(async (req, res) => {
  const { lead, status, assignedTo } = req.query;
  const filter = {};
  if (lead) filter.lead = lead;
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;

  const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: -1 }).populate('lead', 'name company');
  return ok(res, tasks);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  return ok(res, task, 'Task updated successfully');
});

export const deleteTask = asyncHandler(async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  return ok(res, {}, 'Task deleted successfully');
});

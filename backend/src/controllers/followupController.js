import FollowUp from '../models/FollowUp.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/apiResponse.js';
import { logTimelineEvent } from '../services/timelineService.js';

export const createFollowUp = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.create(req.body);

  await logTimelineEvent({
    lead: followUp.lead,
    type: 'FOLLOW_UP_SCHEDULED',
    description: `${followUp.type} follow-up scheduled for ${new Date(followUp.date).toLocaleDateString()}`,
    user: followUp.assignedTo || 'Dev User',
  });

  return created(res, followUp, 'Follow-up scheduled successfully');
});

export const getFollowUps = asyncHandler(async (req, res) => {
  const { lead, status, assignedTo } = req.query;
  const filter = {};
  if (lead) filter.lead = lead;
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;

  const followUps = await FollowUp.find(filter).sort({ date: 1 }).populate('lead', 'name company');
  return ok(res, followUps);
});

export const updateFollowUp = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  return ok(res, followUp, 'Follow-up updated successfully');
});

export const deleteFollowUp = asyncHandler(async (req, res) => {
  await FollowUp.findByIdAndDelete(req.params.id);
  return ok(res, {}, 'Follow-up deleted successfully');
});

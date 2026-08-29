import Lead from '../models/Lead.js';
import Task from '../models/Task.js';
import FollowUp from '../models/FollowUp.js';
import Proposal from '../models/Proposal.js';
import TimelineEvent from '../models/TimelineEvent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalLeads,
    newLeads,
    qualifiedLeads,
    followUpsDue,
    openTasks,
    proposalsCount,
    wonLeads,
    lostLeads,
    stageBreakdown,
    recentLeads,
    upcomingFollowUps,
    recentActivity,
  ] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ stage: 'NEW' }),
    Lead.countDocuments({ qualification: 'Qualified' }),
    FollowUp.countDocuments({ status: 'Scheduled', date: { $gte: new Date() } }),
    Task.countDocuments({ status: { $in: ['Pending', 'In Progress'] } }),
    Proposal.countDocuments(),
    Lead.countDocuments({ stage: 'WON' }),
    Lead.countDocuments({ stage: 'LOST' }),
    Lead.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 } } }]),
    Lead.find().sort({ createdAt: -1 }).limit(6),
    FollowUp.find({ status: 'Scheduled' }).sort({ date: 1 }).limit(6).populate('lead', 'name company'),
    TimelineEvent.find().sort({ createdAt: -1 }).limit(8).populate('lead', 'name company'),
  ]);

  const stageMap = stageBreakdown.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});
  const funnel = [
    { stage: 'New', count: stageMap.NEW || 0 },
    { stage: 'Qualified', count: stageMap.QUALIFIED || 0 },
    { stage: 'Follow-up', count: stageMap.FOLLOW_UP || 0 },
    { stage: 'Proposal', count: stageMap.PROPOSAL || 0 },
    { stage: 'Won', count: stageMap.WON || 0 },
  ];

  return ok(res, {
    kpis: {
      totalLeads,
      newLeads,
      qualifiedLeads,
      followUpsDue,
      openTasks,
      proposals: proposalsCount,
      won: wonLeads,
      lost: lostLeads,
    },
    funnel,
    recentLeads,
    upcomingFollowUps,
    recentActivity,
  });
});

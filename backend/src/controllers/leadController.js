import Lead from '../models/Lead.js';
import TimelineEvent from '../models/TimelineEvent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, fail } from '../utils/apiResponse.js';
import { logTimelineEvent } from '../services/timelineService.js';
import { recordAuditEvent } from '../services/auditService.js';

const DEV_USER = 'Dev User';

export const createLead = asyncHandler(async (req, res) => {
  const lead = await Lead.create(req.body);

  await logTimelineEvent({
    lead: lead._id,
    type: 'LEAD_CREATED',
    description: `Lead "${lead.name}" from ${lead.company} was created`,
    user: DEV_USER,
  });

  recordAuditEvent({
    type: 'LEAD_CREATED',
    entity: 'Lead',
    entityId: lead._id.toString(),
    user: DEV_USER,
    details: `Created lead ${lead.name} (${lead.company})`,
  });

  return created(res, lead, 'Lead created successfully');
});

export const getLeads = asyncHandler(async (req, res) => {
  const { search, stage, priority, qualification, owner, page = 1, limit = 10, sortBy = 'createdAt', sortDir = 'desc' } = req.query;

  const filter = {};
  if (stage) filter.stage = stage;
  if (priority) filter.priority = priority;
  if (qualification) filter.qualification = qualification;
  if (owner) filter.owner = owner;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Lead.countDocuments(filter),
  ]);

  return ok(res, {
    leads,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

export const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return fail(res, 'Lead not found', 404);
  return ok(res, lead);
});

export const updateLead = asyncHandler(async (req, res) => {
  const existing = await Lead.findById(req.params.id);
  if (!existing) return fail(res, 'Lead not found', 404);

  const { noteText, ...fields } = req.body;

  if (noteText) {
    existing.notes = existing.notes ? `${existing.notes}\n\n${noteText}` : noteText;
    await existing.save();

    await logTimelineEvent({
      lead: existing._id,
      type: 'NOTE_ADDED',
      description: `Note added: ${noteText}`,
      user: DEV_USER,
    });

    return ok(res, existing, 'Note added successfully');
  }

  const previousOwner = existing.owner;
  const previousQualification = existing.qualification;

  Object.assign(existing, fields);
  await existing.save();

  const events = [];

  if (fields.owner !== undefined && fields.owner !== previousOwner) {
    events.push({
      lead: existing._id,
      type: 'LEAD_ASSIGNED',
      description: `Lead reassigned from ${previousOwner || 'Unassigned'} to ${existing.owner || 'Unassigned'}`,
      user: DEV_USER,
    });
    recordAuditEvent({
      type: 'LEAD_ASSIGNED',
      entity: 'Lead',
      entityId: existing._id.toString(),
      user: DEV_USER,
      details: `Assigned to ${existing.owner || 'Unassigned'}`,
    });
  }

  if (fields.qualification !== undefined && fields.qualification !== previousQualification) {
    events.push({
      lead: existing._id,
      type: 'QUALIFICATION_UPDATED',
      description: `Qualification changed from ${previousQualification} to ${existing.qualification}`,
      user: DEV_USER,
    });
    recordAuditEvent({
      type: 'QUALIFICATION_CHANGED',
      entity: 'Lead',
      entityId: existing._id.toString(),
      user: DEV_USER,
      details: `Qualification -> ${existing.qualification}`,
    });
  }

  if (events.length === 0) {
    events.push({
      lead: existing._id,
      type: 'LEAD_UPDATED',
      description: 'Lead details were updated',
      user: DEV_USER,
    });
  }

  await TimelineEvent.insertMany(events);

  recordAuditEvent({
    type: 'LEAD_UPDATED',
    entity: 'Lead',
    entityId: existing._id.toString(),
    user: DEV_USER,
    details: 'Lead updated',
  });

  return ok(res, existing, 'Lead updated successfully');
});

export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) return fail(res, 'Lead not found', 404);
  await TimelineEvent.deleteMany({ lead: lead._id });
  return ok(res, {}, 'Lead deleted successfully');
});

export const updateLeadStage = asyncHandler(async (req, res) => {
  const { stage } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) return fail(res, 'Lead not found', 404);

  const previousStage = lead.stage;
  lead.stage = stage;
  await lead.save();

  await logTimelineEvent({
    lead: lead._id,
    type: 'STAGE_CHANGED',
    description: `Stage changed from ${previousStage} to ${stage}`,
    user: DEV_USER,
  });

  recordAuditEvent({
    type: 'STAGE_CHANGED',
    entity: 'Lead',
    entityId: lead._id.toString(),
    user: DEV_USER,
    details: `${previousStage} -> ${stage}`,
  });

  return ok(res, lead, 'Pipeline stage updated');
});

export const getLeadTimeline = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return fail(res, 'Lead not found', 404);

  const events = await TimelineEvent.find({ lead: lead._id }).sort({ createdAt: -1 });
  return ok(res, events);
});

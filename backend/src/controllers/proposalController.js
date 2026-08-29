import Proposal from '../models/Proposal.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created } from '../utils/apiResponse.js';

export const createProposal = asyncHandler(async (req, res) => {
  const proposal = await Proposal.create(req.body);
  return created(res, proposal, 'Proposal created successfully');
});

export const getProposals = asyncHandler(async (req, res) => {
  const { lead, status } = req.query;
  const filter = {};
  if (lead) filter.lead = lead;
  if (status) filter.status = status;

  const proposals = await Proposal.find(filter).sort({ createdAt: -1 }).populate('lead', 'name company');
  return ok(res, proposals);
});

export const updateProposal = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  return ok(res, proposal, 'Proposal updated successfully');
});

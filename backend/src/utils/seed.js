import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Lead from '../models/Lead.js';
import Task from '../models/Task.js';
import FollowUp from '../models/FollowUp.js';
import Proposal from '../models/Proposal.js';
import TimelineEvent from '../models/TimelineEvent.js';

const leads = [
  {
    name: 'Rahul Sharma',
    company: 'ABC Events',
    email: 'rahul.sharma@abcevents.example',
    phone: '+91 98765 43210',
    source: 'Website',
    priority: 'High',
    owner: 'Saurav',
    qualification: 'Qualified',
    stage: 'PROPOSAL',
    leadScore: 78,
    tags: ['corporate', 'annual-event'],
    requirements: 'Annual corporate meet for 300 attendees with stage production.',
    notes: 'Very responsive, decision maker confirmed budget.',
  },
  {
    name: 'Amit Kumar',
    company: 'Corporate Events Pvt Ltd',
    email: 'amit.kumar@corpevents.example',
    phone: '+91 98111 22334',
    source: 'Referral',
    priority: 'Medium',
    owner: 'Rahul',
    qualification: 'Contacted',
    stage: 'FOLLOW_UP',
    leadScore: 55,
    tags: ['conference'],
    requirements: 'Two-day leadership conference with AV setup.',
    notes: 'Waiting on internal budget approval.',
  },
  {
    name: 'Priya Singh',
    company: 'Priya Wedding Planning',
    email: 'priya.singh@weddingplanning.example',
    phone: '+91 97654 11223',
    source: 'Social Media',
    priority: 'Urgent',
    owner: 'Priya',
    qualification: 'Qualified',
    stage: 'QUALIFIED',
    leadScore: 82,
    tags: ['wedding', 'premium'],
    requirements: 'Destination wedding, 500 guests, full production.',
    notes: 'High value client, wants a proposal within a week.',
  },
  {
    name: 'Neha Verma',
    company: 'Verma Retail Group',
    email: 'neha.verma@vermaretail.example',
    phone: '+91 96543 22110',
    source: 'Cold Call',
    priority: 'Low',
    owner: 'Amit',
    qualification: 'New',
    stage: 'NEW',
    leadScore: 20,
    tags: ['retail-launch'],
    requirements: 'Store launch event, budget still undecided.',
    notes: 'First contact made, needs nurturing.',
  },
  {
    name: 'Karan Mehta',
    company: 'Mehta Motors',
    email: 'karan.mehta@mehtamotors.example',
    phone: '+91 95432 11009',
    source: 'Event',
    priority: 'Medium',
    owner: 'Saurav',
    qualification: 'Qualified',
    stage: 'WON',
    leadScore: 91,
    tags: ['product-launch'],
    requirements: 'New model launch event for dealer network.',
    notes: 'Contract signed, moving to delivery.',
  },
  {
    name: 'Sana Sheikh',
    company: 'Sheikh Foundation',
    email: 'sana.sheikh@sheikhfoundation.example',
    phone: '+91 94321 00998',
    source: 'WhatsApp',
    priority: 'Low',
    owner: null,
    qualification: 'Unqualified',
    stage: 'LOST',
    leadScore: 10,
    tags: ['charity-gala'],
    requirements: 'Charity gala, budget too small for scope.',
    notes: 'Not a fit for premium production tier.',
  },
];

async function seed() {
  await connectDB();

  console.log('[seed] Clearing existing demo collections...');
  await Promise.all([
    Lead.deleteMany({}),
    Task.deleteMany({}),
    FollowUp.deleteMany({}),
    Proposal.deleteMany({}),
    TimelineEvent.deleteMany({}),
  ]);

  console.log('[seed] Inserting demo leads...');
  const createdLeads = await Lead.insertMany(leads);

  const timelineEvents = [];
  const tasks = [];
  const followUps = [];
  const proposals = [];

  createdLeads.forEach((lead, idx) => {
    timelineEvents.push({
      lead: lead._id,
      type: 'LEAD_CREATED',
      description: `Lead "${lead.name}" from ${lead.company} was created`,
      user: 'Dev User',
      createdAt: new Date(Date.now() - (idx + 5) * 86400000),
    });

    if (lead.owner) {
      timelineEvents.push({
        lead: lead._id,
        type: 'LEAD_ASSIGNED',
        description: `Lead assigned to ${lead.owner}`,
        user: 'Dev User',
        createdAt: new Date(Date.now() - (idx + 4) * 86400000),
      });
    }

    timelineEvents.push({
      lead: lead._id,
      type: 'STAGE_CHANGED',
      description: `Stage set to ${lead.stage}`,
      user: 'Dev User',
      createdAt: new Date(Date.now() - (idx + 1) * 86400000),
    });

    if (idx % 2 === 0) {
      tasks.push({
        title: `Prepare briefing for ${lead.company}`,
        description: 'Compile requirements and share internal briefing note.',
        lead: lead._id,
        assignedTo: lead.owner || 'Saurav',
        dueDate: new Date(Date.now() + (idx + 1) * 86400000),
        priority: lead.priority,
        status: idx === 0 ? 'In Progress' : 'Pending',
      });
    }

    if (lead.stage !== 'LOST') {
      followUps.push({
        lead: lead._id,
        date: new Date(Date.now() + (idx + 1) * 86400000),
        time: '11:00 AM',
        type: idx % 2 === 0 ? 'Call' : 'Meeting',
        assignedTo: lead.owner || 'Saurav',
        reminder: true,
        status: 'Scheduled',
        notes: 'Discuss next steps and confirm requirements.',
      });
    }

    if (lead.stage === 'PROPOSAL' || lead.stage === 'WON') {
      proposals.push({
        lead: lead._id,
        reference: `PROP-2026-${1000 + idx}`,
        status: lead.stage === 'WON' ? 'Accepted' : 'Sent',
        sentDate: new Date(Date.now() - idx * 86400000),
        customerEngagement: 'Opened proposal, reviewed pricing section twice.',
        followUp: 'Scheduled call to walk through deliverables.',
        salesNotes: 'Client is price sensitive but values production quality.',
      });
    }
  });

  await Promise.all([
    TimelineEvent.insertMany(timelineEvents),
    Task.insertMany(tasks),
    FollowUp.insertMany(followUps),
    Proposal.insertMany(proposals),
  ]);

  console.log(`[seed] Done. Inserted ${createdLeads.length} leads, ${tasks.length} tasks, ${followUps.length} follow-ups, ${proposals.length} proposals.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});

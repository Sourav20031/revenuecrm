import TimelineEvent from '../models/TimelineEvent.js';

export async function logTimelineEvent({ lead, type, description, user = 'System' }) {
  return TimelineEvent.create({ lead, type, description, user });
}

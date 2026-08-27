import { formatDateTime } from '../utils/format.js';

const ICONS = {
  LEAD_CREATED: 'M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  LEAD_ASSIGNED: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z',
  QUALIFICATION_UPDATED: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z',
  STAGE_CHANGED: 'M3 3h18v4l-7 7v5l-4 2v-7L3 7V3z',
  TASK_CREATED: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z',
  FOLLOW_UP_SCHEDULED: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 10.4 4 2.4-.8 1.3-4.7-2.8V6h1.5z',
  NOTE_ADDED: 'M4 4h16v16H4zM8 8h8v1.5H8zm0 3.5h8V13H8zm0 3.5h5V17H8z',
  LEAD_UPDATED: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z',
};

export default function Timeline({ events = [], loading }) {
  if (loading) {
    return <p className="text-sm text-ink-500 py-6">Loading timeline…</p>;
  }

  if (events.length === 0) {
    return <p className="text-sm text-ink-500 py-6">No activity recorded yet.</p>;
  }

  return (
    <ol className="relative ml-3 border-l border-base-700">
      {events.map((event) => (
        <li key={event._id} className="mb-6 ml-6 last:mb-0">
          <span className="absolute -left-[15px] flex h-7 w-7 items-center justify-center rounded-full bg-base-850 border border-gold-500/40 text-gold-300">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d={ICONS[event.type] || ICONS.NOTE_ADDED} />
            </svg>
          </span>
          <div className="card px-4 py-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-ink-100">{event.description}</p>
              <span className="text-[11px] text-ink-500 whitespace-nowrap">{formatDateTime(event.createdAt)}</span>
            </div>
            <p className="mt-1 text-xs text-ink-500">by {event.user}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

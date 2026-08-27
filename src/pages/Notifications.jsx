import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { fetchDashboard } from '../services/dashboard.js';
import { timeAgo } from '../utils/format.js';
import { useToast } from '../hooks/useToast.jsx';

export default function Notifications() {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then((res) => setEvents(res.data.recentActivity || []))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl text-ink-100">Notifications</h1>
        <p className="text-sm text-ink-500">CRM activity relevant to you, sourced from the shared timeline feed.</p>
      </div>

      <div className="panel p-5">
        {loading ? (
          <LoadingSpinner label="Loading notifications…" />
        ) : events.length === 0 ? (
          <EmptyState title="You're all caught up" description="New lead activity will appear here." />
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event._id} className="card p-4 flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-gold-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-ink-100">{event.description}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {event.lead?.name ? `${event.lead.name} · ` : ''}{timeAgo(event.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

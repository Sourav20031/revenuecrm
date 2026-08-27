import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { to: '/leads', label: 'Leads', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
  { to: '/pipeline', label: 'Pipeline', icon: 'M3 3h18v4l-7 7v5l-4 2v-7L3 7V3z' },
  { to: '/tasks', label: 'Tasks', icon: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z' },
  { to: '/follow-ups', label: 'Follow-ups', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 10.4 4 2.4-.8 1.3-4.7-2.8V6h1.5z' },
  { to: '/proposals', label: 'Proposals', icon: 'M6 2h9l5 5v15H6zm8 1.5V8h4.5zM8 12h8v1.5H8zm0 3.5h8V17H8zm0-7h4v1.5H8z' },
  { to: '/notifications', label: 'Notifications', icon: 'M12 22a2.1 2.1 0 0 0 2-2h-4a2.1 2.1 0 0 0 2 2zm6-6v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1z' },
  { to: '/analytics', label: 'Analytics', icon: 'M4 20h16v1.5H4zM6 18H4v-6h2zm5 0H9V9h2zm5 0h-2v-9h2zm5 0h-2v-4h2z' },
  { to: '/audit-logs', label: 'Audit Logs', icon: 'M4 4h16v2H4zm0 5h16v2H4zm0 5h10v2H4zm0 5h10v2H4zm14-4 4 4-4 4v-2.5h-4v-3h4z' },
];

export default function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-base-950 border-r border-base-800">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 text-base-950 font-display text-lg font-bold">
          S
        </div>
        <div>
          <p className="font-display text-lg leading-tight text-ink-100">StarVnt</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink-500">Revenue CRM</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-base-800 text-gold-300 shadow-[inset_2px_0_0_0_theme(colors.gold.400)]'
                  : 'text-ink-300 hover:bg-base-900 hover:text-ink-100'
              }`
            }
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 flex-shrink-0 opacity-80" width="18" height="18" fill="currentColor">
              <path d={item.icon} />
            </svg>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-base-800">
        <p className="text-[11px] text-ink-500 leading-relaxed">
          Sprint 1 Demo <br /> Internal use only
        </p>
      </div>
    </div>
  );
}

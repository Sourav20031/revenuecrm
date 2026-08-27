import { useState } from 'react';
import { useSession } from '../hooks/useSession.jsx';

export default function Header({ onMenuClick }) {
  const session = useSession();
  const [search, setSearch] = useState('');

  return (
    <header className="flex items-center gap-3 border-b border-base-800 bg-base-950/80 backdrop-blur px-4 py-3 sm:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden btn-ghost !px-2"
        aria-label="Open menu"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
        </svg>
      </button>

      <div className="relative flex-1 max-w-md">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
        >
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search leads, companies, contacts…"
          className="input !pl-9 !bg-base-900"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="btn-ghost !px-2 relative" aria-label="Notifications">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
            <path d="M12 22a2.1 2.1 0 0 0 2-2h-4a2.1 2.1 0 0 0 2 2zm6-6v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1z" />
          </svg>
          <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-gold-400" />
        </button>

        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-base-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-base-800 border border-base-600 text-xs font-semibold text-gold-300">
            {session.initials}
          </div>
          <div className="leading-tight">
            <p className="text-sm text-ink-100">{session.name}</p>
            <p className="text-[11px] text-ink-500">{session.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

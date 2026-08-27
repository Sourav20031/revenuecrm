export default function EmptyState({ title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-base-800 border border-base-600">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-ink-500">
          <path d="M4 4h16v2H4zm2 4h12v12H6zm2 2v8h8v-8z" />
        </svg>
      </div>
      <p className="text-ink-100 font-medium">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <p className="font-display text-6xl text-gold-400 mb-3">404</p>
      <h1 className="text-xl text-ink-100 mb-2">Page not found</h1>
      <p className="text-sm text-ink-500 mb-6">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
    </div>
  );
}

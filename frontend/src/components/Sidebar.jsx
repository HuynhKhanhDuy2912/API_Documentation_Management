import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 h-screen bg-dark-card border-r border-dark-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-5 border-b border-dark-border">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-dark-text">API Docs</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <Link
          to="/"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${isActive('/')
              ? 'bg-primary text-white'
              : 'text-dark-muted hover:bg-dark-border hover:text-dark-text'
            }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Projects
        </Link>
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-dark-border">
        {user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-primary">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-dark-text truncate">{user.name}</p>
                <p className="text-xs text-dark-muted truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-dark-muted hover:text-delete hover:bg-delete/10 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Đăng xuất"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

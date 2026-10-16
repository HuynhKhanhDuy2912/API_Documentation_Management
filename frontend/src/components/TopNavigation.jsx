import { Link, useLocation } from 'react-router-dom';
import { FileText, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function TopNavigation() {
  const { user, logout } = useAuth();
  const initials = user?.name?.trim()?.charAt(0).toUpperCase()
    || user?.email?.charAt(0).toUpperCase()
    || '?';

  return (
    <header className="sticky top-0 z-40 border-b border-dark-border bg-dark-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-5 sm:gap-7">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 no-underline">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="hidden text-xl font-semibold text-dark-text sm:inline">
              API Documentation Management
            </span>
          </Link>
        </div>

        {user && (
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-700">
                {initials}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-40 truncate text-sm font-medium text-dark-text">
                  {user.name}
                </span>
                <span className="hidden max-w-48 truncate text-xs text-dark-muted md:block">
                  {user.email}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              aria-label="Đăng xuất"
              title="Đăng xuất"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-dark-muted transition-colors hover:bg-delete/10 hover:text-delete"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

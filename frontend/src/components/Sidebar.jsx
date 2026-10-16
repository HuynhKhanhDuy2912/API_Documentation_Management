import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { File, Folder, LogOut } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 h-screen bg-dark-card border-r border-dark-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-5 border-b border-dark-border">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <File className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-semibold text-dark-text">Quản Lý Tài Liệu API</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <Link
          to="/"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${isActive('/')
              ? 'bg-blue-600 text-white'
              : 'text-dark-muted hover:bg-dark-border hover:text-dark-text'
            }`}
        >
          <Folder className="w-4 h-4" aria-hidden="true" />
          Projects
        </Link>
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-dark-border">
        {user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-blue-700">
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
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

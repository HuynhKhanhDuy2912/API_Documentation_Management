import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { CircleAlert, CircleCheck, Info, LoaderCircle, X } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TopNavigation from './components/TopNavigation';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-dark">
      <TopNavigation />
      <main className="mx-auto w-full max-w-[1920px] p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<ProjectList />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
        </Routes>
      </main>
    </div>
  );
}

function AppNotifications() {
  const location = useLocation();

  return (
    <Toaster position="top-right" gutter={12} toastOptions={{ duration: 4000 }}>
      {(item) => {
        const isError = item.type === 'error';
        const isSuccess = item.type === 'success';
        const isLoading = item.type === 'loading';
        const Icon = isError ? CircleAlert : isSuccess ? CircleCheck : isLoading ? LoaderCircle : Info;
        const title = isError
          ? location.pathname === '/login'
            ? 'Đăng nhập thất bại'
            : location.pathname === '/register'
              ? 'Đăng ký thất bại'
              : 'Thao tác không thành công'
          : isSuccess
            ? 'Thành công'
            : isLoading
              ? 'Đang xử lý'
              : 'Thông báo';
        const colors = isError
          ? 'border-rose-200 bg-rose-50 text-rose-950'
          : isSuccess
            ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
            : isLoading
              ? 'border-blue-200 bg-blue-50 text-blue-950'
              : 'border-slate-200 bg-white text-slate-900';
        const iconColor = isError
          ? 'text-rose-600'
          : isSuccess
            ? 'text-emerald-600'
            : isLoading
              ? 'text-blue-600'
              : 'text-slate-500';

        return (
          <div
            role={isError ? 'alert' : 'status'}
            aria-live={isError ? 'assertive' : 'polite'}
            className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg shadow-slate-950/10 ${colors}`}
            style={{
              width: 'min(450px, calc(100vw - 32px))',
              opacity: item.visible ? 1 : 0,
              transform: item.visible ? 'translateY(0)' : 'translateY(-8px)',
              transition: 'opacity 180ms ease, transform 180ms ease',
            }}
          >
            <Icon
              className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor} ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-5">{title}</p>
              <div className="mt-1 break-words text-sm leading-5 opacity-80">
                {item.message}
              </div>
            </div>
            <button
              type="button"
              onClick={() => toast.dismiss(item.id)}
              aria-label="Đóng thông báo"
              className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md opacity-60 transition hover:bg-black/5 hover:opacity-100"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      }}
    </Toaster>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<GuestRoute><Login /></GuestRoute>}
          />
          <Route
            path="/register"
            element={<GuestRoute><Register /></GuestRoute>}
          />
          <Route
            path="/*"
            element={<ProtectedRoute><AppLayout /></ProtectedRoute>}
          />
        </Routes>
        <AppNotifications />
      </AuthProvider>
    </BrowserRouter>
  );
}

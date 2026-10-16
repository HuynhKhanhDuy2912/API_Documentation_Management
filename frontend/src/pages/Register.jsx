import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, FileText, LoaderCircle, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('Đăng ký thành công');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080f1b] px-4 py-8 text-dark-text">
      <section className="w-full max-w-[440px] rounded-[28px] border border-white/[0.09] bg-[#111b2b]/90 p-6 shadow-2xl shadow-black/25 sm:p-8 xl:p-9">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-5 flex w-fit items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-600 bg-blue-600 text-blue">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="text-left">
              <p className="text-base font-semibold tracking-tight text-white">API Documentation Management</p>
            </div>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Tạo tài khoản</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Bắt đầu tổ chức tài liệu API theo từng project.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="register-name" className="mb-2 block text-sm font-medium text-slate-200">Tên hiển thị</label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id="register-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Tên của bạn"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0b1423] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-slate-200">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id="register-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0b1423] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-slate-200">Mật khẩu</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id="register-password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Ít nhất 6 ký tự"
              required
              minLength={6}
              className="w-full rounded-xl border border-white/10 bg-[#0b1423] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-medium text-slate-200">Xác nhận mật khẩu</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id="register-confirm-password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Nhập lại mật khẩu"
              required
              minLength={6}
              className="w-full rounded-xl border border-white/10 bg-[#0b1423] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white bg-blue-600 shadow-lg shadow-indigo-950/40 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
        </button>
        </form>

        <div className="my-6 h-px bg-white/[0.07]" />
        <p className="text-center text-sm text-slate-400">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-blue-600 transition hover:text-white">Đăng nhập</Link>
        </p>
      </section>
    </main>
  );
}

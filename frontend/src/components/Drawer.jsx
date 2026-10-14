import { useEffect } from 'react';

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'w-full md:w-[85vw] lg:w-[75vw] xl:w-[70vw] max-w-5xl',
}) {
  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          className={`${width} bg-dark-card border-l border-dark-border shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out animate-slideLeft`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-dark/40 sticky top-0 z-20 backdrop-blur-md">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-dark-text flex items-center gap-2">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-dark-muted mt-0.5">{subtitle}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-[11px] font-mono text-dark-muted px-2 py-0.5 rounded bg-dark-border/40 border border-dark-border">
                ESC để đóng
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-muted hover:text-dark-text hover:bg-dark-border/60 transition-colors cursor-pointer"
                title="Đóng (ESC)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

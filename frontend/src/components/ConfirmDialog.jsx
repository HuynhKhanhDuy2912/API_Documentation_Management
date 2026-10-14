export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-dark-card border border-dark-border rounded-xl w-full max-w-md shadow-2xl mx-4 p-6">
        <div className="w-12 h-12 rounded-full bg-delete/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-delete" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-dark-text text-center mb-2">{title}</h3>
        <p className="text-sm text-dark-muted text-center mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-dark-border text-dark-text text-sm font-medium hover:bg-dark-border transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-delete text-white text-sm font-medium hover:bg-delete/80 transition-colors cursor-pointer"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

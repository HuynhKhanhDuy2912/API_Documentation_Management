export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal content */}
      <div className="relative bg-dark-card border border-dark-border rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-border sticky top-0 bg-dark-card rounded-t-xl z-10">
          <h2 className="text-lg font-semibold text-dark-text">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-muted hover:text-dark-text hover:bg-dark-border transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

import { FiX } from "react-icons/fi";

export default function MobileFilterModal({
  isOpen,
  onClose,
  title,
  children,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 sm:hidden"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl z-50 sm:hidden animate-slide-up max-h-[85vh]">
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 p-6 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-2" aria-label="Close">
              <FiX className="text-lg" />
            </button>
          </div>
        </div>

        {/* Content with scrolling */}
        <div className="overflow-y-auto h-[calc(85vh-80px)] px-6 pb-6">
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

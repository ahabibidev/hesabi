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
      <div className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl z-50 p-6 sm:hidden animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2" aria-label="Close">
            <FiX className="text-lg" />
          </button>
        </div>
        {children}
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

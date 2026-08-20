"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Yes, Delete",
  loading = false,
}: ConfirmDeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5"
          >
            {/* Header / Icon */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 border border-rose-200 shadow-2xs">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">{title}</h3>
                  <p className="text-xs text-ink-muted mt-0.5">{description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-secondary text-xs py-2 px-4 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold py-2 px-4 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> {confirmText}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

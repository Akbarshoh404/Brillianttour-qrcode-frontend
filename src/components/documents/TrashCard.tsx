import { motion } from "framer-motion";
import { AlertTriangle, FileText, RotateCcw, Trash2 } from "lucide-react";

import { formatDateTime, formatRelativeTime } from "@/utils/format";
import type { Document } from "@/types";

interface TrashCardProps {
  document: Document;
  onRestore: (document: Document) => void;
  onDeletePermanently: (document: Document) => void;
  isRestoring?: boolean;
}

export function TrashCard({ document, onRestore, onDeletePermanently, isRestoring }: TrashCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="glass glass-border flex flex-col gap-4 rounded-3xl p-5 shadow-card dark:shadow-card-dark sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-400/20 text-gray-500 dark:text-gray-400">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50" title={document.title}>
            {document.title}
          </h3>
          <p className="truncate font-mono text-[11px] text-gray-400">{document.uuid}</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            {document.purge_at
              ? `Permanently deleted ${formatRelativeTime(document.purge_at)}`
              : "Pending permanent deletion"}
            <span className="text-gray-400">· moved to trash {formatDateTime(document.deleted_at)}</span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => onRestore(document)}
          disabled={isRestoring}
          className="flex items-center gap-1.5 rounded-xl bg-black/[0.04] px-3.5 py-2 text-xs font-medium text-gray-800 transition hover:bg-black/[0.07] disabled:cursor-wait disabled:opacity-60 dark:bg-white/10 dark:text-gray-100 dark:hover:bg-white/15"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restore
        </button>
        <button
          type="button"
          onClick={() => onDeletePermanently(document)}
          className="flex items-center gap-1.5 rounded-xl bg-red-500/10 px-3.5 py-2 text-xs font-medium text-red-600 transition hover:bg-red-500/20 dark:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete forever
        </button>
      </div>
    </motion.div>
  );
}

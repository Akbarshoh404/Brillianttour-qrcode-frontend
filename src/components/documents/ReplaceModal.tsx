import { AnimatePresence, motion } from "framer-motion";
import { FileText, RefreshCcw, X } from "lucide-react";
import { useCallback, useState, type DragEvent as ReactDragEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { getApiErrorMessage } from "@/services/api";
import { useReplaceDocument } from "@/hooks/useDocuments";
import type { Document } from "@/types";
import { formatBytes } from "@/utils/format";

interface ReplaceModalProps {
  document: Document | null;
  onClose: () => void;
}

export function ReplaceModal({ document, onClose }: ReplaceModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const { showToast } = useToast();
  const replace = useReplaceDocument();

  const resetAndClose = useCallback(() => {
    setFile(null);
    setProgress(0);
    onClose();
  }, [onClose]);

  const pickFile = useCallback((candidate: File | undefined | null) => {
    if (!candidate) return;
    if (candidate.type !== "application/pdf" && !candidate.name.toLowerCase().endsWith(".pdf")) return;
    setFile(candidate);
  }, []);

  const handleDrop = (event: ReactDragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    pickFile(event.dataTransfer.files?.[0]);
  };

  const handleReplace = async () => {
    if (!document || !file) return;
    try {
      await replace.mutateAsync({ uuid: document.uuid, file, onProgress: setProgress });
      showToast("PDF replaced. The QR code still points here.", "success");
      resetAndClose();
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    }
  };

  return (
    <Modal
      isOpen={!!document}
      onClose={resetAndClose}
      title="Replace PDF"
      description={document ? `The QR code for "${document.title}" will keep working — only the file changes.` : undefined}
    >
      <div className="space-y-4">
        {!file ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
              isDragging
                ? "border-indigo-500 bg-indigo-500/5"
                : "border-black/10 hover:border-black/20 dark:border-white/15 dark:hover:border-white/25"
            }`}
          >
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <RefreshCcw className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Drop the replacement PDF, or <span className="text-indigo-500">browse</span>
            </p>
          </label>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/10">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{file.name}</p>
              <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
            </div>
            {!replace.isPending && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-black/[0.05] hover:text-gray-700 dark:hover:bg-white/10"
                aria-label="Remove selected file"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <AnimatePresence>
          {replace.isPending && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
                <motion.div className="h-full rounded-full bg-indigo-500" animate={{ width: `${progress}%` }} transition={{ ease: "easeOut" }} />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">Uploading… {progress}%</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={resetAndClose} disabled={replace.isPending}>
            Cancel
          </Button>
          <Button type="button" variant="primary" isLoading={replace.isPending} disabled={!file} onClick={handleReplace}>
            Replace PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
}

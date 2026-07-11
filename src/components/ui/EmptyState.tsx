import { motion } from "framer-motion";
import { FileSearch, FileUp, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  variant: "no-documents" | "no-results" | "empty-trash";
  onUploadClick?: () => void;
}

const COPY: Record<EmptyStateProps["variant"], { icon: typeof FileUp; title: string; body: string }> = {
  "no-documents": {
    icon: FileUp,
    title: "No documents yet",
    body: "Upload your first PDF to generate a permanent QR code for it.",
  },
  "no-results": {
    icon: FileSearch,
    title: "No documents match your search",
    body: "Try a different title or UUID.",
  },
  "empty-trash": {
    icon: Trash2,
    title: "Trash is empty",
    body: "Deleted documents show up here for 7 days before they're gone for good.",
  },
};

export function EmptyState({ variant, onUploadClick }: EmptyStateProps) {
  const { icon: Icon, title, body } = COPY[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 px-6 py-20 text-center dark:border-white/10"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">{body}</p>
      {variant === "no-documents" && onUploadClick && (
        <Button variant="primary" className="mt-6" onClick={onUploadClick}>
          <FileUp className="h-4 w-4" />
          Upload a PDF
        </Button>
      )}
    </motion.div>
  );
}

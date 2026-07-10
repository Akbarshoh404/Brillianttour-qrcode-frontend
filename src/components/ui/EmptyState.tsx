import { motion } from "framer-motion";
import { FileSearch, FileUp } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  variant: "no-documents" | "no-results";
  onUploadClick?: () => void;
}

export function EmptyState({ variant, onUploadClick }: EmptyStateProps) {
  const isSearch = variant === "no-results";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 px-6 py-20 text-center dark:border-white/10"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
        {isSearch ? <FileSearch className="h-7 w-7" /> : <FileUp className="h-7 w-7" />}
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {isSearch ? "No documents match your search" : "No documents yet"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {isSearch
          ? "Try a different title or UUID."
          : "Upload your first PDF to generate a permanent QR code for it."}
      </p>
      {!isSearch && onUploadClick && (
        <Button variant="primary" className="mt-6" onClick={onUploadClick}>
          <FileUp className="h-4 w-4" />
          Upload a PDF
        </Button>
      )}
    </motion.div>
  );
}

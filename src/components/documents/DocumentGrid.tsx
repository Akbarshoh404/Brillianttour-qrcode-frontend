import { AnimatePresence, motion } from "framer-motion";

import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Document } from "@/types";

interface DocumentGridProps {
  documents: Document[];
  isLoading: boolean;
  isSearching: boolean;
  onUploadClick: () => void;
  onReplace: (document: Document) => void;
  onDelete: (document: Document) => void;
  onPreviewQr: (document: Document) => void;
}

export function DocumentGrid({
  documents,
  isLoading,
  isSearching,
  onUploadClick,
  onReplace,
  onDelete,
  onPreviewQr,
}: DocumentGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <DocumentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return <EmptyState variant={isSearching ? "no-results" : "no-documents"} onUploadClick={onUploadClick} />;
  }

  return (
    <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {documents.map((document) => (
          <DocumentCard
            key={document.uuid}
            document={document}
            onReplace={onReplace}
            onDelete={onDelete}
            onPreviewQr={onPreviewQr}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

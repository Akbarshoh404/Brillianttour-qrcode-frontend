import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Document } from "@/types";

const COLUMNS = 2; // must match the lg:grid-cols-2 below

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
  // Keyed by row index so expanding one card also expands whichever card
  // shares its row in the 2-column grid — a single card taller than its
  // neighbor looks broken, so rows expand together.
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (rowIndex: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowIndex)) next.delete(rowIndex);
      else next.add(rowIndex);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
    <motion.div layout className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <AnimatePresence mode="popLayout">
        {documents.map((document, index) => {
          const rowIndex = Math.floor(index / COLUMNS);
          return (
            <DocumentCard
              key={document.uuid}
              document={document}
              isExpanded={expandedRows.has(rowIndex)}
              onToggleExpand={() => toggleRow(rowIndex)}
              onReplace={onReplace}
              onDelete={onDelete}
              onPreviewQr={onPreviewQr}
            />
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}

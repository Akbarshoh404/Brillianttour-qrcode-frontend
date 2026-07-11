import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { PermanentDeleteDialog } from "@/components/documents/PermanentDeleteDialog";
import { TrashCard } from "@/components/documents/TrashCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { DocumentCardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useRestoreDocument, useTrash } from "@/hooks/useDocuments";
import { getApiErrorMessage } from "@/services/api";
import type { Document } from "@/types";

export function Trash() {
  const { data, isLoading } = useTrash();
  const restore = useRestoreDocument();
  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [restoringUuid, setRestoringUuid] = useState<string | null>(null);

  const handleRestore = async (document: Document) => {
    setRestoringUuid(document.uuid);
    try {
      await restore.mutateAsync(document.uuid);
      showToast(`"${document.title}" restored.`, "success");
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    } finally {
      setRestoringUuid(null);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="glass glass-border sticky top-0 z-40 border-b">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-4">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-black/[0.05] dark:text-gray-300 dark:hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-400/20 text-gray-500 dark:text-gray-400">
              <Trash2 className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Trash</h1>
              <p className="text-[11px] text-gray-400">Deleted documents — permanently removed after 7 days</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <DocumentCardSkeleton key={i} />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState variant="empty-trash" />
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {data.items.map((document) => (
                <TrashCard
                  key={document.uuid}
                  document={document}
                  onRestore={handleRestore}
                  onDeletePermanently={setDeleteTarget}
                  isRestoring={restoringUuid === document.uuid}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <PermanentDeleteDialog document={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  );
}

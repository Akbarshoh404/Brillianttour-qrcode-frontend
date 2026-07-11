import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { getApiErrorMessage } from "@/services/api";
import { usePermanentlyDeleteDocument } from "@/hooks/useDocuments";
import type { Document } from "@/types";

interface PermanentDeleteDialogProps {
  document: Document | null;
  onClose: () => void;
}

export function PermanentDeleteDialog({ document, onClose }: PermanentDeleteDialogProps) {
  const { showToast } = useToast();
  const removePermanently = usePermanentlyDeleteDocument();

  const handleDelete = async () => {
    if (!document) return;
    try {
      await removePermanently.mutateAsync(document.uuid);
      showToast("Deleted permanently.", "success");
      onClose();
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    }
  };

  return (
    <Modal isOpen={!!document} onClose={onClose} title="Delete forever">
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-2xl bg-red-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This immediately and permanently deletes{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">{document?.title}</span>, its file, and
            all scan/download history. There is no recovering it after this — unlike moving to trash, this cannot be
            undone.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={removePermanently.isPending}>
            Cancel
          </Button>
          <Button type="button" variant="danger" isLoading={removePermanently.isPending} onClick={handleDelete}>
            Delete forever
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { getApiErrorMessage } from "@/services/api";
import { useDeleteDocument } from "@/hooks/useDocuments";
import type { Document } from "@/types";

interface DeleteDialogProps {
  document: Document | null;
  onClose: () => void;
}

export function DeleteDialog({ document, onClose }: DeleteDialogProps) {
  const { showToast } = useToast();
  const deleteDocument = useDeleteDocument();

  const handleDelete = async () => {
    if (!document) return;
    try {
      await deleteDocument.mutateAsync(document.uuid);
      showToast("Document deleted permanently.", "success");
      onClose();
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    }
  };

  return (
    <Modal isOpen={!!document} onClose={onClose} title="Delete PDF">
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-2xl bg-red-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This permanently deletes <span className="font-semibold text-gray-900 dark:text-gray-100">{document?.title}</span>,
            its QR code destination, and all scan/download history. Anyone who scans the existing QR code will see a 404 page.
            This cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={deleteDocument.isPending}>
            Cancel
          </Button>
          <Button type="button" variant="danger" isLoading={deleteDocument.isPending} onClick={handleDelete}>
            Delete permanently
          </Button>
        </div>
      </div>
    </Modal>
  );
}

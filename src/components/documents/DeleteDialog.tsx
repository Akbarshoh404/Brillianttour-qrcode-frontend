import { Trash2 } from "lucide-react";

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
      showToast("Moved to trash. It'll be gone for good in 7 days unless you restore it.", "success");
      onClose();
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    }
  };

  return (
    <Modal isOpen={!!document} onClose={onClose} title="Move to trash">
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-2xl bg-red-500/5 p-4">
          <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{document?.title}</span> will move to the
            trash. Its QR code stops working immediately (visitors see a 404). You can restore it from the trash any
            time in the next 7 days — after that it's deleted permanently, including its scan/download history.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={deleteDocument.isPending}>
            Cancel
          </Button>
          <Button type="button" variant="danger" isLoading={deleteDocument.isPending} onClick={handleDelete}>
            Move to trash
          </Button>
        </div>
      </div>
    </Modal>
  );
}

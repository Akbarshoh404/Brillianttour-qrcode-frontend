import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { getApiErrorMessage } from "@/services/api";
import { useDeleteAllTrash } from "@/hooks/useDocuments";

interface PermanentDeleteAllDialogProps {
  isOpen: boolean;
  count: number;
  onClose: () => void;
}

export function PermanentDeleteAllDialog({ isOpen, count, onClose }: PermanentDeleteAllDialogProps) {
  const { showToast } = useToast();
  const removeAll = useDeleteAllTrash();

  const handleDelete = async () => {
    try {
      await removeAll.mutateAsync();
      showToast("Trash emptied.", "success");
      onClose();
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Empty trash">
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-2xl bg-red-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This immediately and permanently deletes{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              all {count} document{count === 1 ? "" : "s"}
            </span>{" "}
            in the trash, their files, and all scan/download history. There is no recovering them after this.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={removeAll.isPending}>
            Cancel
          </Button>
          <Button type="button" variant="danger" isLoading={removeAll.isPending} onClick={handleDelete}>
            Delete all forever
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Folder } from "@/types";

interface ForceDeleteFolderDialogProps {
  folder: Folder | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function ForceDeleteFolderDialog({ folder, onClose, onConfirm, isDeleting }: ForceDeleteFolderDialogProps) {
  return (
    <Modal isOpen={!!folder} onClose={onClose} title="Folder isn't empty">
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-2xl bg-red-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{folder?.name}</span> still has
            documents in it (including trash). Deleting it anyway permanently deletes all of those documents,
            their files, and all scan/download history — there is no recovering them after this.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" isLoading={isDeleting} onClick={onConfirm}>
            Delete anyway
          </Button>
        </div>
      </div>
    </Modal>
  );
}

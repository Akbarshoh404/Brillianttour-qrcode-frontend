import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useCreateFolder } from "@/hooks/useFolders";
import { getApiErrorMessage } from "@/services/api";

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (folderId: number) => void;
}

interface FormValues {
  name: string;
}

export function AddFolderModal({ isOpen, onClose, onCreated }: AddFolderModalProps) {
  const { showToast } = useToast();
  const createFolder = useCreateFolder();

  const { register, handleSubmit, reset } = useForm<FormValues>({ defaultValues: { name: "" } });

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async ({ name }) => {
    try {
      const folder = await createFolder.mutateAsync(name);
      showToast(`Folder "${folder.name}" created.`, "success");
      onCreated?.(folder.id);
      close();
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="New folder"
      description="Creates a dedicated storage bucket for this folder — documents filed into it are physically isolated."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Folder name</label>
          <input
            {...register("name", { required: true })}
            type="text"
            placeholder="e.g. Invoices"
            autoFocus
            className="w-full rounded-xl border border-black/[0.06] bg-black/[0.03] px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-100"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={close} disabled={createFolder.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={createFolder.isPending}>
            Create folder
          </Button>
        </div>
      </form>
    </Modal>
  );
}

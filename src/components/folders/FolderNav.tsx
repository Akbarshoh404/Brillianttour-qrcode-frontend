import type { AxiosError } from "axios";
import { Folder as FolderIcon, Plus, X } from "lucide-react";
import { useState } from "react";

import { AddFolderModal } from "@/components/folders/AddFolderModal";
import { ForceDeleteFolderDialog } from "@/components/folders/ForceDeleteFolderDialog";
import { useToast } from "@/components/ui/Toast";
import { useDeleteFolder, useFolders } from "@/hooks/useFolders";
import { getApiErrorMessage } from "@/services/api";
import type { Folder } from "@/types";

interface FolderNavProps {
  selectedFolderId: number | null;
  onSelectFolder: (folderId: number | null) => void;
}

export function FolderNav({ selectedFolderId, onSelectFolder }: FolderNavProps) {
  const { data: folders, isLoading } = useFolders();
  const deleteFolder = useDeleteFolder();
  const { showToast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [forceDeleteTarget, setForceDeleteTarget] = useState<Folder | null>(null);

  const handleDelete = async (folder: Folder) => {
    try {
      await deleteFolder.mutateAsync({ id: folder.id });
      showToast(`Folder "${folder.name}" deleted.`, "success");
      if (selectedFolderId === folder.id) onSelectFolder(null);
    } catch (error) {
      if ((error as AxiosError)?.response?.status === 409) {
        setForceDeleteTarget(folder);
        return;
      }
      showToast(getApiErrorMessage(error), "error");
    }
  };

  const handleForceDelete = async () => {
    if (!forceDeleteTarget) return;
    try {
      await deleteFolder.mutateAsync({ id: forceDeleteTarget.id, force: true });
      showToast(`Folder "${forceDeleteTarget.name}" and its documents deleted.`, "success");
      if (selectedFolderId === forceDeleteTarget.id) onSelectFolder(null);
      setForceDeleteTarget(null);
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    }
  };

  if (isLoading) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onSelectFolder(null)}
        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
          selectedFolderId === null
            ? "bg-indigo-600 text-white"
            : "bg-black/[0.04] text-gray-600 hover:bg-black/[0.07] dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15"
        }`}
      >
        All files
      </button>

      {(folders ?? []).map((folder) => {
        const isSelected = selectedFolderId === folder.id;
        return (
          <div
            key={folder.id}
            className={`group flex items-center gap-1 rounded-full pl-3.5 pr-1.5 py-1.5 text-xs font-medium transition ${
              isSelected
                ? "bg-indigo-600 text-white"
                : "bg-black/[0.04] text-gray-600 hover:bg-black/[0.07] dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15"
            }`}
          >
            <button type="button" onClick={() => onSelectFolder(folder.id)} className="flex items-center gap-1.5">
              <FolderIcon className="h-3 w-3" />
              {folder.name}
              <span className={isSelected ? "text-white/70" : "text-gray-400"}>{folder.document_count}</span>
            </button>
            <button
              type="button"
              onClick={() => handleDelete(folder)}
              title="Delete folder"
              className={`rounded-full p-1 transition ${
                isSelected ? "hover:bg-white/20" : "hover:bg-black/10 dark:hover:bg-white/20"
              }`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="flex items-center gap-1 rounded-full border border-dashed border-black/15 px-3.5 py-1.5 text-xs font-medium text-gray-500 transition hover:border-indigo-400 hover:text-indigo-500 dark:border-white/15 dark:text-gray-400"
      >
        <Plus className="h-3 w-3" />
        New folder
      </button>

      <AddFolderModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={(folderId) => onSelectFolder(folderId)}
      />
      <ForceDeleteFolderDialog
        folder={forceDeleteTarget}
        onClose={() => setForceDeleteTarget(null)}
        onConfirm={handleForceDelete}
        isDeleting={deleteFolder.isPending}
      />
    </div>
  );
}

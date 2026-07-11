import { AnimatePresence, motion } from "framer-motion";
import { FileText, Plus, UploadCloud, X } from "lucide-react";
import { useCallback, useEffect, useState, type DragEvent as ReactDragEvent } from "react";
import { useForm } from "react-hook-form";

import { AddDomainModal } from "@/components/domains/AddDomainModal";
import { AddFolderModal } from "@/components/folders/AddFolderModal";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { getApiErrorMessage } from "@/services/api";
import { useUploadDocument } from "@/hooks/useDocuments";
import { useDomains } from "@/hooks/useDomains";
import { useFolders } from "@/hooks/useFolders";
import { formatBytes } from "@/utils/format";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFolderId?: number | null;
}

interface UploadFormValues {
  title: string;
  domainId: string;
  folderId: string;
}

export function UploadModal({ isOpen, onClose, defaultFolderId = null }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const { showToast } = useToast();
  const upload = useUploadDocument();
  const { data: domains } = useDomains();
  const { data: folders } = useFolders();

  const { register, handleSubmit, reset, setValue } = useForm<UploadFormValues>({
    defaultValues: { title: "", domainId: "", folderId: defaultFolderId ? String(defaultFolderId) : "" },
  });

  useEffect(() => {
    if (isOpen) setValue("folderId", defaultFolderId ? String(defaultFolderId) : "");
  }, [isOpen, defaultFolderId, setValue]);

  const resetAndClose = useCallback(() => {
    setFile(null);
    setProgress(0);
    reset();
    onClose();
  }, [onClose, reset]);

  const pickFile = useCallback((candidate: File | undefined | null) => {
    if (!candidate) return;
    if (candidate.type !== "application/pdf" && !candidate.name.toLowerCase().endsWith(".pdf")) {
      return;
    }
    setFile(candidate);
  }, []);

  const handleDrop = (event: ReactDragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    pickFile(event.dataTransfer.files?.[0]);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!file) return;
    try {
      await upload.mutateAsync({
        file,
        title: values.title,
        domainId: values.domainId ? Number(values.domainId) : null,
        folderId: values.folderId ? Number(values.folderId) : null,
        onProgress: setProgress,
      });
      showToast("PDF uploaded and QR code generated.", "success");
      resetAndClose();
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Upload PDF" description="Drag & drop a file or browse to select one.">
      <form onSubmit={onSubmit} className="space-y-4">
        {!file ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
              isDragging
                ? "border-indigo-500 bg-indigo-500/5"
                : "border-black/10 hover:border-black/20 dark:border-white/15 dark:hover:border-white/25"
            }`}
          >
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Drop your PDF here, or <span className="text-indigo-500">browse</span>
            </p>
            <p className="text-xs text-gray-400">PDF only, up to 50MB</p>
          </label>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/10">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{file.name}</p>
              <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
            </div>
            {!upload.isPending && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-black/[0.05] hover:text-gray-700 dark:hover:bg-white/10"
                aria-label="Remove selected file"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Title <span className="text-gray-300 dark:text-gray-600">(optional — defaults to filename)</span>
          </label>
          <input
            {...register("title")}
            type="text"
            placeholder="e.g. Q3 Financial Report"
            className="w-full rounded-xl border border-black/10 bg-white/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Deploy to domain</label>
            <div className="flex gap-1.5">
              <select
                {...register("domainId")}
                className="w-full rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
              >
                {(domains ?? []).map((domain) => (
                  <option key={domain.id ?? "default"} value={domain.id ?? ""}>
                    {domain.name} ({domain.base_url.replace(/^https?:\/\//, "")})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsAddDomainOpen(true)}
                title="Add a domain"
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-black/[0.05] hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Folder</label>
            <div className="flex gap-1.5">
              <select
                {...register("folderId")}
                className="w-full rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
              >
                <option value="">No folder</option>
                {(folders ?? []).map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsAddFolderOpen(true)}
                title="Add a folder"
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-black/[0.05] hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {upload.isPending && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-indigo-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">Uploading… {progress}%</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={resetAndClose} disabled={upload.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={upload.isPending} disabled={!file}>
            Upload & Generate QR
          </Button>
        </div>
      </form>

      <AddDomainModal
        isOpen={isAddDomainOpen}
        onClose={() => setIsAddDomainOpen(false)}
        onCreated={(domainId) => setValue("domainId", String(domainId))}
      />
      <AddFolderModal
        isOpen={isAddFolderOpen}
        onClose={() => setIsAddFolderOpen(false)}
        onCreated={(folderId) => setValue("folderId", String(folderId))}
      />
    </Modal>
  );
}

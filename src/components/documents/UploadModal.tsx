import { AnimatePresence, motion } from "framer-motion";
import { FileText, UploadCloud, X } from "lucide-react";
import { useCallback, useEffect, useState, type DragEvent as ReactDragEvent } from "react";
import { useForm } from "react-hook-form";

import { AddDomainModal } from "@/components/domains/AddDomainModal";
import { AddFolderModal } from "@/components/folders/AddFolderModal";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
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
}

export function UploadModal({ isOpen, onClose, defaultFolderId = null }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [domainId, setDomainId] = useState("");
  const [folderId, setFolderId] = useState("");
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const { showToast } = useToast();
  const upload = useUploadDocument();
  const { data: domains } = useDomains();
  const { data: folders } = useFolders();

  const { register, handleSubmit, reset } = useForm<UploadFormValues>({ defaultValues: { title: "" } });

  useEffect(() => {
    if (isOpen) setFolderId(defaultFolderId ? String(defaultFolderId) : "");
  }, [isOpen, defaultFolderId]);

  const resetAndClose = useCallback(() => {
    setFile(null);
    setProgress(0);
    setDomainId("");
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
        domainId: domainId ? Number(domainId) : null,
        folderId: folderId ? Number(folderId) : null,
        onProgress: setProgress,
      });
      showToast("PDF uploaded and QR code generated.", "success");
      resetAndClose();
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    }
  });

  const domainOptions = (domains ?? []).map((domain) => ({
    value: domain.id != null ? String(domain.id) : "",
    label: domain.name,
    sublabel: domain.base_url.replace(/^https?:\/\//, ""),
  }));

  const folderOptions = [
    { value: "", label: "No folder" },
    ...(folders ?? []).map((folder) => ({ value: String(folder.id), label: folder.name })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Upload PDF"
      description="Drag & drop a file or browse to select one."
      maxWidthClassName="max-w-lg"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {!file ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed px-6 py-16 text-center transition-all ${
              isDragging
                ? "scale-[1.01] border-indigo-500 bg-indigo-500/5"
                : "border-black/10 hover:border-black/20 hover:bg-black/[0.015] dark:border-white/15 dark:hover:border-white/25 dark:hover:bg-white/[0.02]"
            }`}
          >
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <motion.div
              animate={isDragging ? { scale: 1.08, y: -4 } : { scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-glow"
            >
              <UploadCloud className="h-8 w-8" />
            </motion.div>
            <div>
              <p className="text-base font-semibold text-gray-800 dark:text-gray-100">
                Drop your PDF here, or <span className="text-indigo-500">browse</span>
              </p>
              <p className="mt-1 text-xs text-gray-400">PDF only, up to 50MB</p>
            </div>
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
            <Select
              value={domainId}
              onChange={setDomainId}
              options={domainOptions}
              onAddNew={() => setIsAddDomainOpen(true)}
              addNewLabel="Add a new domain"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Folder</label>
            <Select
              value={folderId}
              onChange={setFolderId}
              options={folderOptions}
              onAddNew={() => setIsAddFolderOpen(true)}
              addNewLabel="Add a new folder"
            />
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
        onCreated={(newDomainId) => setDomainId(String(newDomainId))}
      />
      <AddFolderModal
        isOpen={isAddFolderOpen}
        onClose={() => setIsAddFolderOpen(false)}
        onCreated={(newFolderId) => setFolderId(String(newFolderId))}
      />
    </Modal>
  );
}

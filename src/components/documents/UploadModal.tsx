import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, FileText, Loader2, Plus, UploadCloud, X } from "lucide-react";
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
  notes: string;
}

type FileStatus = "pending" | "uploading" | "done" | "error";

interface FileState {
  progress: number;
  status: FileStatus;
  error?: string;
}

const fileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

export function UploadModal({ isOpen, onClose, defaultFolderId = null }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [fileStates, setFileStates] = useState<Record<string, FileState>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domainId, setDomainId] = useState("");
  const [folderId, setFolderId] = useState("");
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const { showToast } = useToast();
  const upload = useUploadDocument();
  const { data: domains } = useDomains();
  const { data: folders } = useFolders();

  const { register, handleSubmit, reset } = useForm<UploadFormValues>({ defaultValues: { title: "", notes: "" } });

  useEffect(() => {
    if (isOpen) setFolderId(defaultFolderId ? String(defaultFolderId) : "");
  }, [isOpen, defaultFolderId]);

  const resetAndClose = useCallback(() => {
    setFiles([]);
    setFileStates({});
    setDomainId("");
    reset();
    onClose();
  }, [onClose, reset]);

  const pickFiles = useCallback((candidates: FileList | File[] | undefined | null) => {
    if (!candidates) return;
    const incoming = Array.from(candidates).filter(
      (candidate) => candidate.type === "application/pdf" || candidate.name.toLowerCase().endsWith(".pdf")
    );
    if (incoming.length === 0) return;
    setFiles((prev) => {
      const existingKeys = new Set(prev.map(fileKey));
      const deduped = incoming.filter((candidate) => !existingKeys.has(fileKey(candidate)));
      return [...prev, ...deduped];
    });
  }, []);

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => fileKey(f) !== fileKey(file)));
    setFileStates((prev) => {
      const next = { ...prev };
      delete next[fileKey(file)];
      return next;
    });
  };

  const handleDrop = (event: ReactDragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (isSubmitting) return;
    pickFiles(event.dataTransfer.files);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (files.length === 0) return;
    setIsSubmitting(true);
    setFileStates(Object.fromEntries(files.map((f) => [fileKey(f), { progress: 0, status: "pending" as const }])));

    let failureCount = 0;
    for (const file of files) {
      const key = fileKey(file);
      setFileStates((prev) => ({ ...prev, [key]: { ...prev[key], status: "uploading" } }));
      try {
        await upload.mutateAsync({
          file,
          title: files.length === 1 ? values.title : undefined,
          notes: values.notes,
          domainId: domainId ? Number(domainId) : null,
          folderId: folderId ? Number(folderId) : null,
          onProgress: (percent) => setFileStates((prev) => ({ ...prev, [key]: { ...prev[key], progress: percent } })),
        });
        setFileStates((prev) => ({ ...prev, [key]: { progress: 100, status: "done" } }));
      } catch (error) {
        failureCount += 1;
        setFileStates((prev) => ({ ...prev, [key]: { progress: 0, status: "error", error: getApiErrorMessage(error) } }));
      }
    }

    setIsSubmitting(false);

    if (failureCount === 0) {
      showToast(
        files.length > 1 ? `${files.length} PDFs uploaded and QR codes generated.` : "PDF uploaded and QR code generated.",
        "success"
      );
      resetAndClose();
    } else {
      showToast(
        failureCount === files.length
          ? "Upload failed. Please try again."
          : `${failureCount} of ${files.length} files failed to upload.`,
        "error"
      );
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
      onClose={isSubmitting ? () => {} : resetAndClose}
      title="Upload PDF"
      description="Drag & drop one or more files or browse to select them."
      maxWidthClassName="max-w-2xl"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {files.length === 0 ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed px-6 py-20 text-center transition-all ${
              isDragging
                ? "scale-[1.01] border-indigo-500 bg-indigo-500/5"
                : "border-black/10 hover:border-black/20 hover:bg-black/[0.015] dark:border-white/15 dark:hover:border-white/25 dark:hover:bg-white/[0.02]"
            }`}
          >
            <input
              type="file"
              accept="application/pdf,.pdf"
              multiple
              className="hidden"
              onChange={(e) => pickFiles(e.target.files)}
            />
            <motion.div
              animate={isDragging ? { scale: 1.08, y: -4 } : { scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-glow"
            >
              <UploadCloud className="h-11 w-11" />
            </motion.div>
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Drop your PDFs here, or <span className="text-indigo-500">browse</span>
              </p>
              <p className="mt-1.5 text-sm text-gray-400">PDF only, up to 50MB each — multiple files supported</p>
            </div>
          </label>
        ) : (
          <div className="space-y-2.5">
            <div className="max-h-64 space-y-2 overflow-y-auto pr-0.5">
              <AnimatePresence initial={false}>
                {files.map((file) => {
                  const state = fileStates[fileKey(file)];
                  return (
                    <motion.div
                      key={fileKey(file)}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/10"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{file.name}</p>
                        {state?.status === "uploading" ? (
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
                            <motion.div
                              className="h-full rounded-full bg-indigo-500"
                              animate={{ width: `${state.progress}%` }}
                              transition={{ ease: "easeOut" }}
                            />
                          </div>
                        ) : state?.status === "error" ? (
                          <p className="truncate text-xs text-red-500">{state.error ?? "Upload failed."}</p>
                        ) : (
                          <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                        )}
                      </div>
                      {state?.status === "done" ? (
                        <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                      ) : state?.status === "error" ? (
                        <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                      ) : state?.status === "uploading" ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-400" />
                      ) : (
                        !isSubmitting && (
                          <button
                            type="button"
                            onClick={() => removeFile(file)}
                            className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-black/[0.05] hover:text-gray-700 dark:hover:bg-white/10"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {!isSubmitting && (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/10 px-4 py-3 text-sm font-medium text-gray-500 transition hover:border-indigo-400 hover:text-indigo-500 dark:border-white/15 dark:text-gray-400">
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => pickFiles(e.target.files)}
                />
                <Plus className="h-4 w-4" />
                Add more files
              </label>
            )}
          </div>
        )}

        {files.length <= 1 && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Title <span className="text-gray-400 dark:text-gray-500">(optional — defaults to filename)</span>
            </label>
            <input
              {...register("title")}
              type="text"
              placeholder="e.g. Q3 Financial Report"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-black/10 bg-white/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
            />
          </div>
        )}
        {files.length > 1 && (
          <p className="text-xs text-gray-400">Each file's title defaults to its own filename.</p>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Notes <span className="text-gray-400 dark:text-gray-500">(optional — internal only, never shown to scanners)</span>
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Any context worth remembering about this QR code…"
            disabled={isSubmitting}
            className="w-full resize-none rounded-xl border border-black/10 bg-white/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={resetAndClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={files.length === 0}>
            {files.length > 1 ? `Upload ${files.length} PDFs & Generate QR Codes` : "Upload & Generate QR"}
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

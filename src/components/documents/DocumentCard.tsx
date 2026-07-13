import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Copy,
  Download,
  Eye,
  FileText,
  Folder as FolderIcon,
  Globe2,
  Link2,
  Loader2,
  PauseCircle,
  QrCode,
  RefreshCcw,
  Scan,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { DocumentCardDetails } from "@/components/documents/DocumentCardDetails";
import { QrImage } from "@/components/documents/QrImage";
import { useToast } from "@/components/ui/Toast";
import { copyToClipboard } from "@/utils/clipboard";
import { downloadQrImage } from "@/utils/download";
import { formatDate, formatRelativeTime } from "@/utils/format";
import type { Document } from "@/types";

interface DocumentCardProps {
  document: Document;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onReplace: (document: Document) => void;
  onDelete: (document: Document) => void;
  onPreviewQr: (document: Document) => void;
}

function StatTile({ label, value, caption }: { label: string; value: string; caption?: string }) {
  return (
    <div className="rounded-xl bg-black/[0.03] px-3 py-2 dark:bg-white/[0.04]">
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 truncate text-xs font-semibold text-gray-700 dark:text-gray-200">{value}</p>
      {caption && <p className="truncate text-[10px] text-gray-400">{caption}</p>}
    </div>
  );
}

function IconAction({
  icon: Icon,
  label,
  onClick,
  danger,
  isLoading,
}: {
  icon: typeof Copy;
  label: string;
  onClick: () => void;
  danger?: boolean;
  isLoading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors disabled:cursor-wait ${
        danger
          ? "text-gray-400 hover:bg-red-500/10 hover:text-red-500"
          : "text-gray-400 hover:bg-black/[0.05] hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
      }`}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
    </button>
  );
}

export function DocumentCard({ document, isExpanded, onToggleExpand, onReplace, onDelete, onPreviewQr }: DocumentCardProps) {
  const { showToast } = useToast();
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(document.qr_link);
    showToast(success ? "QR link copied to clipboard." : "Couldn't copy link.", success ? "success" : "error");
  };

  const handleDownloadQr = async () => {
    setIsDownloadingQr(true);
    try {
      await downloadQrImage(document.qr_url, document.uuid);
    } catch {
      showToast("Couldn't download QR code.", "error");
    } finally {
      setIsDownloadingQr(false);
    }
  };

  const hasScans = document.total_scans > 0;
  const hasDownloads = document.total_downloads > 0;
  const displayLink = document.qr_link.replace(/^https?:\/\//, "");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      whileHover={{ y: -3 }}
      className={`glass glass-border group flex flex-col rounded-3xl p-5 shadow-card transition-shadow hover:shadow-glow dark:shadow-card-dark ${
        !document.is_active ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-bold text-gray-900 dark:text-gray-50" title={document.title}>
              {document.title}
            </h3>
            {!document.is_active && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                <PauseCircle className="h-3 w-3" />
                Disabled
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <p className="truncate font-mono text-[11px] text-gray-400">{document.uuid}</p>
            <button
              type="button"
              onClick={() => copyToClipboard(document.uuid).then((ok) => ok && showToast("UUID copied.", "success"))}
              className="shrink-0 text-gray-300 transition hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Copy UUID"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
          {(document.domain_name || document.folder_name) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {document.domain_name && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-400">
                  <Globe2 className="h-2.5 w-2.5" />
                  {document.domain_name}
                </span>
              )}
              {document.folder_name && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                  <FolderIcon className="h-2.5 w-2.5" />
                  {document.folder_name}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onPreviewQr(document)}
          className="group/qr relative shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white p-1.5 transition hover:scale-105 hover:border-indigo-300 dark:border-white/10"
          title="Preview QR code"
        >
          <QrImage src={document.qr_url} alt={`QR code for ${document.title}`} size={44} />
        </button>
      </div>

      <button
        type="button"
        onClick={handleCopyLink}
        title="Copy QR link"
        className="mt-3 flex w-full items-center gap-2 rounded-xl bg-indigo-500/5 px-3 py-2 text-left transition hover:bg-indigo-500/10"
      >
        <Link2 className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-indigo-600 dark:text-indigo-300">{displayLink}</span>
        <Copy className="h-3 w-3 shrink-0 text-indigo-400" />
      </button>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatTile label="Size" value={document.file_size_readable} />
        <StatTile label="Uploaded" value={formatDate(document.created_at)} />
        <StatTile label="Updated" value={formatRelativeTime(document.updated_at)} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-black/[0.03] px-3 py-2 dark:bg-white/[0.04]">
          <Scan className={`h-3.5 w-3.5 shrink-0 ${hasScans ? "text-indigo-400" : "text-gray-300 dark:text-gray-600"}`} />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Scans</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              {document.total_scans}
              {hasScans && <span className="ml-1 font-normal text-gray-400">· {formatRelativeTime(document.last_scan)}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-black/[0.03] px-3 py-2 dark:bg-white/[0.04]">
          <Download className={`h-3.5 w-3.5 shrink-0 ${hasDownloads ? "text-indigo-400" : "text-gray-300 dark:text-gray-600"}`} />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Downloads</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              {document.total_downloads}
              {hasDownloads && (
                <span className="ml-1 font-normal text-gray-400">· {formatRelativeTime(document.last_download)}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={document.view_url}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-black/[0.04] px-3 py-2 text-xs font-medium text-gray-800 transition hover:bg-black/[0.07] dark:bg-white/10 dark:text-gray-100 dark:hover:bg-white/15"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </a>
        <a
          href={document.download_url}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_8px_rgba(79,70,229,0.25)] transition hover:from-indigo-400 hover:to-indigo-500"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </a>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-black/[0.05] pt-2 dark:border-white/[0.06]">
        <div className="flex items-center">
          <IconAction icon={QrCode} label="Download QR" onClick={handleDownloadQr} isLoading={isDownloadingQr} />
          <IconAction icon={Copy} label="Copy QR Link" onClick={handleCopyLink} />
          <IconAction icon={RefreshCcw} label="Replace PDF" onClick={() => onReplace(document)} />
          <IconAction icon={Trash2} label="Delete PDF" danger onClick={() => onDelete(document)} />
        </div>
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-black/[0.05] hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200"
        >
          {isExpanded ? "Hide details" : "Show details"}
          <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4">
              <DocumentCardDetails document={document} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

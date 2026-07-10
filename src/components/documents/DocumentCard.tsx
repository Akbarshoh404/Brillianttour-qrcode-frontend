import { motion } from "framer-motion";
import { Copy, Download, Eye, FileText, QrCode, RefreshCcw, Scan, Trash2 } from "lucide-react";

import { useToast } from "@/components/ui/Toast";
import { copyToClipboard } from "@/utils/clipboard";
import { downloadQrImage } from "@/utils/download";
import { formatDate, formatRelativeTime } from "@/utils/format";
import type { Document } from "@/types";

interface DocumentCardProps {
  document: Document;
  onReplace: (document: Document) => void;
  onDelete: (document: Document) => void;
  onPreviewQr: (document: Document) => void;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/[0.03] px-3 py-2 dark:bg-white/[0.04]">
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 truncate text-xs font-semibold text-gray-700 dark:text-gray-200">{value}</p>
    </div>
  );
}

function IconAction({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Copy;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
        danger
          ? "text-gray-400 hover:bg-red-500/10 hover:text-red-500"
          : "text-gray-400 hover:bg-black/[0.05] hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function DocumentCard({ document, onReplace, onDelete, onPreviewQr }: DocumentCardProps) {
  const { showToast } = useToast();

  const handleCopyLink = async () => {
    const success = await copyToClipboard(document.qr_link);
    showToast(success ? "QR link copied to clipboard." : "Couldn't copy link.", success ? "success" : "error");
  };

  const handleDownloadQr = async () => {
    try {
      await downloadQrImage(document.qr_url, document.uuid);
    } catch {
      showToast("Couldn't download QR code.", "error");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      whileHover={{ y: -3 }}
      className="glass glass-border group flex flex-col rounded-3xl p-5 shadow-card transition-shadow hover:shadow-glow dark:shadow-card-dark"
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50" title={document.title}>
            {document.title}
          </h3>
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
        </div>
        <button
          type="button"
          onClick={() => onPreviewQr(document)}
          className="shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white p-1 transition hover:scale-105 hover:border-indigo-300 dark:border-white/10"
          title="Preview QR code"
        >
          <img src={document.qr_url} alt={`QR code for ${document.title}`} className="h-11 w-11" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatTile label="Size" value={document.file_size_readable} />
        <StatTile label="Uploaded" value={formatDate(document.created_at)} />
        <StatTile label="Updated" value={formatRelativeTime(document.updated_at)} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-black/[0.03] px-3 py-2 dark:bg-white/[0.04]">
          <Scan className="h-3.5 w-3.5 text-indigo-400" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Scans</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{document.total_scans}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-black/[0.03] px-3 py-2 dark:bg-white/[0.04]">
          <Download className="h-3.5 w-3.5 text-indigo-400" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Downloads</p>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{document.total_downloads}</p>
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
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-500"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </a>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-black/[0.05] pt-2 dark:border-white/[0.06]">
        <IconAction icon={QrCode} label="Download QR" onClick={handleDownloadQr} />
        <IconAction icon={Copy} label="Copy QR Link" onClick={handleCopyLink} />
        <IconAction icon={RefreshCcw} label="Replace PDF" onClick={() => onReplace(document)} />
        <IconAction icon={Trash2} label="Delete PDF" danger onClick={() => onDelete(document)} />
      </div>
    </motion.div>
  );
}

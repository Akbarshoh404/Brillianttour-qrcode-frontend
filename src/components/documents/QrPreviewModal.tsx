import { Copy, Download } from "lucide-react";
import { useState } from "react";

import { QrImage } from "@/components/documents/QrImage";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { copyToClipboard } from "@/utils/clipboard";
import { downloadQrImage } from "@/utils/download";
import type { Document } from "@/types";

interface QrPreviewModalProps {
  document: Document | null;
  onClose: () => void;
}

export function QrPreviewModal({ document, onClose }: QrPreviewModalProps) {
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopyLink = async () => {
    if (!document) return;
    const success = await copyToClipboard(document.qr_link);
    showToast(success ? "QR link copied to clipboard." : "Couldn't copy link.", success ? "success" : "error");
  };

  const handleDownload = async () => {
    if (!document) return;
    setIsDownloading(true);
    try {
      await downloadQrImage(document.qr_url, document.uuid);
    } catch {
      showToast("Couldn't download QR code.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal isOpen={!!document} onClose={onClose} title={document?.title ?? ""} description="Permanent QR code">
      {document && (
        <div className="space-y-5">
          <div className="flex items-center justify-center rounded-2xl bg-white p-3">
            <QrImage src={document.qr_url} alt={`QR code for ${document.title}`} size={208} />
          </div>
          <div className="rounded-xl bg-black/[0.04] px-3.5 py-2.5 text-center font-mono text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">
            {document.qr_link}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
            <Button variant="primary" className="flex-1" isLoading={isDownloading} onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download QR
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

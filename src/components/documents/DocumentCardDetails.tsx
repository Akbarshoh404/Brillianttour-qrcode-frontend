import { Globe2, Laptop2, MapPinOff, Power } from "lucide-react";

import { Switch } from "@/components/ui/Switch";
import { useScanSummary, useSetDocumentActive } from "@/hooks/useDocuments";
import { useToast } from "@/components/ui/Toast";
import { getApiErrorMessage } from "@/services/api";
import { formatDateTime, formatRelativeTime } from "@/utils/format";
import type { Document } from "@/types";

function BreakdownList({ title, icon: Icon, entries }: { title: string; icon: typeof Globe2; entries: { label: string; count: number }[] }) {
  if (entries.length === 0) {
    return (
      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
          <Icon className="h-3 w-3" />
          {title}
        </p>
        <p className="text-xs text-gray-400">No data yet</p>
      </div>
    );
  }

  const max = Math.max(...entries.map((e) => e.count));

  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
        <Icon className="h-3 w-3" />
        {title}
      </p>
      <ul className="space-y-1">
        {entries.map((entry) => (
          <li key={entry.label} className="flex items-center gap-2 text-xs">
            <span className="w-20 shrink-0 truncate text-gray-600 dark:text-gray-300">{entry.label}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
              <span
                className="block h-full rounded-full bg-indigo-400"
                style={{ width: `${Math.max(8, (entry.count / max) * 100)}%` }}
              />
            </span>
            <span className="w-5 shrink-0 text-right font-semibold text-gray-500 dark:text-gray-400">{entry.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DocumentCardDetails({ document }: { document: Document }) {
  const { showToast } = useToast();
  const { data: summary, isLoading } = useScanSummary(document.uuid, true);
  const setActive = useSetDocumentActive();

  const handleToggleActive = async (isActive: boolean) => {
    try {
      await setActive.mutateAsync({ uuid: document.uuid, isActive });
      showToast(isActive ? "QR code re-enabled." : "QR code disabled — visitors will see an unavailable page.", "success");
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    }
  };

  return (
    <div className="space-y-4 border-t border-black/[0.05] pt-4 dark:border-white/[0.06]">
      <div className="flex items-center justify-between rounded-xl bg-black/[0.03] px-3.5 py-3 dark:bg-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <Power className={`h-4 w-4 ${document.is_active ? "text-emerald-500" : "text-gray-400"}`} />
          <div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
              {document.is_active ? "QR code is active" : "QR code is disabled"}
            </p>
            <p className="text-[11px] text-gray-400">
              {document.is_active ? "Scanning it opens the PDF normally." : "Visitors see an unavailable page instead of the file."}
            </p>
          </div>
        </div>
        <Switch checked={document.is_active} onChange={handleToggleActive} disabled={setActive.isPending} label="Toggle QR code active" />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Uploaded</p>
          <p className="text-gray-600 dark:text-gray-300">{formatDateTime(document.created_at)}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Last updated</p>
          <p className="text-gray-600 dark:text-gray-300">{formatDateTime(document.updated_at)}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Last scan</p>
          <p className="text-gray-600 dark:text-gray-300">{formatDateTime(document.last_scan)}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Last download</p>
          <p className="text-gray-600 dark:text-gray-300">{formatDateTime(document.last_download)}</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-gray-400">Scan activity</p>
        {isLoading ? (
          <p className="text-xs text-gray-400">Loading…</p>
        ) : !summary || summary.total_scans === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-black/[0.03] px-3.5 py-3 text-xs text-gray-400 dark:bg-white/[0.04]">
            <MapPinOff className="h-3.5 w-3.5" />
            This document hasn't been scanned yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <BreakdownList title="Countries" icon={Globe2} entries={summary.by_country} />
            <BreakdownList title="Devices" icon={Laptop2} entries={summary.by_device} />
            <BreakdownList title="Browsers" icon={Globe2} entries={summary.by_browser} />
          </div>
        )}
      </div>

      {summary && summary.recent.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-gray-400">Recent scans</p>
          <ul className="space-y-1.5">
            {summary.recent.slice(0, 5).map((scan) => (
              <li key={scan.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-300">
                  {[scan.city, scan.country].filter(Boolean).join(", ") || "Unknown location"}
                  <span className="text-gray-400"> · {scan.device ?? "Unknown"} · {scan.browser ?? "Unknown"}</span>
                </span>
                <span className="shrink-0 text-gray-400">{formatRelativeTime(scan.created_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

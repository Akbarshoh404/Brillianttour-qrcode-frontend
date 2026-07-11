import { AnimatePresence, motion } from "framer-motion";
import { FileStack, HardDrive, LogOut, Moon, Search, Sun, Trash2, Upload } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { formatBytes } from "@/utils/format";

interface TopNavProps {
  search: string;
  onSearchChange: (value: string) => void;
  onUploadClick: () => void;
  totalDocuments: number;
  storageUsedBytes: number;
  isDark: boolean;
  onToggleDark: () => void;
  isRefreshing?: boolean;
}

export function TopNav({
  search,
  onSearchChange,
  onUploadClick,
  totalDocuments,
  storageUsedBytes,
  isDark,
  onToggleDark,
  isRefreshing,
}: TopNavProps) {
  const { logout } = useAuth();

  return (
    <header className="glass glass-border sticky top-0 z-40 border-b relative">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
            <FileStack className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-50">PDF Manager</h1>
            <p className="text-[11px] text-gray-400">Internal QR document tool</p>
          </div>
        </Link>

        <div className="relative ml-2 min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title or UUID…"
            className="w-full rounded-xl border border-black/[0.06] bg-black/[0.03] py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-100 dark:focus:bg-white/[0.06]"
          />
        </div>

        <div className="hidden items-center gap-4 rounded-xl bg-black/[0.03] px-4 py-2 text-xs text-gray-500 dark:bg-white/[0.04] dark:text-gray-400 sm:flex">
          <div className="flex items-center gap-1.5">
            <FileStack className="h-3.5 w-3.5" />
            <span className="font-semibold text-gray-700 dark:text-gray-200">{totalDocuments}</span>
            <span>PDFs</span>
          </div>
          <div className="h-3.5 w-px bg-black/10 dark:bg-white/10" />
          <div className="flex items-center gap-1.5">
            <HardDrive className="h-3.5 w-3.5" />
            <span className="font-semibold text-gray-700 dark:text-gray-200">{formatBytes(storageUsedBytes)}</span>
            <span>used</span>
          </div>
        </div>

        <Link
          to="/trash"
          title="Trash"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-black/[0.05] dark:text-gray-300 dark:hover:bg-white/10"
        >
          <Trash2 className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={onToggleDark}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-black/[0.05] dark:text-gray-300 dark:hover:bg-white/10"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <Button variant="primary" onClick={onUploadClick}>
          <Upload className="h-4 w-4" />
          Upload
        </Button>

        <button
          type="button"
          onClick={logout}
          title="Lock dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-red-500/10 hover:text-red-500 dark:text-gray-300"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ transformOrigin: "left" }}
            className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500"
          />
        )}
      </AnimatePresence>
    </header>
  );
}

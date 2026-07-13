import { AnimatePresence, motion } from "framer-motion";
import { Globe2, Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";

import { AddDomainModal } from "@/components/domains/AddDomainModal";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useDeleteDomain, useDomains } from "@/hooks/useDomains";
import { getApiErrorMessage } from "@/services/api";
import type { Domain } from "@/types";

interface ManageDomainsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageDomainsModal({ isOpen, onClose }: ManageDomainsModalProps) {
  const { data: domains, isLoading } = useDomains();
  const deleteDomain = useDeleteDomain();
  const { showToast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (domain: Domain) => {
    if (domain.id == null) return;
    setDeletingId(domain.id);
    try {
      await deleteDomain.mutateAsync(domain.id);
      showToast(`"${domain.name}" removed.`, "success");
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage domains"
      description="Domains control what gets encoded in a document's QR code."
      maxWidthClassName="max-w-xl"
    >
      <div className="space-y-4">
        {isLoading ? (
          <p className="py-6 text-center text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="max-h-80 space-y-2 overflow-y-auto">
            <AnimatePresence initial={false}>
              {(domains ?? []).map((domain) => (
                <motion.div
                  key={domain.id ?? "default"}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-black/[0.02] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                    {domain.is_default ? <ShieldCheck className="h-4.5 w-4.5" /> : <Globe2 className="h-4.5 w-4.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">{domain.name}</p>
                    <p className="truncate font-mono text-[11px] text-gray-400">
                      {domain.base_url.replace(/^https?:\/\//, "")}
                    </p>
                  </div>
                  {domain.is_default ? (
                    <span className="shrink-0 rounded-full bg-black/[0.05] px-2.5 py-1 text-[10px] font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
                      Default
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDelete(domain)}
                      disabled={deletingId === domain.id}
                      title="Remove domain"
                      aria-label={`Remove ${domain.name}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-500/10 hover:text-red-500 disabled:cursor-wait"
                    >
                      {deletingId === domain.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="flex justify-between gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add a domain
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <AddDomainModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </Modal>
  );
}

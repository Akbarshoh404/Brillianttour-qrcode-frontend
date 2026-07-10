import { useState } from "react";

import { DeleteDialog } from "@/components/documents/DeleteDialog";
import { DocumentGrid } from "@/components/documents/DocumentGrid";
import { QrPreviewModal } from "@/components/documents/QrPreviewModal";
import { ReplaceModal } from "@/components/documents/ReplaceModal";
import { UploadModal } from "@/components/documents/UploadModal";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TopNav } from "@/components/layout/TopNav";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useDebounce } from "@/hooks/useDebounce";
import { useDocuments } from "@/hooks/useDocuments";
import type { Document } from "@/types";

export function Dashboard() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [isDark, toggleDark] = useDarkMode();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<Document | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [qrPreviewTarget, setQrPreviewTarget] = useState<Document | null>(null);

  const { data, isLoading, isFetching } = useDocuments(debouncedSearch || undefined);

  return (
    <DashboardLayout
      header={
        <TopNav
          search={search}
          onSearchChange={setSearch}
          onUploadClick={() => setIsUploadOpen(true)}
          totalDocuments={data?.total ?? 0}
          storageUsedBytes={data?.storage_used_bytes ?? 0}
          isDark={isDark}
          onToggleDark={toggleDark}
          isRefreshing={isFetching && !!data}
        />
      }
    >
      <DocumentGrid
        documents={data?.items ?? []}
        isLoading={isLoading || (isFetching && !data)}
        isSearching={debouncedSearch.length > 0}
        onUploadClick={() => setIsUploadOpen(true)}
        onReplace={setReplaceTarget}
        onDelete={setDeleteTarget}
        onPreviewQr={setQrPreviewTarget}
      />

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <ReplaceModal document={replaceTarget} onClose={() => setReplaceTarget(null)} />
      <DeleteDialog document={deleteTarget} onClose={() => setDeleteTarget(null)} />
      <QrPreviewModal document={qrPreviewTarget} onClose={() => setQrPreviewTarget(null)} />
    </DashboardLayout>
  );
}

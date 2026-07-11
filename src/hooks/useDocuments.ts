import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { documentService, type UploadOptions, type UploadProgressHandler } from "@/services/documentService";
import type { DocumentListResponse, ScanSummary } from "@/types";

export const documentsQueryKey = (search?: string, folderId?: number | null) =>
  ["documents", search ?? "", folderId ?? "all"] as const;
export const trashQueryKey = ["trash"] as const;
export const scanSummaryQueryKey = (uuid: string) => ["scan-summary", uuid] as const;

export function useDocuments(search?: string, folderId?: number | null) {
  return useQuery<DocumentListResponse>({
    queryKey: documentsQueryKey(search, folderId),
    queryFn: () => documentService.list(search, folderId),
    placeholderData: (previous) => previous,
  });
}

export function useTrash() {
  return useQuery<DocumentListResponse>({
    queryKey: trashQueryKey,
    queryFn: () => documentService.listTrash(),
  });
}

export function useScanSummary(uuid: string, enabled: boolean) {
  return useQuery<ScanSummary>({
    queryKey: scanSummaryQueryKey(uuid),
    queryFn: () => documentService.scanSummary(uuid),
    enabled,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, ...options }: { file: File } & UploadOptions) => documentService.upload(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useReplaceDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uuid,
      file,
      onProgress,
    }: {
      uuid: string;
      file: File;
      onProgress?: UploadProgressHandler;
    }) => documentService.replace(uuid, file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => documentService.remove(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: trashQueryKey });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useRestoreDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => documentService.restore(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: trashQueryKey });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function usePermanentlyDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => documentService.removePermanently(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trashQueryKey });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useSetDocumentActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, isActive }: { uuid: string; isActive: boolean }) =>
      isActive ? documentService.enable(uuid) : documentService.disable(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useMoveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, folderId }: { uuid: string; folderId: number | null }) =>
      documentService.moveToFolder(uuid, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { documentService, type UploadProgressHandler } from "@/services/documentService";
import type { DocumentListResponse, ScanSummary } from "@/types";

export const documentsQueryKey = (search?: string) => ["documents", search ?? ""] as const;
export const trashQueryKey = ["trash"] as const;
export const scanSummaryQueryKey = (uuid: string) => ["scan-summary", uuid] as const;

export function useDocuments(search?: string) {
  return useQuery<DocumentListResponse>({
    queryKey: documentsQueryKey(search),
    queryFn: () => documentService.list(search),
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
    mutationFn: ({
      file,
      title,
      onProgress,
    }: {
      file: File;
      title?: string;
      onProgress?: UploadProgressHandler;
    }) => documentService.upload(file, title, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
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
    },
  });
}

export function usePermanentlyDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => documentService.removePermanently(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trashQueryKey });
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

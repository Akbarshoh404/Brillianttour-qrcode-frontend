import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { documentService, type UploadProgressHandler } from "@/services/documentService";
import type { DocumentListResponse } from "@/types";

export const documentsQueryKey = (search?: string) => ["documents", search ?? ""] as const;

export function useDocuments(search?: string) {
  return useQuery<DocumentListResponse>({
    queryKey: documentsQueryKey(search),
    queryFn: () => documentService.list(search),
    placeholderData: (previous) => previous,
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
    },
  });
}

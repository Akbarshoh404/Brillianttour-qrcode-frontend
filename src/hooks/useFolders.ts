import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { folderService } from "@/services/folderService";
import type { Folder } from "@/types";

export const foldersQueryKey = ["folders"] as const;

export function useFolders() {
  return useQuery<Folder[]>({
    queryKey: foldersQueryKey,
    queryFn: () => folderService.list(),
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => folderService.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foldersQueryKey });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, force }: { id: number; force?: boolean }) => folderService.remove(id, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foldersQueryKey });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["trash"] });
    },
  });
}

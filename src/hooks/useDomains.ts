import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { domainService } from "@/services/domainService";
import type { Domain } from "@/types";

export const domainsQueryKey = ["domains"] as const;

export function useDomains() {
  return useQuery<Domain[]>({
    queryKey: domainsQueryKey,
    queryFn: () => domainService.list(),
  });
}

export function useCreateDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, baseUrl }: { name: string; baseUrl: string }) => domainService.create(name, baseUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainsQueryKey });
    },
  });
}

export function useDeleteDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => domainService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainsQueryKey });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

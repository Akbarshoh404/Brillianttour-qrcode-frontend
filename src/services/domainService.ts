import { api } from "@/services/api";
import type { Domain, DomainListResponse } from "@/types";

export const domainService = {
  async list(): Promise<Domain[]> {
    const { data } = await api.get<DomainListResponse>("/domains");
    return data.items;
  },

  async create(name: string, baseUrl: string): Promise<Domain> {
    const { data } = await api.post<Domain>("/domains", { name, base_url: baseUrl });
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/domains/${id}`);
  },
};

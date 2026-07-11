import { api } from "@/services/api";
import type { Folder, FolderListResponse } from "@/types";

export const folderService = {
  async list(): Promise<Folder[]> {
    const { data } = await api.get<FolderListResponse>("/folders");
    return data.items;
  },

  async create(name: string): Promise<Folder> {
    const { data } = await api.post<Folder>("/folders", { name });
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/folders/${id}`);
  },
};

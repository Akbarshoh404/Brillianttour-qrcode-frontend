import type { AxiosProgressEvent } from "axios";

import { api } from "@/services/api";
import type { Document, DocumentListResponse, ScanSummary } from "@/types";

export type UploadProgressHandler = (percent: number) => void;

function toPercent(event: AxiosProgressEvent): number {
  if (!event.total) return 0;
  return Math.round((event.loaded / event.total) * 100);
}

export const documentService = {
  async list(search?: string): Promise<DocumentListResponse> {
    const { data } = await api.get<DocumentListResponse>("/documents", {
      params: search ? { search } : undefined,
    });
    return data;
  },

  async listTrash(): Promise<DocumentListResponse> {
    const { data } = await api.get<DocumentListResponse>("/documents/trash");
    return data;
  },

  async get(uuid: string): Promise<Document> {
    const { data } = await api.get<Document>(`/documents/${uuid}`);
    return data;
  },

  async scanSummary(uuid: string): Promise<ScanSummary> {
    const { data } = await api.get<ScanSummary>(`/documents/${uuid}/scans/summary`);
    return data;
  },

  async upload(file: File, title: string | undefined, onProgress?: UploadProgressHandler): Promise<Document> {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    const { data } = await api.post<Document>("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => onProgress?.(toPercent(event)),
    });
    return data;
  },

  async replace(uuid: string, file: File, onProgress?: UploadProgressHandler): Promise<Document> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.put<Document>(`/documents/${uuid}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => onProgress?.(toPercent(event)),
    });
    return data;
  },

  /** Moves a document to the trash (recoverable for ~7 days). */
  async remove(uuid: string): Promise<void> {
    await api.delete(`/documents/${uuid}`);
  },

  async restore(uuid: string): Promise<Document> {
    const { data } = await api.post<Document>(`/documents/${uuid}/restore`);
    return data;
  },

  /** Irreversible — only for documents already in the trash. */
  async removePermanently(uuid: string): Promise<void> {
    await api.delete(`/documents/trash/${uuid}`);
  },

  async disable(uuid: string): Promise<Document> {
    const { data } = await api.post<Document>(`/documents/${uuid}/disable`);
    return data;
  },

  async enable(uuid: string): Promise<Document> {
    const { data } = await api.post<Document>(`/documents/${uuid}/enable`);
    return data;
  },
};

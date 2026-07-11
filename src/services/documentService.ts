import type { AxiosProgressEvent } from "axios";

import { api } from "@/services/api";
import type { Document, DocumentListResponse, ScanSummary } from "@/types";

export type UploadProgressHandler = (percent: number) => void;

export interface UploadOptions {
  title?: string;
  domainId?: number | null;
  folderId?: number | null;
  onProgress?: UploadProgressHandler;
}

function toPercent(event: AxiosProgressEvent): number {
  if (!event.total) return 0;
  return Math.round((event.loaded / event.total) * 100);
}

export const documentService = {
  async list(search?: string, folderId?: number | null): Promise<DocumentListResponse> {
    const { data } = await api.get<DocumentListResponse>("/documents", {
      params: {
        ...(search ? { search } : {}),
        ...(folderId != null ? { folder_id: folderId } : {}),
      },
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

  async upload(file: File, options: UploadOptions = {}): Promise<Document> {
    const formData = new FormData();
    formData.append("file", file);
    if (options.title) formData.append("title", options.title);
    if (options.domainId != null) formData.append("domain_id", String(options.domainId));
    if (options.folderId != null) formData.append("folder_id", String(options.folderId));

    const { data } = await api.post<Document>("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => options.onProgress?.(toPercent(event)),
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

  /** Files a document into a different folder (or null to unfile it). */
  async moveToFolder(uuid: string, folderId: number | null): Promise<Document> {
    const { data } = await api.post<Document>(`/documents/${uuid}/move`, { folder_id: folderId });
    return data;
  },
};

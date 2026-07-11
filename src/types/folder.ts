export interface Folder {
  id: number;
  name: string;
  created_at: string;
  document_count: number;
}

export interface FolderListResponse {
  items: Folder[];
}

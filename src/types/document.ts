export interface Document {
  id: number;
  uuid: string;
  title: string;
  file_size: number;
  file_size_readable: string;
  created_at: string;
  updated_at: string;
  total_scans: number;
  total_downloads: number;
  last_scan: string | null;
  last_download: string | null;
  qr_url: string;
  view_url: string;
  download_url: string;
  qr_link: string;
}

export interface DocumentListResponse {
  items: Document[];
  total: number;
  storage_used_bytes: number;
}

export interface ApiErrorShape {
  detail: string;
  code: string;
  context?: unknown;
}

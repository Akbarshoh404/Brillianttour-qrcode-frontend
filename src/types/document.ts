export interface Document {
  id: number;
  uuid: string;
  title: string;
  notes: string | null;
  file_size: number;
  file_size_readable: string;
  created_at: string;
  updated_at: string;
  total_scans: number;
  total_downloads: number;
  last_scan: string | null;
  last_download: string | null;
  is_active: boolean;
  deleted_at: string | null;
  purge_at: string | null;
  domain_id: number | null;
  domain_name: string | null;
  folder_id: number | null;
  folder_name: string | null;
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

export interface ScanEvent {
  id: number;
  document_id: number;
  country: string | null;
  city: string | null;
  region: string | null;
  isp: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  browser: string | null;
  operating_system: string | null;
  device: string | null;
  user_agent: string | null;
  ip: string | null;
  referrer: string | null;
  language: string | null;
  created_at: string;
}

export interface ScanBreakdownEntry {
  label: string;
  count: number;
}

export interface ScanSummary {
  total_scans: number;
  by_country: ScanBreakdownEntry[];
  by_device: ScanBreakdownEntry[];
  by_browser: ScanBreakdownEntry[];
  recent: ScanEvent[];
}

export interface ApiErrorShape {
  detail: string;
  code: string;
  context?: unknown;
}

export interface Domain {
  id: number | null;
  name: string;
  base_url: string;
  created_at: string | null;
  is_default: boolean;
}

export interface DomainListResponse {
  items: Domain[];
}

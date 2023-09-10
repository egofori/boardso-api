export interface Pagination {
  results: any[];
  previous: { offset: number; limit: number } | null;
  next: { offset: number; limit: number } | null;
  count: number;
}

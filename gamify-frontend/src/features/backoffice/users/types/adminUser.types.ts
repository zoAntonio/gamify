export interface UserRank {
  id: number;
  username: string;
  niveau: number;
  xpTotal: number;
  rang: number;
}

export interface AdminUserStats {
  totalUsers: number;
}

export type SortBy = 'xpTotal' | 'niveau';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

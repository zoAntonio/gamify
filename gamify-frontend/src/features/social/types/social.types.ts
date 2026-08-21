import type { Attribut } from '@/types/attribut.types';

export interface RankEntry {
  userId: number;
  username: string;
  niveau: number;
  xpTotal: number;
  valeurAttribut: number | null;
  rang: number;
}

export interface ActivityFeedEntry {
  username: string;
  source: string;
  attribut: Attribut;
  delta: number;
  date: string;
}

export type ClassementSortBy = 'xpTotal' | 'niveau';

export interface PrivacyPreferences {
  profilPublic: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

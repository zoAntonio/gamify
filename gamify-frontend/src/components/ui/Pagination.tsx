import type { FC } from 'react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  page: number; // 0-based
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Générique (aucune connaissance métier) : pagination 0-based réutilisable sur
// n'importe quelle Page<T> Spring Data paginée côté backend.
export const Pagination: FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      <Button type="button" variant="ghost" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
        Précédent
      </Button>
      <span className="text-[13px] text-text-muted">
        Page {page + 1} / {totalPages}
      </span>
      <Button
        type="button"
        variant="ghost"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        Suivant
      </Button>
    </div>
  );
};

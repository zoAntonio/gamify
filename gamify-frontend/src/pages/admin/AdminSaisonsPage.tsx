import { useState } from 'react';
import type { FC } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAdminSaisons } from '@/features/backoffice/saisons/hooks/useAdminSaisons';
import { adminSaisonService } from '@/features/backoffice/saisons/services/adminSaisonService';
import { AdminSaisonForm } from '@/features/backoffice/saisons/components/AdminSaisonForm';
import { AdminSaisonList } from '@/features/backoffice/saisons/components/AdminSaisonList';
import type { CreateSaisonRequest, Saison } from '@/features/backoffice/saisons/types/adminSaison.types';

export const AdminSaisonsPage: FC = () => {
  const { saisons, isLoading, error, refetch } = useAdminSaisons();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [cloturingId, setCloturingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const hasSaisonActive = saisons.some((saison) => !saison.cloturee);

  const handleSubmit = async (request: CreateSaisonRequest) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await adminSaisonService.create(request);
      setModalOpen(false);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloturer = async (saison: Saison) => {
    if (!window.confirm(`Clôturer la saison « ${saison.nom} » ? Cette action est définitive.`)) return;
    setCloturingId(saison.id);
    setActionError(null);
    try {
      await adminSaisonService.cloturer(saison.id);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setCloturingId(null);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-medium tracking-tight text-heading">Saisons</h1>
          <p className="mt-1 text-[15px] text-text-muted">
            Fenêtres temporelles du système de badges — une seule saison active à la fois.
          </p>
        </div>
        <Button type="button" onClick={() => setModalOpen(true)}>
          + Nouvelle saison
        </Button>
      </div>

      {hasSaisonActive && (
        <p className="text-[13px] text-text-muted">
          Une saison est active — en créer une nouvelle clôturera automatiquement celle-ci.
        </p>
      )}
      {actionError && <p className="text-[15px] text-danger">{actionError}</p>}
      {error && <p className="text-[15px] text-danger">{error.message}</p>}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : (
        <AdminSaisonList saisons={saisons} onCloturer={handleCloturer} cloturingId={cloturingId} />
      )}

      <Modal isOpen={isModalOpen} title="Nouvelle saison" onClose={() => setModalOpen(false)}>
        <AdminSaisonForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </Modal>
    </section>
  );
};

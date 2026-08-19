import { useState } from 'react';
import type { FC } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAdminDomaines } from '@/features/backoffice/domaines/hooks/useAdminDomaines';
import { adminDomaineService } from '@/features/backoffice/domaines/services/adminDomaineService';
import { AdminDomaineForm } from '@/features/backoffice/domaines/components/AdminDomaineForm';
import { AdminDomaineList } from '@/features/backoffice/domaines/components/AdminDomaineList';
import type { AdminDomaine, AdminDomaineRequest } from '@/features/backoffice/domaines/types/adminDomaine.types';

export const AdminDomainesPage: FC = () => {
  const { domaines, isLoading, error, refetch } = useAdminDomaines();
  const [editing, setEditing] = useState<AdminDomaine | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (domaine: AdminDomaine) => {
    setEditing(domaine);
    setModalOpen(true);
  };

  const handleSubmit = async (request: AdminDomaineRequest) => {
    setSubmitting(true);
    setActionError(null);
    try {
      if (editing) {
        await adminDomaineService.update(editing.id, request);
      } else {
        await adminDomaineService.create(request);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (domaine: AdminDomaine) => {
    setDeactivatingId(domaine.id);
    setActionError(null);
    try {
      await adminDomaineService.deactivate(domaine.id);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-medium tracking-tight text-heading">Domaines</h1>
          <p className="mt-1 text-[15px] text-text-muted">
            Domaines système et personnels de tous les utilisateurs.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          + Nouveau domaine système
        </Button>
      </div>

      {actionError && <p className="text-[15px] text-danger">{actionError}</p>}
      {error && <p className="text-[15px] text-danger">{error.message}</p>}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : (
        <AdminDomaineList
          domaines={domaines}
          onEdit={openEdit}
          onDeactivate={handleDeactivate}
          deactivatingId={deactivatingId}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        title={editing ? 'Modifier le domaine' : 'Nouveau domaine système'}
        onClose={() => setModalOpen(false)}
      >
        <AdminDomaineForm domaine={editing ?? undefined} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </Modal>
    </section>
  );
};

import { useState } from 'react';
import type { FC } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAdminBadges } from '@/features/backoffice/badges/hooks/useAdminBadges';
import { adminBadgeService } from '@/features/backoffice/badges/services/adminBadgeService';
import { AdminBadgeForm } from '@/features/backoffice/badges/components/AdminBadgeForm';
import { AdminBadgeList } from '@/features/backoffice/badges/components/AdminBadgeList';
import type { BadgeDefinition, BadgeDefinitionRequest } from '@/features/backoffice/badges/types/adminBadge.types';

export const AdminBadgesPage: FC = () => {
  const [domaineFilter, setDomaineFilter] = useState<number | undefined>(undefined);
  const { badges, domaines, isLoading, error, refetch } = useAdminBadges(domaineFilter);
  const [editing, setEditing] = useState<BadgeDefinition | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (badge: BadgeDefinition) => {
    setEditing(badge);
    setModalOpen(true);
  };

  const handleSubmit = async (request: BadgeDefinitionRequest) => {
    setSubmitting(true);
    setActionError(null);
    try {
      if (editing) {
        await adminBadgeService.update(editing.id, request);
      } else {
        await adminBadgeService.create(request);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (badge: BadgeDefinition) => {
    setDeactivatingId(badge.id);
    setActionError(null);
    try {
      await adminBadgeService.deactivate(badge.id);
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
          <h1 className="font-display text-[28px] font-medium tracking-tight text-heading">Badges</h1>
          <p className="mt-1 text-[15px] text-text-muted">
            Catalogue Bronze/Argent/Or par domaine, débloqués automatiquement à la saison active.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={domaines.length === 0}>
          + Nouveau badge
        </Button>
      </div>

      <div className="max-w-xs">
        <Select
          id="admin-badges-filtre-domaine"
          label="Filtrer par domaine"
          value={domaineFilter ?? ''}
          onChange={(event) => setDomaineFilter(event.target.value ? Number(event.target.value) : undefined)}
        >
          <option value="">Tous les domaines</option>
          {domaines.map((domaine) => (
            <option key={domaine.id} value={domaine.id}>
              {domaine.nom}
            </option>
          ))}
        </Select>
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
        <AdminBadgeList
          badges={badges}
          onEdit={openEdit}
          onDeactivate={handleDeactivate}
          deactivatingId={deactivatingId}
        />
      )}

      <Modal isOpen={isModalOpen} title={editing ? 'Modifier le badge' : 'Nouveau badge'} onClose={() => setModalOpen(false)}>
        <AdminBadgeForm
          badge={editing ?? undefined}
          domaines={domaines}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </section>
  );
};

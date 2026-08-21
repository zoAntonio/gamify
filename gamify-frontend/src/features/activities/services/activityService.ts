import { apiClient } from '@/lib/apiClient';
import type {
  Activity,
  ActivityRequest,
  DomaineOption,
  PageResponse,
  StatutKanban,
} from '@/features/activities/types/activity.types';

interface ListActivitiesParams {
  domaineId?: number;
  attributCible?: string;
  statut?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export const activityService = {
  // Duplique volontairement l'appel /api/domaines plutôt que d'importer
  // features/profile — chaque feature reste indépendante (voir frontend-workflow.md).
  listDomaines: (): Promise<DomaineOption[]> => apiClient.get<DomaineOption[]>('/domaines'),

  listActivities: (params: ListActivitiesParams = {}): Promise<PageResponse<Activity>> => {
    const query = new URLSearchParams();
    if (params.domaineId !== undefined) query.set('domaineId', String(params.domaineId));
    if (params.attributCible) query.set('attributCible', params.attributCible);
    if (params.statut) query.set('statut', params.statut);
    // Format Spring "sort=propriete,direction" — ActivityRepository.search accepte
    // déjà un Pageable, aucun changement backend requis (append ORDER BY automatique).
    if (params.sort) query.set('sort', params.sort);
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 20));

    return apiClient.get<PageResponse<Activity>>(`/activities?${query.toString()}`);
  },

  createActivity: (request: ActivityRequest): Promise<Activity> =>
    apiClient.post<Activity>('/activities', request),

  changerStatut: (id: number, statut: StatutKanban): Promise<Activity> =>
    apiClient.patch<Activity>(`/activities/${id}/statut`, { statut }),

  // Photo preuve à la validation (G2-T16) : réutilise l'action /valider déjà exposée
  // côté backend, avec un fichier — donne +2 au lieu de +1 sur l'attribut ciblé.
  validerAvecPhoto: (id: number, photo: File): Promise<Activity> => {
    const form = new FormData();
    form.append('photo', photo);
    return apiClient.postForm<Activity>(`/activities/${id}/valider`, form);
  },

  supprimerPhotoPreuve: (id: number): Promise<Activity> =>
    apiClient.delete<Activity>(`/activities/${id}/photo`),
};

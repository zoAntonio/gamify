import { apiClient } from '@/lib/apiClient';
import type {
  CreateDomaineRequest,
  Domaine,
  ProfileResponse,
  UpdateProfileRequest,
} from '@/features/profile/types/profile.types';

export const profileService = {
  getProfile: (): Promise<ProfileResponse> => apiClient.get<ProfileResponse>('/profile'),

  updateProfile: (request: UpdateProfileRequest): Promise<ProfileResponse> =>
    apiClient.put<ProfileResponse>('/profile', request),

  listDomaines: (): Promise<Domaine[]> => apiClient.get<Domaine[]>('/domaines'),

  createDomaine: (request: CreateDomaineRequest): Promise<Domaine> =>
    apiClient.post<Domaine>('/domaines', request),
};

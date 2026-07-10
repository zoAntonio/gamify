import { apiClient } from '@/lib/apiClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/features/auth/types/auth.types';

export const authService = {
  register: (request: RegisterRequest): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>('/auth/register', request),

  login: (request: LoginRequest): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>('/auth/login', request),
};

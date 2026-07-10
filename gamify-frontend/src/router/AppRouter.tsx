import type { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { RootRedirect } from '@/router/RootRedirect';
import { AuthPage } from '@/pages/auth/AuthPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPlaceholderPage } from '@/pages/dashboard/DashboardPlaceholderPage';
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage';
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

export const AppRouter: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<AuthPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPlaceholderPage />} />
        </Route>

        <Route path="/401" element={<UnauthorizedPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

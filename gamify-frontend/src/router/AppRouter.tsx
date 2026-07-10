import type { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { RootRedirect } from '@/router/RootRedirect';
import { AuthPage } from '@/pages/AuthPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPlaceholderPage } from '@/pages/DashboardPlaceholderPage';

export const AppRouter: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPlaceholderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

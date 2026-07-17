import type { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { RootRedirect } from '@/router/RootRedirect';
import { AppLayout } from '@/components/shared/AppLayout';
import { AuthPage } from '@/pages/auth/AuthPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ActivityListPage } from '@/pages/activities/ActivityListPage';
import { AgendaPage } from '@/pages/agenda/AgendaPage';
import { HabitsPage } from '@/pages/habits/HabitsPage';
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
          <Route element={<AppLayout />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/activities" element={<ActivityListPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/habits" element={<HabitsPage />} />
          </Route>
        </Route>

        <Route path="/401" element={<UnauthorizedPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

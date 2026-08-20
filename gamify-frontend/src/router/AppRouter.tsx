import type { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { RequireAdmin } from '@/router/RequireAdmin';
import { RootRedirect } from '@/router/RootRedirect';
import { AppLayout } from '@/components/shared/AppLayout';
import { AuthPage } from '@/pages/auth/AuthPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ActivityListPage } from '@/pages/activities/ActivityListPage';
import { AgendaPage } from '@/pages/agenda/AgendaPage';
import { HabitsPage } from '@/pages/habits/HabitsPage';
import { NotificationSettingsPage } from '@/pages/settings/NotificationSettingsPage';
import { AdminDomainesPage } from '@/pages/admin/AdminDomainesPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminSaisonsPage } from '@/pages/admin/AdminSaisonsPage';
import { AdminBadgesPage } from '@/pages/admin/AdminBadgesPage';
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
            <Route path="/settings/notifications" element={<NotificationSettingsPage />} />

            <Route element={<RequireAdmin />}>
              <Route path="/admin/domaines" element={<AdminDomainesPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/saisons" element={<AdminSaisonsPage />} />
              <Route path="/admin/badges" element={<AdminBadgesPage />} />
            </Route>
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

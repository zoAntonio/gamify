import type { FC } from 'react';
import type { AdminUserStats } from '@/features/backoffice/users/types/adminUser.types';

interface AdminUserStatsCardProps {
  stats: AdminUserStats;
}

export const AdminUserStatsCard: FC<AdminUserStatsCardProps> = ({ stats }) => (
  <div className="rounded-control bg-surface p-4 shadow-glass">
    <p className="text-[13px] text-text-muted">Utilisateurs inscrits</p>
    <p className="font-display text-[28px] font-medium tracking-tight text-heading">{stats.totalUsers}</p>
  </div>
);

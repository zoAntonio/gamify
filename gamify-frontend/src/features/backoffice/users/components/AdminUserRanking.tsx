import type { FC } from 'react';
import type { UserRank } from '@/features/backoffice/users/types/adminUser.types';

interface AdminUserRankingProps {
  users: UserRank[];
}

export const AdminUserRanking: FC<AdminUserRankingProps> = ({ users }) => {
  if (users.length === 0) {
    return <p className="text-[15px] text-text-muted">Aucun utilisateur.</p>;
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-control bg-surface shadow-glass">
      {users.map((user) => (
        <li key={user.id} className="flex items-center gap-4 px-4 py-3">
          <span className="w-8 shrink-0 text-[15px] font-semibold text-text-muted">#{user.rang}</span>
          <span className="flex-1 text-[15px] text-text">{user.username}</span>
          <span className="text-[13px] text-text-muted">Niveau {user.niveau}</span>
          <span className="w-20 shrink-0 text-right text-[15px] font-medium text-heading">{user.xpTotal} XP</span>
        </li>
      ))}
    </ul>
  );
};

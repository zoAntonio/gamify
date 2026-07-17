import type { FC } from 'react';
import type { Avatar } from '@/features/profile/types/profile.types';

interface AvatarPickerProps {
  value: Avatar | null;
  onChange: (avatar: Avatar) => void;
}

const AVATAR_OPTIONS: { value: Avatar; emoji: string; label: string }[] = [
  { value: 'GUERRIER', emoji: '⚔️', label: 'Guerrier' },
  { value: 'MAGE', emoji: '🧙', label: 'Mage' },
  { value: 'ARCHER', emoji: '🏹', label: 'Archer' },
  { value: 'VOLEUR', emoji: '🗡️', label: 'Voleur' },
];

export const AvatarPicker: FC<AvatarPickerProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {AVATAR_OPTIONS.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isSelected}
            className={[
              'flex flex-col items-center gap-1 rounded-card px-4 py-3 text-[13px] font-medium transition-colors',
              isSelected ? 'bg-accent text-white' : 'bg-surface-2 text-text-muted shadow-subtle',
            ].join(' ')}
          >
            <span className="text-2xl" role="img" aria-label={option.label}>
              {option.emoji}
            </span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

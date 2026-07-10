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
    <div className="avatar-picker">
      {AVATAR_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.value === value ? 'avatar-option selected' : 'avatar-option'}
          onClick={() => onChange(option.value)}
          aria-pressed={option.value === value}
        >
          <span className="avatar-emoji" role="img" aria-label={option.label}>
            {option.emoji}
          </span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
};

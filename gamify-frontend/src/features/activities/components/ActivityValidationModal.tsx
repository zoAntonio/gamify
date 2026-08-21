import { useRef, useState } from 'react';
import type { ChangeEvent, FC } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Activity } from '@/features/activities/types/activity.types';

interface ActivityValidationModalProps {
  activity: Activity | null;
  onClose: () => void;
  onValidateWithoutPhoto: (id: number) => void;
  onValidateWithPhoto: (id: number, photo: File) => Promise<Error | null>;
  isValidatingWithoutPhoto: boolean;
}

/** Ouverte au clic sur "Valider" (G2-T16) : propose le bonus +2 avec photo preuve, ou +1 sans. */
export const ActivityValidationModal: FC<ActivityValidationModalProps> = ({
  activity,
  onClose,
  onValidateWithoutPhoto,
  onValidateWithPhoto,
  isValidatingWithoutPhoto,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !activity) return;

    setUploading(true);
    setError(null);
    const err = await onValidateWithPhoto(activity.id, file);
    setUploading(false);
    if (err) setError(err.message);
    else onClose();
  };

  if (!activity) return null;

  return (
    <Modal isOpen title={`Valider « ${activity.nom} »`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-[14px] text-text-muted">
          Joins une photo comme preuve pour gagner{' '}
          <strong className="text-text">+2 {activity.attributCible}</strong> au lieu de +1.
        </p>

        {error && <p className="text-[13px] text-danger">{error}</p>}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <Button
          type="button"
          isLoading={isUploading}
          disabled={isValidatingWithoutPhoto}
          onClick={() => inputRef.current?.click()}
        >
          📷 Valider avec une photo (+2)
        </Button>

        <div className="flex items-center gap-2 text-[12px] text-text-faint">
          <span className="h-px flex-1 bg-surface-2" />
          ou
          <span className="h-px flex-1 bg-surface-2" />
        </div>

        <Button
          type="button"
          variant="secondary"
          isLoading={isValidatingWithoutPhoto}
          disabled={isUploading}
          onClick={() => onValidateWithoutPhoto(activity.id)}
        >
          Valider sans photo (+1)
        </Button>
      </div>
    </Modal>
  );
};

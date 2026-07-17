import { useRef, useState } from 'react';
import type { ChangeEvent, FC } from 'react';
import { API_ORIGIN } from '@/lib/apiClient';
import { profileService } from '@/features/profile/services/profileService';
import { Button } from '@/components/ui/Button';

/** Upload de la photo de profil — envoyée dès la sélection, aperçu immédiat. */
export const AvatarUpload: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const profile = await profileService.uploadAvatar(file);
      setPreviewUrl(profile.avatarUrl ? `${API_ORIGIN}${profile.avatarUrl}` : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Photo de profil"
          className="h-16 w-16 rounded-card object-cover shadow-subtle"
        />
      ) : (
        <span className="flex h-16 w-16 items-center justify-center rounded-card bg-surface-2 text-[24px] shadow-subtle">
          📷
        </span>
      )}

      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={handleChange}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? 'Envoi...' : 'Choisir une photo'}
        </Button>
        <p className="text-[12px] text-text-faint">PNG ou JPEG, 2 Mo max.</p>
        {error && <p className="text-[12px] text-danger">{error}</p>}
      </div>
    </div>
  );
};

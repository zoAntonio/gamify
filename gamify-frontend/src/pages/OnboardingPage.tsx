import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDomaines } from '@/features/profile/hooks/useDomaines';
import { profileService } from '@/features/profile/services/profileService';
import { AvatarPicker } from '@/features/profile/components/AvatarPicker';
import { AvatarUpload } from '@/features/profile/components/AvatarUpload';
import { DomainSelector } from '@/features/profile/components/DomainSelector';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import type { Attribut, Avatar } from '@/features/profile/types/profile.types';

export const OnboardingPage: FC = () => {
  const { domaines, isLoading, refetch } = useDomaines();
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isCreating, setCreating] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleDomaine = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id],
    );
  };

  const handleCreateDomaine = async (nom: string, attributs: Attribut[]) => {
    setCreating(true);
    setError(null);
    try {
      const created = await profileService.createDomaine({ nom, attributs });
      refetch();
      setSelectedIds((current) => [...current, created.id]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async () => {
    if (!avatar || selectedIds.length === 0) {
      setError('Choisis un avatar et au moins un domaine à suivre');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await profileService.updateProfile({ avatar, domaineIds: selectedIds });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-text-muted">
        <Spinner size="sm" /> Chargement des domaines...
      </p>
    );
  }

  const completedSteps = (avatar ? 1 : 0) + (selectedIds.length > 0 ? 1 : 0);

  return (
    <section className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="font-display text-[28px] font-medium tracking-tight text-heading">
          Crée ton profil
        </h1>
        <p className="mt-1 text-[15px] text-text-muted">
          Choisis ton avatar et les domaines que tu veux suivre.
        </p>
        <ProgressBar
          value={completedSteps}
          max={2}
          label="Profil complété"
          className="mt-4"
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[17px] font-semibold text-text">Choisis ton avatar</h2>
        <AvatarPicker value={avatar} onChange={setAvatar} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[17px] font-semibold text-text">Photo de profil (optionnel)</h2>
        <p className="-mt-2 text-[13px] text-text-muted">
          Affichée sur ta carte de personnage, à la place de l'emoji de classe.
        </p>
        <AvatarUpload />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[17px] font-semibold text-text">Choisis les domaines à suivre</h2>
        <DomainSelector
          domaines={domaines}
          selectedIds={selectedIds}
          onToggle={toggleDomaine}
          onCreateDomaine={handleCreateDomaine}
          isCreating={isCreating}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="button" onClick={handleSave} isLoading={isSaving}>
        Valider mon profil
      </Button>
    </section>
  );
};

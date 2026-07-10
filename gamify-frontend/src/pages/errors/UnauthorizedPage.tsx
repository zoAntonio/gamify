import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const UnauthorizedPage: FC = () => {
  const navigate = useNavigate();

  return (
    <section className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">Erreur 401</p>
      <h1 className="text-4xl font-bold">Ta session a expiré ou n'est plus valide.</h1>
      <p className="text-sm text-text-muted">Reconnecte-toi pour continuer.</p>
      <Button type="button" onClick={() => navigate('/')}>
        Retour à l'accueil
      </Button>
    </section>
  );
};

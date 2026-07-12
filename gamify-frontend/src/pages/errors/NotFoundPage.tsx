import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: FC = () => {
  const navigate = useNavigate();

  return (
    <section className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-[13px] font-normal tracking-[0.1em] text-text-muted uppercase">
        Erreur 404
      </p>
      <h1 className="font-display text-[22px] font-medium tracking-tight text-heading">
        Cette page n'existe pas.
      </h1>
      <Button type="button" onClick={() => navigate('/')}>
        Retour à l'accueil
      </Button>
    </section>
  );
};

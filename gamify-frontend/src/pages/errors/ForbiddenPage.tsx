import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

export const ForbiddenPage: FC = () => {
  const navigate = useNavigate();

  return (
    <section className="error-page">
      <h1>403</h1>
      <p>Tu n'as pas les droits nécessaires pour accéder à cette page.</p>
      <button type="button" onClick={() => navigate('/')}>
        Retour à l'accueil
      </button>
    </section>
  );
};

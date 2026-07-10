import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: FC = () => {
  const navigate = useNavigate();

  return (
    <section className="error-page">
      <h1>404</h1>
      <p>Cette page n'existe pas.</p>
      <button type="button" onClick={() => navigate('/')}>
        Retour à l'accueil
      </button>
    </section>
  );
};

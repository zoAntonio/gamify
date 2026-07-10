import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage: FC = () => {
  const navigate = useNavigate();

  return (
    <section className="error-page">
      <h1>401</h1>
      <p>Ta session a expiré ou n'est plus valide. Reconnecte-toi.</p>
      <button type="button" onClick={() => navigate('/')}>
        Retour à l'accueil
      </button>
    </section>
  );
};

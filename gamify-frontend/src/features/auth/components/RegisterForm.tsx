import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import type { RegisterRequest } from '@/features/auth/types/auth.types';

interface RegisterFormProps {
  onSubmit: (request: RegisterRequest) => void;
  isLoading: boolean;
}

export const RegisterForm: FC<RegisterFormProps> = ({ onSubmit, isLoading }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ username, email, password });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="register-username">Pseudo</label>
      <input
        id="register-username"
        type="text"
        required
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />

      <label htmlFor="register-email">Email</label>
      <input
        id="register-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <label htmlFor="register-password">Mot de passe</label>
      <input
        id="register-password"
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Création...' : 'Créer mon compte'}
      </button>
    </form>
  );
};

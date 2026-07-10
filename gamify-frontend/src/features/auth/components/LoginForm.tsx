import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import type { LoginRequest } from '@/features/auth/types/auth.types';

interface LoginFormProps {
  onSubmit: (request: LoginRequest) => void;
  isLoading: boolean;
}

export const LoginForm: FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <label htmlFor="login-password">Mot de passe</label>
      <input
        id="login-password"
        type="password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
};

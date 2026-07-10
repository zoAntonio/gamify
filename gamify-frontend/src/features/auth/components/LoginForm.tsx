import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
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
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <TextField
        id="login-email"
        label="Email"
        type="email"
        placeholder="ton-email@exemple.com"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <TextField
        id="login-password"
        label="Mot de passe"
        type="password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </Button>
    </form>
  );
};

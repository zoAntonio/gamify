import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
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
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <TextField
        id="register-username"
        label="Pseudo"
        type="text"
        required
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />

      <TextField
        id="register-email"
        label="Email"
        type="email"
        placeholder="ton-email@exemple.com"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <TextField
        id="register-password"
        label="Mot de passe"
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <Button type="submit" fullWidth disabled={isLoading}>
        {isLoading ? 'Création...' : 'Créer mon compte'}
      </Button>
    </form>
  );
};

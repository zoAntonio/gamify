import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/features/auth/services/authService';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { useAuthStore } from '@/store/useAuthStore';
import type { LoginRequest, RegisterRequest } from '@/features/auth/types/auth.types';

const DEMO_CREDENTIALS: RegisterRequest = {
  username: 'demo',
  email: 'demo@gamify.app',
  password: 'demo1234',
};

export const AuthPage: FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleAuthSuccess = (auth: { token: string; username: string; email: string }) => {
    setAuth(auth);
    navigate('/');
  };

  const handleLogin = async (request: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(request);
      handleAuthSuccess(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (request: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(request);
      handleAuthSuccess(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(DEMO_CREDENTIALS);
      handleAuthSuccess(response);
    } catch {
      try {
        const response = await authService.login(DEMO_CREDENTIALS);
        handleAuthSuccess(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <h1>Gamify</h1>

      <div className="auth-tabs">
        <button type="button" onClick={() => setMode('login')} disabled={mode === 'login'}>
          Connexion
        </button>
        <button type="button" onClick={() => setMode('register')} disabled={mode === 'register'}>
          Inscription
        </button>
      </div>

      {mode === 'login' ? (
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
      ) : (
        <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
      )}

      {error && <p className="auth-error">{error}</p>}

      <button type="button" className="auth-demo-button" onClick={handleDemo} disabled={isLoading}>
        Essayer en démo
      </button>
    </section>
  );
};

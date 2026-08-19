/**
 * Point d'entrée unique pour les logs frontend, visibles dans la console du
 * navigateur — le terminal Vite n'affiche que les logs de build/HMR, jamais le
 * code exécuté côté client. Sert surtout à tracer les erreurs API (voir
 * apiClient.ts) pour pouvoir suivre ce qui clenche sans semer des console.log
 * un peu partout.
 */

type LogPayload = Record<string, unknown>;

function format(scope: string, message: string): string {
  const time = new Date().toISOString().split('T')[1]?.replace('Z', '') ?? '';
  return `[${time}] [${scope}] ${message}`;
}

export const logger = {
  info: (scope: string, message: string, payload?: LogPayload): void => {
    console.info(format(scope, message), payload ?? '');
  },
  warn: (scope: string, message: string, payload?: LogPayload): void => {
    console.warn(format(scope, message), payload ?? '');
  },
  error: (scope: string, message: string, payload?: LogPayload): void => {
    console.error(format(scope, message), payload ?? '');
  },
};

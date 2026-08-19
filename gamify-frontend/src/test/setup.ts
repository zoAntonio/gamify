// Setup global des tests Vitest (transverse à toute l'app, comme lib/queryClient) :
// étend expect() avec les matchers jest-dom (toBeInTheDocument, etc.) et nettoie le
// DOM entre chaque test.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

/** Applique un état optimiste, exécute l'action, rollback vers `previous` si elle échoue. */
export async function runOptimistic<T>(
  previous: T,
  apply: (state: T) => void,
  next: T,
  action: () => Promise<void>,
): Promise<Error | null> {
  apply(next);
  try {
    await action();
    return null;
  } catch (err) {
    apply(previous);
    return err instanceof Error ? err : new Error('Erreur inconnue');
  }
}

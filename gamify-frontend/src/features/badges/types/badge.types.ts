export type Palier = 'BRONZE' | 'ARGENT' | 'OR';

/** Badge débloqué par l'utilisateur — GET /api/badges/me, toutes saisons confondues. */
export interface AcquiredBadge {
  id: number;
  badgeNom: string;
  palier: Palier;
  domaineNom: string;
  saisonNom: string;
  dateObtention: string; // LocalDateTime ISO sans fuseau
}

/** Badge du catalogue pas encore débloqué pour la saison active — GET /api/badges/a-debloquer. */
export interface LockedBadge {
  id: number;
  nom: string;
  description: string | null;
  palier: Palier;
  domaineNom: string;
  seuilValidations: number;
  progressionActuelle: number;
}

export type Palier = 'BRONZE' | 'ARGENT' | 'OR';

export interface BadgeDefinition {
  id: number;
  domaineId: number;
  domaineNom: string;
  palier: Palier;
  nom: string;
  description: string | null;
  seuilValidations: number;
  actif: boolean;
}

export interface BadgeDefinitionRequest {
  domaineId: number;
  palier: Palier;
  nom: string;
  description: string | null;
  seuilValidations: number;
}

// Sous-ensemble minimal de AdminDomaineResponse : seul id/nom sert au select du
// formulaire. Dupliqué volontairement plutôt qu'importé depuis
// backoffice/domaines (indépendance des features, même choix que la
// duplication de l'appel /api/domaines dans habitService.ts).
export interface DomaineOption {
  id: number;
  nom: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type Avatar = 'GUERRIER' | 'MAGE' | 'ARCHER' | 'VOLEUR';

export type Attribut = 'INT' | 'FOR' | 'VIT' | 'PRE' | 'CHA' | 'RES';

export interface Domaine {
  id: number;
  nom: string;
  attributs: Attribut[];
  systeme: boolean;
}

export interface ProfileResponse {
  username: string;
  email: string;
  avatar: Avatar | null;
  domainesTrackes: Domaine[];
  niveau: number;
  xpTotal: number;
}

export interface UpdateProfileRequest {
  avatar: Avatar;
  domaineIds: number[];
}

export interface CreateDomaineRequest {
  nom: string;
  attributs: Attribut[];
}

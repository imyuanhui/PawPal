export type Role = 'owner' | 'volunteer' | 'both';

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  city?: string;
  photoUrl?: string;
  prompt1?: string;
  prompt2?: string;
  largeOk?: boolean;
  reactiveOk?: boolean;
  likedUserIds?: string[];
  password?: string;
};

export type Match =
  | { id: string; other: Profile; state: 'none' }
  | { id: string; other: Profile; state: 'proposed'; startAt: number; place: string; duration: number; proposer: 'me'|'them' }
  | { id: string; other: Profile; state: 'confirmed'; startAt: number; place: string; duration: number };

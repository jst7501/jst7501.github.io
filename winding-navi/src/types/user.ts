export type Drivetrain = 'RWD' | 'AWD' | 'FF' | '4WD';

export interface CarProfile {
  name: string;
  year: number;
  drivetrain: Drivetrain;
}

export interface UserProfile {
  nickname: string;
  isPremium: boolean;
  car: CarProfile | null;
  favorites: string[]; // route IDs
}

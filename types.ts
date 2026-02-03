
export interface Point {
  x: number;
  y: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Jelly extends Point {
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  color: string;
  eyeColor: string;
}

export interface Food extends Point {
  radius: number;
  color: string;
  floatOffset: number;
  id: string; // Unique ID for React lists if needed, mostly for logic tracking
}

export type EnemyType = 'CLASSIC' | 'SPEEDER' | 'CHASER';

export interface Enemy extends Point {
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  id: string;
  type: EnemyType;
  color: string;
}

export interface Particle extends Point {
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface BackgroundItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: 'CLOUD' | 'COMIC_SHAPE' | 'CITY';
  rotation: number;
  rotSpeed: number;
  variant: number; // For sub-types of shapes
}

export type MissionType = 'EAT' | 'SCORE' | 'SURVIVE';

export interface Mission {
  description: string;
  type: MissionType;
  target: number;
  current: number;
  completed: boolean;
  reward: number;
}

export interface Skin {
  id: string;
  name: string;
  color: string;
  eyeColor: string;
  unlockScore: number;
  description: string;
}

export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type InputType = 'MOUSE' | 'TOUCH';

export interface GameState {
  jelly: Jelly;
  foods: Food[];
  enemies: Enemy[];
  particles: Particle[];
  backgroundItems: BackgroundItem[];
  score: number;
  width: number;
  height: number;
  mouse: Point;
  status: GameStatus;
  frameCount: number;
  mission: Mission;
  missionIndex: number;
  missionCooldown: number;
  missionTimer: number; // Accumulator for time-based missions
  inputType: InputType;
}

export type ChainType = 'EVM';

export interface WalletState {
  address: string | null;
  chain: ChainType | null;
  isConnected: boolean;
}

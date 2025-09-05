// Shared Game Types

export interface BaseGameConfig {
  gameId: string;
  gameType: string;
  mode: 'solo' | 'multiplayer';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  maxPlayers: number;
}

export interface BaseGameState {
  gameId: string;
  status: 'waiting' | 'playing' | 'paused' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  score: number;
  isActive: boolean;
}

export interface BasePlayer {
  userID: number;
  name: string;
  avatar?: string;
  score: number;
  isReady: boolean;
  isConnected: boolean;
  joinedAt: Date;
}

export interface GameRoom {
  roomId: string;
  hostId: number;
  gameType: string;
  maxPlayers: number;
  currentPlayers: number;
  players: BasePlayer[];
  isPrivate: boolean;
  password?: string;
  status: 'waiting' | 'playing' | 'completed';
  createdAt: Date;
  gameConfig: BaseGameConfig;
}

export interface GameResult {
  gameId: string;
  playerId: number;
  score: number;
  rank: number;
  isWinner: boolean;
  completedAt: Date;
  duration: number;
  statistics: Record<string, any>;
}

export interface GameStatistics {
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  averageScore: number;
  bestScore: number;
  totalPlayTime: number;
  winRate: number;
  favoriteGameType: string;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  playerId: number;
  playerName: string;
  score: number;
  gameType: string;
  achievedAt: Date;
}

export interface GameEvent {
  id: string;
  type: string;
  gameId: string;
  playerId: number;
  timestamp: Date;
  data: Record<string, any>;
}

export interface GameAssets {
  images: Record<string, string>;
  sounds: Record<string, string>;
  animations: Record<string, string>;
  fonts: Record<string, string>;
}

export interface WebSocketMessage {
  type: string;
  gameId: string;
  playerId: number;
  timestamp: Date;
  data: any;
}

// Game Engine Types
export interface GameEngine {
  gameId: string;
  config: BaseGameConfig;
  state: BaseGameState;
  players: Map<number, BasePlayer>;

  start(): void;
  pause(): void;
  resume(): void;
  end(result: GameResult): void;
  processEvent(event: GameEvent): void;
  validateMove(move: any): boolean;
  getState(): BaseGameState;
}

// Error Types
export class GameError extends Error {
  constructor(
    message: string,
    public code: string,
    public gameId?: string
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export class RoomError extends Error {
  constructor(
    message: string,
    public code: string,
    public roomId?: string
  ) {
    super(message);
    this.name = 'RoomError';
  }
}

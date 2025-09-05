// Find-It Game Types

export interface Position {
  x: number;
  y: number;
}

export interface ClickData {
  position: Position;
  timestamp: Date;
  userID: number;
  isCorrect: boolean;
}

export interface GameRound {
  roundNumber: number;
  normalImage: string;
  abnormalImage: string;
  correctPositions: Position[];
  timeLimit: number;
  startTime: Date;
  endTime?: Date;
}

export interface FindItGameConfig {
  maxRounds: number;
  timePerRound: number;
  maxLives: number;
  maxHints: number;
  pointsPerCorrectClick: number;
  pointsPerHint: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

export interface FindItGameState {
  currentRound: number;
  score: number;
  lives: number;
  hintsRemaining: number;
  timeRemaining: number;
  isGameActive: boolean;
  isGameComplete: boolean;
  gameResult?: {
    isWinner: boolean;
    finalScore: number;
    roundsCompleted: number;
    accuracy: number;
  };
}

export interface MultiplayerGameState extends FindItGameState {
  players: PlayerGameData[];
  currentTurn?: number;
  roomId: string;
  hostId: number;
}

export interface PlayerGameData {
  userID: number;
  name: string;
  score: number;
  lives: number;
  isReady: boolean;
  isConnected: boolean;
  correctClicks: ClickData[];
  wrongClicks: ClickData[];
}

export type FindItGameEvent =
  | { type: 'GAME_START'; payload: { config: FindItGameConfig } }
  | { type: 'ROUND_START'; payload: { round: GameRound } }
  | { type: 'CLICK_REGISTERED'; payload: { click: ClickData } }
  | { type: 'HINT_USED'; payload: { position: Position } }
  | { type: 'ROUND_COMPLETE'; payload: { success: boolean } }
  | { type: 'GAME_OVER'; payload: { result: FindItGameState['gameResult'] } }
  | { type: 'PLAYER_JOINED'; payload: { player: PlayerGameData } }
  | { type: 'PLAYER_LEFT'; payload: { userID: number } };

export interface FindItAssets {
  normalImage: string;
  abnormalImage: string;
  hintImage?: string;
  backgroundMusic?: string;
  soundEffects: {
    correctClick: string;
    wrongClick: string;
    roundComplete: string;
    gameOver: string;
    hintUsed: string;
  };
}

// API Response types
export interface FindItGameResponse {
  success: boolean;
  gameId: string;
  round: GameRound;
  assets: FindItAssets;
  config: FindItGameConfig;
}

export interface ClickValidationResponse {
  isCorrect: boolean;
  position: Position;
  points: number;
  remainingPositions: number;
  isRoundComplete: boolean;
}

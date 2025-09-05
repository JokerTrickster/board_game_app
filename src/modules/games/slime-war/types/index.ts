// Slime War Game Types

export interface BoardPosition {
  x: number;
  y: number;
}

export interface GameCard {
  id: number;
  name: string;
  cost: number;
  attack: number;
  health: number;
  type: 'hero' | 'minion' | 'spell';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  special?: string;
  image?: string;
}

export interface Player {
  userID: number;
  name: string;
  colorType: number;
  heroCount: number;
  cards: GameCard[];
  isConnected: boolean;
  lastPlacedCard?: number;
  canMove: boolean;
  score: number;
}

export interface BoardCell {
  position: BoardPosition;
  cardId: number;
  ownerId: number;
  isKing: boolean;
  canMove: boolean;
}

export interface SlimeWarGameConfig {
  gridSize: number;
  turnTimeLimit: number;
  maxRounds: number;
  deckSize: number;
  startingCards: number;
  startingMana: number;
}

export interface GameSession {
  sessionId: string;
  roomID: number;
  gameType: 'pvp';
  players: Player[];
  currentTurn: number;
  currentRound: number;
  turnTimeLimit: number;
  gridSize: number;
  maxRounds: number;
  startTime: Date;
  isActive: boolean;
}

export interface SlimeWarGameState {
  session: GameSession;
  gameMap: number[][];
  movableCards: GameCard[];
  kingIndex: number;
  remainingSlime: number;
  timerColor: string;
  isMyTurn: boolean;
  isGameOver: boolean;
  gameResult?: GameResult;
}

export interface GameResult {
  isSuccess: boolean;
  winner: number;
  myScore: string;
  opponentScore: string;
  totalRounds: number;
  gameEndReason: 'victory' | 'defeat' | 'timeout' | 'disconnect';
}

export interface CardPlayAction {
  cardId: number;
  position: BoardPosition;
  playerId: number;
  timestamp: Date;
}

export interface CardMoveAction {
  cardId: number;
  fromPosition: BoardPosition;
  toPosition: BoardPosition;
  playerId: number;
  timestamp: Date;
}

export type SlimeWarGameEvent =
  | { type: 'GAME_START'; payload: { session: GameSession } }
  | { type: 'TURN_START'; payload: { playerId: number; timeLimit: number } }
  | { type: 'CARD_PLAYED'; payload: { action: CardPlayAction } }
  | { type: 'CARD_MOVED'; payload: { action: CardMoveAction } }
  | { type: 'TURN_END'; payload: { playerId: number } }
  | { type: 'ROUND_COMPLETE'; payload: { roundNumber: number } }
  | { type: 'GAME_OVER'; payload: { result: GameResult } }
  | { type: 'PLAYER_DISCONNECTED'; payload: { playerId: number } }
  | { type: 'TIMER_UPDATE'; payload: { timeRemaining: number } };

export interface SlimeWarAssets {
  boardBackground: string;
  cardImages: Record<number, string>;
  playerColors: Record<number, string>;
  soundEffects: {
    cardPlay: string;
    cardMove: string;
    turnStart: string;
    gameOver: string;
    victory: string;
    defeat: string;
  };
}

// API Response types
export interface SlimeWarGameResponse {
  success: boolean;
  session: GameSession;
  gameMap: number[][];
  assets: SlimeWarAssets;
}

export interface GameActionResponse {
  success: boolean;
  gameState: SlimeWarGameState;
  validMoves?: BoardPosition[];
  message?: string;
}

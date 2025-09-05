import { DomainModel, ModelValidationError, BusinessRule } from '../../../infrastructure/mvvm/BaseModel';

/**
 * Position coordinates for game board
 */
export interface BoardPosition {
  x: number;
  y: number;
}

/**
 * Game card data structure
 */
export interface GameCard {
  id: number;
  name: string;
  cost: number;
  attack: number;
  health: number;
  special?: string;
  image?: any;
  type: 'hero' | 'minion' | 'spell';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

/**
 * Player data structure
 */
export interface Player {
  userID: number;
  name: string;
  colorType: number;
  heroCount: number;
  cards: GameCard[];
  isConnected: boolean;
  lastPlacedCard?: number;
  canMove: boolean;
}

/**
 * Game board cell data
 */
export interface BoardCell {
  position: BoardPosition;
  cardId: number;
  ownerId: number;
  isKing: boolean;
  canMove: boolean;
}

/**
 * Game session configuration
 */
export interface GameSession {
  sessionId: string;
  roomID: number;
  gameType: 'pvp';
  turnTimeLimit: number;
  gridSize: number;
  maxRounds: number;
  startTime: Date;
}

/**
 * Game configuration
 */
export interface GameConfig {
  turnTimeLimit: number;
  gridSize: number;
  maxRounds: number;
  deckSize: number;
}

/**
 * Game result data
 */
export interface GameResult {
  isSuccess: boolean;
  winner: number;
  myScore: string;
  opponentScore: string;
  totalRounds: number;
  gameEndReason: 'victory' | 'defeat' | 'timeout' | 'disconnect';
}

/**
 * Domain model for Slime War Game state
 */
export class SlimeWarGameModel extends DomainModel {
  // Game configuration
  public readonly config: GameConfig;
  public readonly session: GameSession;

  // Current game state
  public currentRound: number = 1;
  public timer: number;
  public isGameOver: boolean = false;
  public gameResult: GameResult | null = null;
  
  // Players
  public players: Map<number, Player> = new Map();
  public currentTurn: number = 0;
  public myUserID: number = 0;
  
  // Game board
  public gameMap: number[][] = [];
  public kingIndex: number = 0;
  public movableCards: GameCard[] = [];
  
  // UI state
  public timerColor: string = 'black';
  public remainingSlime: number = 0;

  constructor(config: GameConfig, session: GameSession) {
    super();
    this.config = config;
    this.session = session;
    this.timer = config.turnTimeLimit;
    this.initializeGameBoard();
  }

  // Board Management

  /**
   * Initialize game board with empty cells
   */
  private initializeGameBoard(): void {
    const size = this.config.gridSize + 1; // 0-based to size-based
    this.gameMap = Array(size).fill(null).map(() => Array(size).fill(0));
  }

  /**
   * Get board cell value at position
   */
  getBoardCell(x: number, y: number): number {
    if (x < 0 || x >= this.gameMap.length || y < 0 || y >= this.gameMap[0].length) {
      return 0;
    }
    return this.gameMap[x][y];
  }

  /**
   * Set board cell value at position
   */
  setBoardCell(x: number, y: number, cardId: number): boolean {
    if (x < 0 || x >= this.gameMap.length || y < 0 || y >= this.gameMap[0].length) {
      return false;
    }
    
    this.gameMap[x][y] = cardId;
    this.touch();
    return true;
  }

  /**
   * Check if position is valid for card placement
   */
  isValidPosition(x: number, y: number): boolean {
    if (x < 0 || x >= this.gameMap.length || y < 0 || y >= this.gameMap[0].length) {
      return false;
    }
    
    return this.gameMap[x][y] === 0; // Empty cell
  }

  /**
   * Get all valid positions for card placement
   */
  getValidPositions(): BoardPosition[] {
    const positions: BoardPosition[] = [];
    
    for (let x = 0; x < this.gameMap.length; x++) {
      for (let y = 0; y < this.gameMap[x].length; y++) {
        if (this.isValidPosition(x, y)) {
          positions.push({ x, y });
        }
      }
    }
    
    return positions;
  }

  // Player Management

  /**
   * Add player to game
   */
  addPlayer(player: Player): void {
    this.players.set(player.userID, player);
    this.touch();
  }

  /**
   * Get player by ID
   */
  getPlayer(userID: number): Player | undefined {
    return this.players.get(userID);
  }

  /**
   * Get current player
   */
  getCurrentPlayer(): Player | undefined {
    return this.players.get(this.myUserID);
  }

  /**
   * Get opponent player
   */
  getOpponent(): Player | undefined {
    for (const [userID, player] of this.players) {
      if (userID !== this.myUserID) {
        return player;
      }
    }
    return undefined;
  }

  /**
   * Update player data
   */
  updatePlayer(userID: number, updates: Partial<Player>): boolean {
    const player = this.players.get(userID);
    if (!player) return false;
    
    Object.assign(player, updates);
    this.touch();
    return true;
  }

  // Game Logic

  /**
   * Check if it's my turn
   */
  isMyTurn(): boolean {
    return this.currentTurn === this.myUserID;
  }

  /**
   * Switch turn to next player
   */
  nextTurn(): void {
    const playerIds = Array.from(this.players.keys());
    const currentIndex = playerIds.indexOf(this.currentTurn);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    this.currentTurn = playerIds[nextIndex];
    this.timer = this.config.turnTimeLimit;
    this.touch();
  }

  /**
   * Place card on board
   */
  placeCard(cardId: number, x: number, y: number, ownerId: number): boolean {
    if (!this.isValidPosition(x, y)) {
      return false;
    }

    const player = this.getPlayer(ownerId);
    if (!player) {
      return false;
    }

    // Check if player has the card
    const cardIndex = player.cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) {
      return false;
    }

    // Place card on board
    this.setBoardCell(x, y, cardId);
    
    // Remove card from player's hand
    player.cards.splice(cardIndex, 1);
    player.lastPlacedCard = cardId;
    
    this.touch();
    return true;
  }

  /**
   * Move card on board
   */
  moveCard(fromX: number, fromY: number, toX: number, toY: number): boolean {
    const cardId = this.getBoardCell(fromX, fromY);
    if (cardId === 0) {
      return false;
    }

    if (!this.isValidPosition(toX, toY)) {
      return false;
    }

    // Move card
    this.setBoardCell(fromX, fromY, 0);
    this.setBoardCell(toX, toY, cardId);
    
    this.touch();
    return true;
  }

  /**
   * Remove card from board
   */
  removeCard(x: number, y: number): boolean {
    const cardId = this.getBoardCell(x, y);
    if (cardId === 0) {
      return false;
    }

    this.setBoardCell(x, y, 0);
    this.touch();
    return true;
  }

  /**
   * Get cards that can move
   */
  getMovableCards(): GameCard[] {
    // This would implement the game logic for which cards can move
    // For now, return empty array
    return this.movableCards;
  }

  /**
   * Update movable cards list
   */
  updateMovableCards(cards: GameCard[]): void {
    this.movableCards = cards;
    this.touch();
  }

  // Game State Management

  /**
   * Start new round
   */
  nextRound(): void {
    this.currentRound++;
    this.timer = this.config.turnTimeLimit;
    // Reset round-specific state
    this.touch();
  }

  /**
   * End game with result
   */
  endGame(result: GameResult): void {
    this.isGameOver = true;
    this.gameResult = result;
    this.timer = 0;
    this.touch();
  }

  /**
   * Reset game to initial state
   */
  resetGame(): void {
    this.currentRound = 1;
    this.timer = this.config.turnTimeLimit;
    this.isGameOver = false;
    this.gameResult = null;
    this.currentTurn = 0;
    this.kingIndex = 0;
    this.remainingSlime = 0;
    this.movableCards = [];
    this.timerColor = 'black';
    
    // Reset board
    this.initializeGameBoard();
    
    // Reset players
    for (const player of this.players.values()) {
      player.cards = [];
      player.heroCount = 0;
      player.lastPlacedCard = undefined;
      player.canMove = false;
    }
    
    this.touch();
  }

  /**
   * Calculate current score for player
   */
  calculateScore(userID: number): number {
    const player = this.getPlayer(userID);
    if (!player) return 0;

    let score = 0;
    
    // Score based on cards on board
    for (let x = 0; x < this.gameMap.length; x++) {
      for (let y = 0; y < this.gameMap[x].length; y++) {
        const cardId = this.gameMap[x][y];
        if (cardId > 0) {
          // Check if this card belongs to the player
          // This would need more sophisticated ownership tracking
          score += 10; // Base score per card
        }
      }
    }
    
    // Score based on remaining cards
    score += player.cards.length * 5;
    
    // Score based on hero count
    score += player.heroCount * 20;
    
    return score;
  }

  /**
   * Check win condition
   */
  checkWinCondition(): { winner: number | null; reason: string } {
    // Check if opponent has no cards and no pieces on board
    const opponent = this.getOpponent();
    const currentPlayer = this.getCurrentPlayer();
    
    if (!opponent || !currentPlayer) {
      return { winner: null, reason: 'Invalid game state' };
    }

    // Check if opponent has no resources left
    if (opponent.cards.length === 0 && opponent.heroCount === 0) {
      return { winner: this.myUserID, reason: 'Opponent eliminated' };
    }

    // Check if current player has no resources left
    if (currentPlayer.cards.length === 0 && currentPlayer.heroCount === 0) {
      return { winner: opponent.userID, reason: 'Player eliminated' };
    }

    // Check timeout conditions
    if (this.timer <= 0) {
      // Winner is player with higher score
      const myScore = this.calculateScore(this.myUserID);
      const opponentScore = this.calculateScore(opponent.userID);
      
      if (myScore > opponentScore) {
        return { winner: this.myUserID, reason: 'Higher score on timeout' };
      } else if (opponentScore > myScore) {
        return { winner: opponent.userID, reason: 'Higher score on timeout' };
      } else {
        return { winner: null, reason: 'Tie game' };
      }
    }

    return { winner: null, reason: 'Game continues' };
  }

  // Domain Model Implementation
  protected serialize(): Record<string, any> {
    return {
      config: this.config,
      session: this.session,
      currentRound: this.currentRound,
      timer: this.timer,
      isGameOver: this.isGameOver,
      gameResult: this.gameResult,
      players: Array.from(this.players.entries()),
      currentTurn: this.currentTurn,
      myUserID: this.myUserID,
      gameMap: this.gameMap,
      kingIndex: this.kingIndex,
      score: this.calculateScore(this.myUserID),
    };
  }

  protected validateModel(): ModelValidationError[] {
    const errors: ModelValidationError[] = [];

    if (this.timer < 0) {
      errors.push({
        field: 'timer',
        message: 'Timer cannot be negative',
        code: 'INVALID_RANGE',
      });
    }

    if (this.currentRound < 1) {
      errors.push({
        field: 'currentRound',
        message: 'Round must be at least 1',
        code: 'INVALID_RANGE',
      });
    }

    if (this.gameMap.length !== this.config.gridSize + 1) {
      errors.push({
        field: 'gameMap',
        message: 'Game map size mismatch with configuration',
        code: 'INVALID_SIZE',
      });
    }

    if (this.players.size === 0) {
      errors.push({
        field: 'players',
        message: 'Game must have at least one player',
        code: 'REQUIRED',
      });
    }

    return errors;
  }
}

// Business Rules
export class GameCanStartRule implements BusinessRule<SlimeWarGameModel> {
  isSatisfiedBy(model: SlimeWarGameModel): boolean {
    return model.players.size >= 2 && !model.isGameOver;
  }

  getErrorMessage(): string {
    return 'Game cannot start: need at least 2 players and game must not be over';
  }
}

export class CanPlaceCardRule implements BusinessRule<SlimeWarGameModel> {
  constructor(
    private cardId: number,
    private position: BoardPosition,
    private playerID: number
  ) {}

  isSatisfiedBy(model: SlimeWarGameModel): boolean {
    // Check if it's player's turn
    if (!model.isMyTurn() || model.currentTurn !== this.playerID) {
      return false;
    }

    // Check if position is valid
    if (!model.isValidPosition(this.position.x, this.position.y)) {
      return false;
    }

    // Check if player has the card
    const player = model.getPlayer(this.playerID);
    if (!player) return false;

    return player.cards.some(card => card.id === this.cardId);
  }

  getErrorMessage(): string {
    return 'Cannot place card: invalid position, not your turn, or card not available';
  }
}

export class CanMoveCardRule implements BusinessRule<SlimeWarGameModel> {
  constructor(
    private fromPosition: BoardPosition,
    private toPosition: BoardPosition,
    private playerID: number
  ) {}

  isSatisfiedBy(model: SlimeWarGameModel): boolean {
    // Check if it's player's turn
    if (!model.isMyTurn() || model.currentTurn !== this.playerID) {
      return false;
    }

    // Check if there's a card at from position
    const cardId = model.getBoardCell(this.fromPosition.x, this.fromPosition.y);
    if (cardId === 0) {
      return false;
    }

    // Check if to position is valid
    return model.isValidPosition(this.toPosition.x, this.toPosition.y);
  }

  getErrorMessage(): string {
    return 'Cannot move card: not your turn, no card at source, or invalid destination';
  }
}
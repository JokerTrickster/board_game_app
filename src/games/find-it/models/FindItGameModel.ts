import { DomainModel, ModelValidationError, BusinessRule } from '../../../infrastructure/mvvm/BaseModel';

/**
 * Position coordinates for game elements
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Click data with user information
 */
export interface ClickData extends Position {
  userID: number;
  timestamp: number;
}

/**
 * Game round information
 */
export interface GameRound {
  roundNumber: number;
  normalImageUrl: string;
  abnormalImageUrl: string;
  correctPositions: Position[];
  timeLimit: number;
}

/**
 * Game session data
 */
export interface GameSession {
  sessionId: string;
  gameType: 'solo' | 'multiplayer';
  startTime: Date;
  rounds: GameRound[];
  maxLives: number;
  maxHints: number;
  maxTimerStops: number;
}

/**
 * Game configuration
 */
export interface GameConfig {
  gameType: 'solo' | 'multiplayer';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  maxLives: number;
  maxHints: number;
  maxTimerStops: number;
}

/**
 * Domain model for Find-It Game state
 */
export class FindItGameModel extends DomainModel {
  // Game configuration
  public readonly config: GameConfig;
  public readonly session: GameSession;

  // Current game state
  public currentRound: number = 1;
  public lives: number;
  public hints: number;
  public timerStops: number;
  public timer: number;
  public isGameOver: boolean = false;
  public isPaused: boolean = false;
  
  // Current round data
  public correctClicks: ClickData[] = [];
  public wrongClicks: ClickData[] = [];
  public missedPositions: Position[] = [];
  public hintPosition: Position | null = null;
  
  // UI state
  public isTimerStopped: boolean = false;
  public roundClearEffect: boolean = false;
  public roundFailEffect: boolean = false;
  public isClickable: boolean = true;

  constructor(config: GameConfig, session: GameSession) {
    super();
    this.config = config;
    this.session = session;
    this.lives = config.maxLives;
    this.hints = config.maxHints;
    this.timerStops = config.maxTimerStops;
    this.timer = config.timeLimit;
  }

  // Business Logic Methods

  /**
   * Check if a position was already clicked
   */
  isPositionAlreadyClicked(position: Position, radius: number = 20): boolean {
    const allClicks = [...this.correctClicks, ...this.wrongClicks];
    return allClicks.some(click => 
      this.calculateDistance(click, position) <= radius
    );
  }

  /**
   * Calculate distance between two positions
   */
  public calculateDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
  }

  /**
   * Add correct click if valid
   */
  addCorrectClick(position: Position, userID: number): boolean {
    if (this.isPositionAlreadyClicked(position) || !this.isClickable) {
      return false;
    }

    this.correctClicks.push({
      ...position,
      userID,
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Add wrong click if valid
   */
  addWrongClick(position: Position, userID: number): boolean {
    if (this.isPositionAlreadyClicked(position) || !this.isClickable) {
      return false;
    }

    this.wrongClicks.push({
      ...position,
      userID,
      timestamp: Date.now(),
    });

    // Temporarily disable clicking
    this.isClickable = false;

    return true;
  }

  /**
   * Enable clicking after wrong click cooldown
   */
  enableClicking(): void {
    this.isClickable = true;
  }

  /**
   * Remove wrong clicks for cleanup
   */
  removeWrongClick(userID: number): void {
    this.wrongClicks = this.wrongClicks.filter(click => click.userID !== userID);
  }

  /**
   * Use timer stop item
   */
  useTimerStop(): boolean {
    if (this.timerStops <= 0 || this.isTimerStopped) {
      return false;
    }

    this.timerStops--;
    this.isTimerStopped = true;
    return true;
  }

  /**
   * Resume timer after stop
   */
  resumeTimer(): void {
    this.isTimerStopped = false;
  }

  /**
   * Use hint item
   */
  useHint(correctPositions: Position[]): boolean {
    if (this.hints <= 0) {
      return false;
    }

    this.hints--;

    // Find first unclaimed correct position
    const availablePositions = correctPositions.filter(pos => 
      !this.correctClicks.some(click => 
        this.calculateDistance(click, pos) <= 20
      )
    );

    if (availablePositions.length > 0) {
      this.hintPosition = availablePositions[0];
      return true;
    }

    return false;
  }

  /**
   * Clear hint position
   */
  clearHint(): void {
    this.hintPosition = null;
  }

  /**
   * Check if current round is complete
   */
  isRoundComplete(correctPositions: Position[]): boolean {
    return this.correctClicks.length >= correctPositions.length;
  }

  /**
   * Prepare for next round
   */
  nextRound(): void {
    this.currentRound++;
    this.timer = this.config.timeLimit;
    this.correctClicks = [];
    this.wrongClicks = [];
    this.missedPositions = [];
    this.hintPosition = null;
    this.isClickable = true;
    this.isTimerStopped = false;
    this.roundClearEffect = false;
    this.roundFailEffect = false;
  }

  /**
   * Handle round timeout
   */
  handleTimeout(correctPositions: Position[]): void {
    const missedCount = correctPositions.length - this.correctClicks.length;
    this.lives = Math.max(0, this.lives - missedCount);
    
    // Store missed positions for display
    this.missedPositions = correctPositions.filter(pos =>
      !this.correctClicks.some(click =>
        this.calculateDistance(click, pos) <= 20
      )
    );

    if (this.lives <= 0) {
      this.isGameOver = true;
      this.roundFailEffect = true;
    } else {
      this.roundClearEffect = true;
    }
  }

  /**
   * Get current round data
   */
  getCurrentRound(): GameRound | null {
    return this.session.rounds[this.currentRound - 1] || null;
  }

  /**
   * Calculate final score
   */
  calculateScore(): number {
    const baseScore = this.currentRound * 100;
    const livesBonus = this.lives * 50;
    const hintsBonus = this.hints * 25;
    const timerStopsBonus = this.timerStops * 25;
    
    return baseScore + livesBonus + hintsBonus + timerStopsBonus;
  }

  /**
   * Reset game to initial state
   */
  resetGame(): void {
    this.currentRound = 1;
    this.lives = this.config.maxLives;
    this.hints = this.config.maxHints;
    this.timerStops = this.config.maxTimerStops;
    this.timer = this.config.timeLimit;
    this.isGameOver = false;
    this.isPaused = false;
    this.correctClicks = [];
    this.wrongClicks = [];
    this.missedPositions = [];
    this.hintPosition = null;
    this.isTimerStopped = false;
    this.roundClearEffect = false;
    this.roundFailEffect = false;
    this.isClickable = true;
  }

  // Domain Model Implementation
  protected serialize(): Record<string, any> {
    return {
      config: this.config,
      session: this.session,
      currentRound: this.currentRound,
      lives: this.lives,
      hints: this.hints,
      timerStops: this.timerStops,
      timer: this.timer,
      isGameOver: this.isGameOver,
      isPaused: this.isPaused,
      correctClicks: this.correctClicks,
      wrongClicks: this.wrongClicks,
      score: this.calculateScore(),
    };
  }

  protected validateModel(): ModelValidationError[] {
    const errors: ModelValidationError[] = [];

    if (this.lives < 0) {
      errors.push({
        field: 'lives',
        message: 'Lives cannot be negative',
        code: 'INVALID_RANGE',
      });
    }

    if (this.hints < 0) {
      errors.push({
        field: 'hints',
        message: 'Hints cannot be negative',
        code: 'INVALID_RANGE',
      });
    }

    if (this.timerStops < 0) {
      errors.push({
        field: 'timerStops',
        message: 'Timer stops cannot be negative',
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

    return errors;
  }
}

// Business Rules
export class GameCanContinueRule implements BusinessRule<FindItGameModel> {
  isSatisfiedBy(model: FindItGameModel): boolean {
    return model.lives > 0 && !model.isGameOver;
  }

  getErrorMessage(): string {
    return 'Game cannot continue: no lives remaining or game is over';
  }
}

export class CanUseItemRule implements BusinessRule<FindItGameModel> {
  constructor(private itemType: 'hint' | 'timerStop') {}

  isSatisfiedBy(model: FindItGameModel): boolean {
    if (this.itemType === 'hint') {
      return model.hints > 0;
    }
    return model.timerStops > 0 && !model.isTimerStopped;
  }

  getErrorMessage(): string {
    return `Cannot use ${this.itemType}: insufficient items or invalid state`;
  }
}
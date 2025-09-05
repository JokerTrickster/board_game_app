import { observable, action, computed, runInAction } from 'mobx';
import { BaseViewModel } from '../../../infrastructure/mvvm/BaseViewModel';
import { ServiceLocator } from '../../../infrastructure/mvvm/DIContainer';
import { Logger, NavigationService } from '../../../infrastructure/serviceRegistration';
import { FindItGameModel, GameConfig, GameSession, Position, GameRound } from '../models/FindItGameModel';
import { CommonAudioManager } from '../../../services/CommonAudioManager';
import { findItService } from '../../../services/FindItService';

/**
 * ViewModel for Find-It game logic and state management
 * Implements MVVM pattern with clear separation of concerns
 */
export class FindItViewModel extends BaseViewModel {
  // Model
  @observable private gameModel: FindItGameModel | null = null;

  // View State
  @observable public currentImages: { normal: string | null; abnormal: string | null } = {
    normal: null,
    abnormal: null,
  };
  @observable public timerColor: string = 'black';
  @observable public showEffects: boolean = false;

  // Timer management
  private timerInterval: NodeJS.Timeout | null = null;
  private timerStopTimeout: NodeJS.Timeout | null = null;
  private wrongClickTimeout: NodeJS.Timeout | null = null;
  private hintTimeout: NodeJS.Timeout | null = null;

  // Services
  private logger: Logger;
  private navigationService: NavigationService;
  private audioManager: CommonAudioManager;

  constructor() {
    super();
    this.logger = ServiceLocator.resolve<Logger>('Logger');
    this.navigationService = ServiceLocator.resolve<NavigationService>('NavigationService');
    this.audioManager = ServiceLocator.resolve<CommonAudioManager>('CommonAudioManager');
  }

  // Computed Properties
  @computed get currentRound(): number {
    return this.gameModel?.currentRound || 1;
  }

  @computed get lives(): number {
    return this.gameModel?.lives || 0;
  }

  @computed get hints(): number {
    return this.gameModel?.hints || 0;
  }

  @computed get timerStops(): number {
    return this.gameModel?.timerStops || 0;
  }

  @computed get timer(): number {
    return this.gameModel?.timer || 0;
  }

  @computed get isGameOver(): boolean {
    return this.gameModel?.isGameOver || false;
  }

  @computed get correctClicks(): Array<{ x: number; y: number; userID: number }> {
    return this.gameModel?.correctClicks || [];
  }

  @computed get wrongClicks(): Array<{ x: number; y: number; userID: number }> {
    return this.gameModel?.wrongClicks || [];
  }

  @computed get missedPositions(): Position[] {
    return this.gameModel?.missedPositions || [];
  }

  @computed get hintPosition(): Position | null {
    return this.gameModel?.hintPosition || null;
  }

  @computed get isTimerStopped(): boolean {
    return this.gameModel?.isTimerStopped || false;
  }

  @computed get roundClearEffect(): boolean {
    return this.gameModel?.roundClearEffect || false;
  }

  @computed get roundFailEffect(): boolean {
    return this.gameModel?.roundFailEffect || false;
  }

  @computed get isClickable(): boolean {
    return this.gameModel?.isClickable || false;
  }

  @computed get canUseHint(): boolean {
    return this.hints > 0;
  }

  @computed get canUseTimerStop(): boolean {
    return this.timerStops > 0 && !this.isTimerStopped;
  }

  @computed get gameProgress(): number {
    if (!this.gameModel) {return 0;}
    const currentRound = this.gameModel.getCurrentRound();
    if (!currentRound) {return 0;}
    return (this.correctClicks.length / currentRound.correctPositions.length) * 100;
  }

  // Actions

  /**
   * Initialize game with configuration
   */
  @action
  public async initializeGame(config: GameConfig): Promise<void> {
    await this.executeAsync(async () => {
      this.logger.info('Initializing Find-It game', { config });

      // Create game session
      const session: GameSession = {
        sessionId: this.generateSessionId(),
        gameType: config.gameType,
        startTime: new Date(),
        rounds: await this.loadGameRounds(config),
        maxLives: config.maxLives,
        maxHints: config.maxHints,
        maxTimerStops: config.maxTimerStops,
      };

      // Create game model
      this.gameModel = new FindItGameModel(config, session);

      // Load first round
      await this.loadCurrentRound();

      this.logger.info('Game initialized successfully');
    });
  }

  /**
   * Handle user click on game area
   */
  @action
  public async handleClick(x: number, y: number, userID: number = 1): Promise<void> {
    if (!this.gameModel || !this.gameModel.isClickable || this.isLoading) {return;}

    const currentRound = this.gameModel.getCurrentRound();
    if (!currentRound) {return;}

    // Check if click is on correct position
    const isCorrect = currentRound.correctPositions.some(pos =>
      this.gameModel!.calculateDistance(pos, { x, y }) <= 20
    );

    if (isCorrect) {
      await this.handleCorrectClick(x, y, userID);
    } else {
      await this.handleWrongClick(x, y, userID);
    }
  }

  /**
   * Use hint item
   */
  @action
  public async useHint(): Promise<void> {
    if (!this.gameModel || !this.canUseHint) {return;}

    await this.executeAsync(async () => {
      const currentRound = this.gameModel!.getCurrentRound();
      if (!currentRound) {return;}

      const success = this.gameModel!.useHint(currentRound.correctPositions);
      if (success) {
        this.playSound('hint_used.mp3');
        this.scheduleHintClear();
        this.logger.debug('Hint used successfully');
      }
    }, { showLoading: false });
  }

  /**
   * Use timer stop item
   */
  @action
  public async useTimerStop(): Promise<void> {
    if (!this.gameModel || !this.canUseTimerStop) {return;}

    await this.executeAsync(async () => {
      const success = this.gameModel!.useTimerStop();
      if (success) {
        this.stopTimer();
        this.updateState(() => {
          this.timerColor = 'red';
        });

        // Resume after 5 seconds
        this.timerStopTimeout = setTimeout(() => {
          this.resumeTimer();
        }, 5000);

        this.playSound('timer_stop.mp3');
        this.logger.debug('Timer stop used successfully');
      }
    }, { showLoading: false });
  }

  /**
   * Start game timer
   */
  @action
  public startTimer(): void {
    if (!this.gameModel || this.timerInterval) {return;}

    this.updateState(() => {
      this.timerColor = 'black';
    });

    this.timerInterval = setInterval(() => {
      if (!this.gameModel || this.gameModel.isGameOver) {
        this.stopTimer();
        return;
      }

      if (this.gameModel.timer > 0) {
        this.gameModel.timer--;
      } else {
        this.handleTimeout();
      }
    }, 1000);

    this.logger.debug('Timer started');
  }

  /**
   * Stop game timer
   */
  @action
  public stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Resume timer after stop
   */
  @action
  private resumeTimer(): void {
    if (!this.gameModel) {return;}

    this.gameModel.resumeTimer();
    this.updateState(() => {
      this.timerColor = 'black';
    });
    this.startTimer();
  }

  /**
   * Go to next round
   */
  @action
  public async nextRound(): Promise<void> {
    if (!this.gameModel) {return;}

    await this.executeAsync(async () => {
      this.gameModel!.nextRound();
      await this.loadCurrentRound();

      this.updateState(() => {
        this.showEffects = false;
      });

      this.playSound('next_stage.mp3');
      this.startTimer();

      this.logger.info(`Advanced to round ${this.currentRound}`);
    });
  }

  /**
   * Reset game to initial state
   */
  @action
  public async resetGame(): Promise<void> {
    await this.executeAsync(async () => {
      this.stopTimer();
      this.clearAllTimeouts();

      if (this.gameModel) {
        this.gameModel.resetGame();
        await this.loadCurrentRound();
      }

      this.updateState(() => {
        this.timerColor = 'black';
        this.showEffects = false;
      });

      this.logger.info('Game reset successfully');
    });
  }

  // Private Methods

  private async handleCorrectClick(x: number, y: number, userID: number): Promise<void> {
    const success = this.gameModel!.addCorrectClick({ x, y }, userID);
    if (!success) {return;}

    this.playSound('correct_click.mp3');

    // Check if round is complete
    const currentRound = this.gameModel!.getCurrentRound();
    if (currentRound && this.gameModel!.isRoundComplete(currentRound.correctPositions)) {
      await this.completeRound();
    }

    this.logger.debug('Correct click registered', { x, y, userID });
  }

  private async handleWrongClick(x: number, y: number, userID: number): Promise<void> {
    const success = this.gameModel!.addWrongClick({ x, y }, userID);
    if (!success) {return;}

    this.playSound('wrong_click.mp3');

    // Re-enable clicking after delay
    this.wrongClickTimeout = setTimeout(() => {
      if (this.gameModel) {
        this.gameModel.enableClicking();
        this.gameModel.removeWrongClick(userID);
      }
    }, 1500);

    this.logger.debug('Wrong click registered', { x, y, userID });
  }

  private async completeRound(): Promise<void> {
    this.stopTimer();

    this.updateState(() => {
      if (this.gameModel) {
        this.gameModel.roundClearEffect = true;
        this.showEffects = true;
      }
    });

    this.playSound('round_clear.mp3');

    // Auto advance to next round after delay
    setTimeout(() => {
      this.nextRound();
    }, 2000);
  }

  private handleTimeout(): void {
    this.stopTimer();

    const currentRound = this.gameModel!.getCurrentRound();
    if (currentRound) {
      this.gameModel!.handleTimeout(currentRound.correctPositions);
    }

    this.updateState(() => {
      this.showEffects = true;
    });

    if (this.gameModel!.isGameOver) {
      this.playSound('game_over.mp3');
      this.handleGameOver();
    } else {
      this.playSound('round_timeout.mp3');
      // Auto advance to next round after delay
      setTimeout(() => {
        this.nextRound();
      }, 3000);
    }
  }

  private async handleGameOver(): Promise<void> {
    this.logger.info('Game over', {
      finalScore: this.gameModel?.calculateScore(),
      round: this.currentRound,
    });

    // Navigate to results screen or show game over modal
    // This will be implemented based on navigation structure
  }

  private async loadGameRounds(config: GameConfig): Promise<GameRound[]> {
    // Load rounds from service
    // This is a simplified version - actual implementation would fetch from server
    const rounds: GameRound[] = [];

    for (let i = 1; i <= 10; i++) {
      rounds.push({
        roundNumber: i,
        normalImageUrl: `normal_${i}.jpg`,
        abnormalImageUrl: `abnormal_${i}.jpg`,
        correctPositions: [
          { x: 100 + (i * 10), y: 100 + (i * 5) },
          { x: 200 + (i * 8), y: 150 + (i * 3) },
          { x: 300 + (i * 6), y: 200 + (i * 4) },
          { x: 150 + (i * 7), y: 250 + (i * 2) },
          { x: 250 + (i * 9), y: 300 + (i * 1) },
        ],
        timeLimit: config.timeLimit,
      });
    }

    return rounds;
  }

  private async loadCurrentRound(): Promise<void> {
    if (!this.gameModel) {return;}

    const currentRound = this.gameModel.getCurrentRound();
    if (!currentRound) {
      this.logger.warn('No current round data available');
      return;
    }

    this.updateState(() => {
      this.currentImages = {
        normal: currentRound.normalImageUrl,
        abnormal: currentRound.abnormalImageUrl,
      };
    });

    this.logger.debug('Round loaded', { roundNumber: currentRound.roundNumber });
  }

  private playSound(fileName: string): void {
    try {
      this.audioManager.playEffect(fileName);
    } catch (error) {
      this.logger.warn('Failed to play sound', { fileName, error });
    }
  }

  private scheduleHintClear(): void {
    this.hintTimeout = setTimeout(() => {
      if (this.gameModel) {
        this.gameModel.clearHint();
      }
    }, 1500);
  }

  private clearAllTimeouts(): void {
    if (this.timerStopTimeout) {
      clearTimeout(this.timerStopTimeout);
      this.timerStopTimeout = null;
    }
    if (this.wrongClickTimeout) {
      clearTimeout(this.wrongClickTimeout);
      this.wrongClickTimeout = null;
    }
    if (this.hintTimeout) {
      clearTimeout(this.hintTimeout);
      this.hintTimeout = null;
    }
  }

  private generateSessionId(): string {
    return `find-it-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // BaseViewModel Implementation
  protected async onInitialize(): Promise<void> {
    this.logger.info('FindItViewModel initializing');
    // Additional initialization if needed
  }

  protected onCleanup(): void {
    this.logger.info('FindItViewModel cleaning up');
    this.stopTimer();
    this.clearAllTimeouts();
  }

  protected onError(error: Error): void {
    this.logger.error('FindItViewModel error', error);
    this.stopTimer();

    // Handle specific error types
    if (error.message.includes('network')) {
      // Handle network errors
    } else if (error.message.includes('game')) {
      // Handle game-specific errors
    }
  }
}

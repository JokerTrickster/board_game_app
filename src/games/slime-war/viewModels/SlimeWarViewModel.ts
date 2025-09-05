import { observable, action, computed, runInAction } from 'mobx';
import { BaseViewModel } from '../../../infrastructure/mvvm/BaseViewModel';
import { ServiceLocator } from '../../../infrastructure/mvvm/DIContainer';
import { Logger, NavigationService } from '../../../infrastructure/serviceRegistration';
import {
  SlimeWarGameModel,
  GameConfig,
  GameSession,
  GameCard,
  Player,
  BoardPosition,
  GameResult,
} from '../models/SlimeWarGameModel';
import { CommonAudioManager } from '../../../services/CommonAudioManager';
import { webSocketService } from '../../../services/WebSocketService';
import cardData from '../../../assets/data/cards.json';

/**
 * ViewModel for Slime War game logic and state management
 * Implements MVVM pattern with clear separation of concerns
 */
export class SlimeWarViewModel extends BaseViewModel {
  // Model
  @observable private gameModel: SlimeWarGameModel | null = null;

  // View State
  @observable public selectedCard: GameCard | null = null;
  @observable public highlightedPositions: BoardPosition[] = [];
  @observable public showGameResult: boolean = false;
  @observable public isConnected: boolean = false;

  // Timer management
  private timerInterval: NodeJS.Timeout | null = null;

  // Services
  private logger: Logger;
  private navigationService: NavigationService;
  private audioManager: CommonAudioManager;

  // Card image mapping
  private cardImageMap: { [key: number]: any } = {};

  constructor() {
    super();
    this.logger = ServiceLocator.resolve<Logger>('Logger');
    this.navigationService = ServiceLocator.resolve<NavigationService>('NavigationService');
    this.audioManager = ServiceLocator.resolve<CommonAudioManager>('CommonAudioManager');
    this.initializeCardImageMap();
  }

  // Computed Properties
  @computed get currentRound(): number {
    return this.gameModel?.currentRound || 1;
  }

  @computed get timer(): number {
    return this.gameModel?.timer || 0;
  }

  @computed get timerColor(): string {
    return this.gameModel?.timerColor || 'black';
  }

  @computed get isGameOver(): boolean {
    return this.gameModel?.isGameOver || false;
  }

  @computed get gameResult(): GameResult | null {
    return this.gameModel?.gameResult || null;
  }

  @computed get isMyTurn(): boolean {
    return this.gameModel?.isMyTurn() || false;
  }

  @computed get currentPlayer(): Player | undefined {
    return this.gameModel?.getCurrentPlayer();
  }

  @computed get opponent(): Player | undefined {
    return this.gameModel?.getOpponent();
  }

  @computed get myCards(): GameCard[] {
    return this.currentPlayer?.cards || [];
  }

  @computed get opponentCards(): GameCard[] {
    return this.opponent?.cards || [];
  }

  @computed get gameMap(): number[][] {
    return this.gameModel?.gameMap || [];
  }

  @computed get kingIndex(): number {
    return this.gameModel?.kingIndex || 0;
  }

  @computed get remainingSlime(): number {
    return this.gameModel?.remainingSlime || 0;
  }

  @computed get movableCards(): GameCard[] {
    return this.gameModel?.getMovableCards() || [];
  }

  @computed get validPositions(): BoardPosition[] {
    return this.gameModel?.getValidPositions() || [];
  }

  @computed get myScore(): string {
    if (!this.gameModel) return '0';
    return this.gameModel.calculateScore(this.gameModel.myUserID).toString();
  }

  @computed get opponentScore(): string {
    if (!this.gameModel || !this.opponent) return '0';
    return this.gameModel.calculateScore(this.opponent.userID).toString();
  }

  @computed get canPlaceCard(): boolean {
    return this.isMyTurn && this.selectedCard !== null && !this.isLoading;
  }

  @computed get gameProgress(): number {
    if (!this.gameModel) return 0;
    return (this.currentRound / this.gameModel.config.maxRounds) * 100;
  }

  // Actions

  /**
   * Initialize game with configuration
   */
  @action
  public async initializeGame(
    config: GameConfig,
    roomID: number,
    myUserID: number
  ): Promise<void> {
    await this.executeAsync(async () => {
      this.logger.info('Initializing Slime War game', { config, roomID, myUserID });

      // Create game session
      const session: GameSession = {
        sessionId: this.generateSessionId(),
        roomID,
        gameType: 'pvp',
        turnTimeLimit: config.turnTimeLimit,
        gridSize: config.gridSize,
        maxRounds: config.maxRounds,
        startTime: new Date(),
      };

      // Create game model
      this.gameModel = new SlimeWarGameModel(config, session);
      this.gameModel.myUserID = myUserID;

      // Load initial game data
      await this.loadGameData();

      this.logger.info('Game initialized successfully');
    });
  }

  /**
   * Add player to game
   */
  @action
  public addPlayer(userID: number, name: string, colorType: number): void {
    if (!this.gameModel) return;

    const player: Player = {
      userID,
      name,
      colorType,
      heroCount: 0,
      cards: this.loadPlayerCards(),
      isConnected: true,
      canMove: false,
    };

    this.gameModel.addPlayer(player);
    this.logger.info('Player added', { userID, name });
  }

  /**
   * Select card for placement
   */
  @action
  public selectCard(card: GameCard | null): void {
    this.selectedCard = card;
    
    if (card) {
      // Highlight valid positions for selected card
      this.highlightedPositions = this.validPositions;
      this.logger.debug('Card selected', { cardId: card.id, cardName: card.name });
    } else {
      this.highlightedPositions = [];
    }
  }

  /**
   * Place card on board
   */
  @action
  public async placeCard(x: number, y: number): Promise<boolean> {
    if (!this.selectedCard || !this.gameModel) return false;

    return await this.executeAsync(async () => {
      const success = this.gameModel!.placeCard(
        this.selectedCard!.id,
        x,
        y,
        this.gameModel!.myUserID
      );

      if (success) {
        // Send placement to server
        this.sendWebSocketEvent('place_card', {
          cardId: this.selectedCard!.id,
          x,
          y,
          userID: this.gameModel!.myUserID,
        });

        // Clear selection
        this.selectCard(null);
        
        // Play sound
        this.playSound('card_place.mp3');
        
        // Check win condition
        this.checkGameEnd();
        
        // End turn
        this.endTurn();

        this.logger.info('Card placed successfully', { 
          cardId: this.selectedCard?.id, 
          position: { x, y } 
        });

        return true;
      }

      return false;
    }, { showLoading: false }) || false;
  }

  /**
   * Move card on board
   */
  @action
  public async moveCard(fromX: number, fromY: number, toX: number, toY: number): Promise<boolean> {
    if (!this.gameModel) return false;

    return await this.executeAsync(async () => {
      const success = this.gameModel!.moveCard(fromX, fromY, toX, toY);

      if (success) {
        // Send move to server
        this.sendWebSocketEvent('move_card', {
          from: { x: fromX, y: fromY },
          to: { x: toX, y: toY },
          userID: this.gameModel!.myUserID,
        });

        // Play sound
        this.playSound('card_move.mp3');
        
        // Check win condition
        this.checkGameEnd();
        
        this.logger.info('Card moved successfully', { 
          from: { x: fromX, y: fromY }, 
          to: { x: toX, y: toY } 
        });

        return true;
      }

      return false;
    }, { showLoading: false }) || false;
  }

  /**
   * Start game timer
   */
  @action
  public startTimer(): void {
    if (!this.gameModel || this.timerInterval) return;

    this.updateState(() => {
      if (this.gameModel) {
        this.gameModel.timerColor = 'black';
      }
    });

    this.timerInterval = setInterval(() => {
      if (!this.gameModel || this.gameModel.isGameOver) {
        this.stopTimer();
        return;
      }

      if (this.gameModel.timer > 0) {
        this.gameModel.timer--;
        
        // Change color when time is running low
        if (this.gameModel.timer <= 10) {
          this.gameModel.timerColor = 'red';
        }
      } else {
        this.handleTimeOut();
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
   * End current turn
   */
  @action
  public async endTurn(): Promise<void> {
    if (!this.gameModel) return;

    await this.executeAsync(async () => {
      // Send end turn to server
      this.sendWebSocketEvent('end_turn', {
        userID: this.gameModel!.myUserID,
        roomID: this.gameModel!.session.roomID,
      });

      // Switch turn locally (will be confirmed by server)
      this.gameModel!.nextTurn();
      
      // Restart timer for next player
      if (this.gameModel!.isMyTurn()) {
        this.startTimer();
      } else {
        this.stopTimer();
      }

      this.logger.info('Turn ended', { nextTurn: this.gameModel!.currentTurn });
    }, { showLoading: false });
  }

  /**
   * Handle game events from server
   */
  @action
  public handleServerEvent(eventType: string, data: any): void {
    this.logger.debug('Server event received', { eventType, data });

    switch (eventType) {
      case 'game_started':
        this.handleGameStarted(data);
        break;
      case 'card_placed':
        this.handleCardPlaced(data);
        break;
      case 'card_moved':
        this.handleCardMoved(data);
        break;
      case 'turn_changed':
        this.handleTurnChanged(data);
        break;
      case 'game_ended':
        this.handleGameEnded(data);
        break;
      case 'player_disconnected':
        this.handlePlayerDisconnected(data);
        break;
      default:
        this.logger.warn('Unhandled server event', { eventType });
    }
  }

  /**
   * Reset game to initial state
   */
  @action
  public async resetGame(): Promise<void> {
    await this.executeAsync(async () => {
      this.stopTimer();
      
      if (this.gameModel) {
        this.gameModel.resetGame();
      }

      this.selectCard(null);
      this.updateState(() => {
        this.showGameResult = false;
      });

      this.logger.info('Game reset successfully');
    });
  }

  /**
   * Leave game and cleanup
   */
  @action
  public async leaveGame(): Promise<void> {
    await this.executeAsync(async () => {
      if (this.gameModel) {
        this.sendWebSocketEvent('leave_game', {
          userID: this.gameModel.myUserID,
          roomID: this.gameModel.session.roomID,
        });
      }

      this.stopTimer();
      this.updateState(() => {
        this.isConnected = false;
      });

      this.logger.info('Left game');
    });
  }

  // Private Methods

  private async loadGameData(): Promise<void> {
    // Load card data and initialize game state
    // This would typically fetch from server
    this.logger.debug('Loading game data');
  }

  private loadPlayerCards(): GameCard[] {
    // Load cards from cardData.json
    return (cardData as any[]).map(card => ({
      id: card.id,
      name: card.name,
      cost: card.cost || 1,
      attack: card.attack || 1,
      health: card.health || 1,
      special: card.special,
      image: this.cardImageMap[card.id],
      type: card.type || 'minion',
      rarity: card.rarity || 'common',
    }));
  }

  private initializeCardImageMap(): void {
    // Initialize card image mapping (same as in original component)
    this.cardImageMap = {
      1: require('../../../assets/icons/slime-war/card/card01.png'),
      2: require('../../../assets/icons/slime-war/card/card01.png'),
      3: require('../../../assets/icons/slime-war/card/card02.png'),
      4: require('../../../assets/icons/slime-war/card/card02.png'),
      5: require('../../../assets/icons/slime-war/card/card03.png'),
      6: require('../../../assets/icons/slime-war/card/card03.png'),
      7: require('../../../assets/icons/slime-war/card/card11.png'),
      8: require('../../../assets/icons/slime-war/card/card11.png'),
      9: require('../../../assets/icons/slime-war/card/card12.png'),
      10: require('../../../assets/icons/slime-war/card/card12.png'),
      11: require('../../../assets/icons/slime-war/card/card13.png'),
      12: require('../../../assets/icons/slime-war/card/card13.png'),
      13: require('../../../assets/icons/slime-war/card/card21.png'),
      14: require('../../../assets/icons/slime-war/card/card21.png'),
      15: require('../../../assets/icons/slime-war/card/card22.png'),
      16: require('../../../assets/icons/slime-war/card/card22.png'),
      17: require('../../../assets/icons/slime-war/card/card23.png'),
      18: require('../../../assets/icons/slime-war/card/card23.png'),
      19: require('../../../assets/icons/slime-war/card/card31.png'),
      20: require('../../../assets/icons/slime-war/card/card31.png'),
      21: require('../../../assets/icons/slime-war/card/card32.png'),
      22: require('../../../assets/icons/slime-war/card/card32.png'),
      23: require('../../../assets/icons/slime-war/card/card33.png'),
      24: require('../../../assets/icons/slime-war/card/card33.png'),
      25: require('../../../assets/icons/slime-war/card/card41.png'),
      26: require('../../../assets/icons/slime-war/card/card41.png'),
      27: require('../../../assets/icons/slime-war/card/card42.png'),
      28: require('../../../assets/icons/slime-war/card/card42.png'),
      29: require('../../../assets/icons/slime-war/card/card43.png'),
      30: require('../../../assets/icons/slime-war/card/card43.png'),
    };
  }

  private checkGameEnd(): void {
    if (!this.gameModel) return;

    const winCondition = this.gameModel.checkWinCondition();
    if (winCondition.winner !== null) {
      const result: GameResult = {
        isSuccess: winCondition.winner === this.gameModel.myUserID,
        winner: winCondition.winner,
        myScore: this.myScore,
        opponentScore: this.opponentScore,
        totalRounds: this.currentRound,
        gameEndReason: 'victory',
      };

      this.gameModel.endGame(result);
      this.updateState(() => {
        this.showGameResult = true;
      });

      this.playSound(result.isSuccess ? 'victory.mp3' : 'defeat.mp3');
    }
  }

  private handleTimeOut(): void {
    if (!this.gameModel) return;

    this.logger.info('Turn timeout');
    
    // Force end turn on timeout
    this.endTurn();
    
    // Check if game should end due to timeout
    const winCondition = this.gameModel.checkWinCondition();
    if (winCondition.winner !== null) {
      this.checkGameEnd();
    }
  }

  private sendWebSocketEvent(eventType: string, data: any): void {
    if (!this.isConnected) {
      this.logger.warn('Cannot send event: not connected', { eventType });
      return;
    }

    webSocketService.sendMessage(
      this.gameModel?.myUserID || 0,
      this.gameModel?.session.roomID || 0,
      eventType,
      data
    );
  }

  // Server Event Handlers

  @action
  private handleGameStarted(data: any): void {
    if (!this.gameModel) return;

    this.gameModel.currentTurn = data.firstPlayer || 1;
    
    if (this.gameModel.isMyTurn()) {
      this.startTimer();
    }

    this.logger.info('Game started', data);
  }

  @action
  private handleCardPlaced(data: any): void {
    if (!this.gameModel) return;

    // Update board state
    this.gameModel.setBoardCell(data.x, data.y, data.cardId);
    
    // Update player state if it's opponent's card
    if (data.userID !== this.gameModel.myUserID) {
      const opponent = this.gameModel.getOpponent();
      if (opponent) {
        // Remove card from opponent's hand
        const cardIndex = opponent.cards.findIndex(card => card.id === data.cardId);
        if (cardIndex >= 0) {
          opponent.cards.splice(cardIndex, 1);
        }
      }
    }

    this.logger.info('Card placed by server', data);
  }

  @action
  private handleCardMoved(data: any): void {
    if (!this.gameModel) return;

    this.gameModel.moveCard(data.from.x, data.from.y, data.to.x, data.to.y);
    this.logger.info('Card moved by server', data);
  }

  @action
  private handleTurnChanged(data: any): void {
    if (!this.gameModel) return;

    this.gameModel.currentTurn = data.newTurn;
    this.gameModel.timer = this.gameModel.config.turnTimeLimit;

    if (this.gameModel.isMyTurn()) {
      this.startTimer();
    } else {
      this.stopTimer();
    }

    this.logger.info('Turn changed', { newTurn: data.newTurn });
  }

  @action
  private handleGameEnded(data: any): void {
    if (!this.gameModel) return;

    const result: GameResult = {
      isSuccess: data.winner === this.gameModel.myUserID,
      winner: data.winner,
      myScore: data.scores[this.gameModel.myUserID] || '0',
      opponentScore: data.scores[this.opponent?.userID || 0] || '0',
      totalRounds: this.currentRound,
      gameEndReason: data.reason || 'victory',
    };

    this.gameModel.endGame(result);
    this.updateState(() => {
      this.showGameResult = true;
    });

    this.stopTimer();
    this.playSound(result.isSuccess ? 'victory.mp3' : 'defeat.mp3');
    
    this.logger.info('Game ended', result);
  }

  @action
  private handlePlayerDisconnected(data: any): void {
    if (!this.gameModel) return;

    const player = this.gameModel.getPlayer(data.userID);
    if (player) {
      player.isConnected = false;
    }

    this.logger.info('Player disconnected', data);
  }

  private playSound(fileName: string): void {
    try {
      this.audioManager.playEffect(fileName);
    } catch (error) {
      this.logger.warn('Failed to play sound', { fileName, error });
    }
  }

  private generateSessionId(): string {
    return `slime-war-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // BaseViewModel Implementation
  protected async onInitialize(): Promise<void> {
    this.logger.info('SlimeWarViewModel initializing');
  }

  protected onCleanup(): void {
    this.logger.info('SlimeWarViewModel cleaning up');
    this.stopTimer();
    this.leaveGame();
  }

  protected onError(error: Error): void {
    this.logger.error('SlimeWarViewModel error', error);
    this.stopTimer();
    
    // Handle specific error types
    if (error.message.includes('network') || error.message.includes('WebSocket')) {
      this.updateState(() => {
        this.isConnected = false;
      });
    }
  }
}
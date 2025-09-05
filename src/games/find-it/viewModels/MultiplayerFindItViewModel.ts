import { observable, action, computed } from 'mobx';
import { FindItViewModel } from './FindItViewModel';
import { webSocketService } from '../../../services/WebSocketService';
import { findItWebSocketService } from '../../../services/FindItWebSocketService';
import { Position } from '../models/FindItGameModel';

/**
 * Multiplayer-specific data
 */
export interface PlayerData {
  userID: number;
  name: string;
  score: number;
  isConnected: boolean;
}

export interface MultiplayerGameState {
  roomID: number;
  players: PlayerData[];
  currentTurn: number;
  gameStarted: boolean;
}

/**
 * ViewModel for multiplayer Find-It game
 * Extends base FindItViewModel with multiplayer functionality
 */
export class MultiplayerFindItViewModel extends FindItViewModel {
  // Multiplayer state
  @observable public roomID: number = 0;
  @observable public userID: number = 1;
  @observable public players: PlayerData[] = [];
  @observable public currentTurn: number = 1;
  @observable public gameStarted: boolean = false;
  @observable public isConnected: boolean = false;
  
  // WebSocket event handlers
  private eventHandlers: Map<string, Function> = new Map();

  constructor() {
    super();
    this.setupWebSocketEvents();
  }

  // Computed Properties
  @computed get currentPlayer(): PlayerData | undefined {
    return this.players.find(p => p.userID === this.userID);
  }

  @computed get otherPlayers(): PlayerData[] {
    return this.players.filter(p => p.userID !== this.userID);
  }

  @computed get isMyTurn(): boolean {
    return this.currentTurn === this.userID;
  }

  @computed get allPlayersReady(): boolean {
    return this.players.length >= 2 && this.players.every(p => p.isConnected);
  }

  @computed get gameCanStart(): boolean {
    return this.allPlayersReady && this.isConnected && !this.gameStarted;
  }

  // Actions

  /**
   * Join multiplayer room
   */
  @action
  public async joinRoom(roomID: number, userID: number, userName: string): Promise<void> {
    await this.executeAsync(async () => {
      this.roomID = roomID;
      this.userID = userID;
      
      this.logger.info('Joining multiplayer room', { roomID, userID, userName });

      // Connect to WebSocket
      await this.connectToWebSocket();
      
      // Send join room event
      this.sendWebSocketEvent('join_room', {
        roomID,
        userID,
        userName,
      });

      this.logger.info('Room join request sent');
    });
  }

  /**
   * Start multiplayer game
   */
  @action
  public async startMultiplayerGame(): Promise<void> {
    if (!this.gameCanStart) {
      this.logger.warn('Cannot start game: requirements not met');
      return;
    }

    await this.executeAsync(async () => {
      // Send start game event
      this.sendWebSocketEvent('start_game', {
        roomID: this.roomID,
        userID: this.userID,
      });

      this.logger.info('Multiplayer game start requested');
    });
  }

  /**
   * Handle multiplayer click (with WebSocket sync)
   */
  @action
  public async handleMultiplayerClick(x: number, y: number): Promise<void> {
    if (!this.isMyTurn || !this.gameStarted) {
      this.logger.debug('Click ignored: not my turn or game not started');
      return;
    }

    // Send click to server first
    this.sendWebSocketEvent('click', {
      roomID: this.roomID,
      userID: this.userID,
      x,
      y,
      timestamp: Date.now(),
    });

    // Handle click locally (will be confirmed by server)
    await this.handleClick(x, y, this.userID);
  }

  /**
   * Use item in multiplayer game
   */
  @action
  public async useMultiplayerItem(itemType: 'hint' | 'timerStop'): Promise<void> {
    if (!this.isMyTurn || !this.gameStarted) return;

    await this.executeAsync(async () => {
      // Send item use to server
      this.sendWebSocketEvent('use_item', {
        roomID: this.roomID,
        userID: this.userID,
        itemType,
        timestamp: Date.now(),
      });

      // Use item locally
      if (itemType === 'hint') {
        await this.useHint();
      } else if (itemType === 'timerStop') {
        await this.useTimerStop();
      }
    }, { showLoading: false });
  }

  /**
   * Leave multiplayer room
   */
  @action
  public async leaveRoom(): Promise<void> {
    await this.executeAsync(async () => {
      if (this.isConnected && this.roomID) {
        this.sendWebSocketEvent('leave_room', {
          roomID: this.roomID,
          userID: this.userID,
        });
      }

      this.disconnectFromWebSocket();
      this.resetMultiplayerState();
      
      this.logger.info('Left multiplayer room');
    });
  }

  // WebSocket Management

  private async connectToWebSocket(): Promise<void> {
    try {
      // Use existing WebSocket service or create new connection
      if (!webSocketService.isHealthy()) {
        // Connect to WebSocket server
        // This would be the actual server URL in production
        await new Promise((resolve, reject) => {
          webSocketService.connect('ws://localhost:8080/findit', (eventType, data) => {
            this.handleWebSocketMessage(eventType, data);
          });

          // Wait for connection
          setTimeout(() => {
            if (webSocketService.isHealthy()) {
              resolve(void 0);
            } else {
              reject(new Error('WebSocket connection failed'));
            }
          }, 3000);
        });
      }

      this.updateState(() => {
        this.isConnected = true;
      });
    } catch (error) {
      this.logger.error('WebSocket connection failed', error);
      throw error;
    }
  }

  private disconnectFromWebSocket(): void {
    this.updateState(() => {
      this.isConnected = false;
    });
    
    // Don't disconnect the global WebSocket service as it might be used elsewhere
    // Just clear our event handlers
    this.eventHandlers.clear();
  }

  private sendWebSocketEvent(eventType: string, data: any): void {
    if (!this.isConnected) {
      this.logger.warn('Cannot send WebSocket event: not connected', { eventType });
      return;
    }

    webSocketService.sendMessage(this.userID, this.roomID, eventType, data);
  }

  private handleWebSocketMessage(eventType: string, data: any): void {
    const handler = this.eventHandlers.get(eventType);
    if (handler) {
      try {
        handler(data);
      } catch (error) {
        this.logger.error('WebSocket event handler error', { eventType, error });
      }
    } else {
      this.logger.debug('Unhandled WebSocket event', { eventType, data });
    }
  }

  private setupWebSocketEvents(): void {
    // Room events
    this.eventHandlers.set('room_joined', this.handleRoomJoined.bind(this));
    this.eventHandlers.set('player_joined', this.handlePlayerJoined.bind(this));
    this.eventHandlers.set('player_left', this.handlePlayerLeft.bind(this));
    
    // Game events
    this.eventHandlers.set('game_started', this.handleGameStarted.bind(this));
    this.eventHandlers.set('game_ended', this.handleGameEnded.bind(this));
    this.eventHandlers.set('round_started', this.handleRoundStarted.bind(this));
    this.eventHandlers.set('round_ended', this.handleRoundEnded.bind(this));
    
    // Player actions
    this.eventHandlers.set('click_confirmed', this.handleClickConfirmed.bind(this));
    this.eventHandlers.set('item_used', this.handleItemUsed.bind(this));
    this.eventHandlers.set('turn_changed', this.handleTurnChanged.bind(this));
    
    // Error events
    this.eventHandlers.set('error', this.handleServerError.bind(this));
  }

  // Event Handlers

  @action
  private handleRoomJoined(data: any): void {
    this.roomID = data.roomID;
    this.players = data.players || [];
    this.gameStarted = data.gameStarted || false;
    
    this.logger.info('Room joined successfully', data);
  }

  @action
  private handlePlayerJoined(data: any): void {
    const existingIndex = this.players.findIndex(p => p.userID === data.userID);
    if (existingIndex >= 0) {
      this.players[existingIndex] = data;
    } else {
      this.players.push(data);
    }
    
    this.logger.info('Player joined room', data);
  }

  @action
  private handlePlayerLeft(data: any): void {
    this.players = this.players.filter(p => p.userID !== data.userID);
    
    this.logger.info('Player left room', data);
  }

  @action
  private handleGameStarted(data: any): void {
    this.gameStarted = true;
    this.currentTurn = data.firstTurn || 1;
    
    // Initialize game with server data
    if (data.gameConfig) {
      this.initializeGame(data.gameConfig);
    }
    
    if (this.isMyTurn) {
      this.startTimer();
    }
    
    this.logger.info('Multiplayer game started', data);
  }

  @action
  private handleGameEnded(data: any): void {
    this.gameStarted = false;
    this.stopTimer();
    
    // Update final scores
    if (data.finalScores) {
      data.finalScores.forEach((scoreData: any) => {
        const player = this.players.find(p => p.userID === scoreData.userID);
        if (player) {
          player.score = scoreData.score;
        }
      });
    }
    
    this.logger.info('Multiplayer game ended', data);
  }

  @action
  private handleRoundStarted(data: any): void {
    // Update round data
    if (data.roundData) {
      this.updateState(() => {
        this.currentImages = {
          normal: data.roundData.normalImage,
          abnormal: data.roundData.abnormalImage,
        };
      });
    }
    
    this.logger.info('Round started', data);
  }

  @action
  private handleRoundEnded(data: any): void {
    this.stopTimer();
    
    // Show missed positions if provided
    if (data.missedPositions && this.gameModel) {
      this.gameModel.missedPositions = data.missedPositions;
    }
    
    this.logger.info('Round ended', data);
  }

  @action
  private handleClickConfirmed(data: any): void {
    // Server confirmed the click - update game state if needed
    // This ensures all players see the same state
    this.logger.debug('Click confirmed by server', data);
  }

  @action
  private handleItemUsed(data: any): void {
    // Another player used an item - update UI accordingly
    if (data.userID !== this.userID) {
      this.logger.info('Other player used item', data);
      // Update UI to show other player's item usage
    }
  }

  @action
  private handleTurnChanged(data: any): void {
    this.currentTurn = data.newTurn;
    
    if (this.isMyTurn) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
    
    this.logger.info('Turn changed', { newTurn: data.newTurn, isMyTurn: this.isMyTurn });
  }

  @action
  private handleServerError(data: any): void {
    this.setError(data.message || 'Server error occurred');
    this.logger.error('Server error', data);
  }

  @action
  private resetMultiplayerState(): void {
    this.roomID = 0;
    this.userID = 1;
    this.players = [];
    this.currentTurn = 1;
    this.gameStarted = false;
    this.isConnected = false;
  }

  // Override cleanup to handle WebSocket
  protected onCleanup(): void {
    super.onCleanup();
    this.leaveRoom();
  }

  // Override error handling for multiplayer context
  protected onError(error: Error): void {
    super.onError(error);
    
    // Handle multiplayer-specific errors
    if (error.message.includes('WebSocket') || error.message.includes('connection')) {
      this.updateState(() => {
        this.isConnected = false;
      });
      
      // Attempt to reconnect after delay
      setTimeout(() => {
        if (this.roomID && this.userID) {
          this.connectToWebSocket().catch(reconnectError => {
            this.logger.error('Reconnection failed', reconnectError);
          });
        }
      }, 5000);
    }
  }
}
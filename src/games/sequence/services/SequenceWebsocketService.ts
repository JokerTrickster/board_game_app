import { makeAutoObservable } from 'mobx';
import { WebSocketService } from '../../../services/WebSocketService';
import { sequenceViewModel } from './SequenceViewModel';

class SequenceWebsocketService {
  private ws: WebSocketService;

  constructor() {
    makeAutoObservable(this);
    this.ws = new WebSocketService();
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners() {
    this.ws.onMessage((message: any) => {
      switch (message.type) {
        case 'GAME_STATE':
          this.handleGameState(message.data);
          break;
        case 'TURN_CHANGE':
          this.handleTurnChange(message.data);
          break;
        case 'CARD_UPDATE':
          this.handleCardUpdate(message.data);
          break;
        case 'BOARD_UPDATE':
          this.handleBoardUpdate(message.data);
          break;
      }
    });
  }

  private handleGameState(data: any) {
    sequenceViewModel.setCardList(data.playerCards);
    sequenceViewModel.setOpponentCardList(data.opponentCards);
    sequenceViewModel.setGameBoard(data.board);
    sequenceViewModel.setIsMyTurn(data.isMyTurn);
  }

  private handleTurnChange(data: any) {
    sequenceViewModel.setIsMyTurn(data.isMyTurn);
  }

  private handleCardUpdate(data: any) {
    sequenceViewModel.setCardList(data.playerCards);
    sequenceViewModel.setOpponentCardList(data.opponentCards);
  }

  private handleBoardUpdate(data: any) {
    sequenceViewModel.setGameBoard(data.board);
  }

  sendStartGameEvent() {
    this.ws.send({
      type: 'START_GAME',
      data: {}
    });
  }

  sendCardSelectEvent(cardId: string) {
    this.ws.send({
      type: 'SELECT_CARD',
      data: { cardId }
    });
  }

  sendMoveEvent(cardId: string, row: number, col: number) {
    this.ws.send({
      type: 'MOVE',
      data: { cardId, row, col }
    });
  }

  sendTimeoutEvent() {
    this.ws.send({
      type: 'TIMEOUT',
      data: {}
    });
  }

  sendEndTurnEvent() {
    this.ws.send({
      type: 'END_TURN',
      data: {}
    });
  }

  sendGameOverEvent(winner: string) {
    this.ws.send({
      type: 'GAME_OVER',
      data: { winner }
    });
  }

  disconnect() {
    this.ws.disconnect();
  }
}

export const sequenceWebSocketService = new SequenceWebsocketService(); 
import { makeAutoObservable } from 'mobx';

class SequenceViewModel {
  cardList: string[] = [];
  opponentCardList: string[] = [];
  selectedCard: string | null = null;
  isMyTurn: boolean = false;
  gameBoard: number[][] = Array(10).fill(null).map(() => Array(10).fill(0));
  userID: string = '';
  opponentID: string = '';

  constructor() {
    makeAutoObservable(this);
  }

  setCardList(cards: string[]) {
    this.cardList = cards;
  }

  setOpponentCardList(cards: string[]) {
    this.opponentCardList = cards;
  }

  setSelectedCard(card: string | null) {
    this.selectedCard = card;
  }

  setIsMyTurn(isMyTurn: boolean) {
    this.isMyTurn = isMyTurn;
  }

  setGameBoard(board: number[][]) {
    this.gameBoard = board;
  }

  setUserID(id: string) {
    this.userID = id;
  }

  setOpponentID(id: string) {
    this.opponentID = id;
  }
}

export const sequenceViewModel = new SequenceViewModel();

import { makeAutoObservable, action } from 'mobx';
import cardData from '../../../assets/data/cards.json';
class SequenceViewModel {
    timer = 30; // 초 단위 타이머
    round = 1; // 현재 라운드
    gameOver = false; // 게임 종료 여부
    timerInterval: NodeJS.Timeout | null = null; // 타이머 인터벌
    timerColor = 'black';
    cardList: any[] = [];       // 현재 소유하고 있는 본인 카드
    opponentCardList: any[] = []; // 상대방 카드 
    gameMap: number[][] = Array(10).fill(null).map(() => Array(10).fill(1));
    userColorType = 0;
    opponentColorType = 0;
    ownedMapIDs: number[] = [];
    opponentOwnedMapIDs: number[] = [];
    userID = 0;
    opponentID = 0;
    isMyTurn = false;
    selectedCard = 0;
    myLastPlacedCard = null;
    opponentLastPlacedCard = null;
    mySequences: number[][] = [];      // 내 시퀀스 목록
    opponentSequences: number[][] = []; // 상대방 시퀀스 목록

    constructor() {
        makeAutoObservable(this, {
            setTimer: action,
            updateTimer: action,
            updateTimerColor: action,
            stopTimer: action,
            startTimer: action,
            resetGameState: action,
            setCardList: action,
            setOpponentCardList: action,
            setGameMap: action,
            setSelectedCard: action,
            setUserColorType: action,
            setOpponentColorType: action,
            setIsMyTurn: action,
            updateTurn: action,
            setUserID: action,
            setOpponentID: action,
            setOwnedMapIDs: action,
            setOpponentOwnedMapIDs: action,
            setMyLastPlacedCard: action,
            setOpponentLastPlacedCard: action,
            setMySequences: action,
            setOpponentSequences: action,
        });
    }
    
    setOwnedMapIDs(ownedMapIDs: number[]) {
        this.ownedMapIDs = ownedMapIDs;
    }
    setOpponentOwnedMapIDs(opponentOwnedMapIDs: number[]) {
        this.opponentOwnedMapIDs = opponentOwnedMapIDs;
    }
    setMyLastPlacedCard(card: any) {
        this.myLastPlacedCard = card;
    }
    setOpponentLastPlacedCard(card: any) {
        this.opponentLastPlacedCard = card;
    }
    setSelectedCard(card: number) {
        this.selectedCard = card;
    }

    setUserID(userID: number) {
        this.userID = userID;
    }
    setOpponentID(opponentID: number) {
        this.opponentID = opponentID;
    }
    setUserColorType(colorType: number) {
        this.userColorType = colorType;
    }
    setOpponentColorType(colorType: number) {
        this.opponentColorType = colorType;
    }
    /*
     * 슬라임 포지션을 이용하여 게임 맵을 초기화합니다.
     * @param users - 슬라임 정보를 포함하는 사용자 배열. 각 사용자는 userID와 0부터 80까지의 슬라임 위치 배열(slimePositions)을 가집니다.
     */
    setGameMap(users: any[]) {
        // 게임 맵 초기화
        const initialMap = Array(10).fill(null).map(() => Array(10).fill(null));
        
        // users 배열이 있는 경우에만 처리
        if (Array.isArray(users)) {
            users.forEach(user => {
                if (user.ownedMapIDs && Array.isArray(user.ownedMapIDs)) {
                    user.ownedMapIDs.forEach((mapID: number) => {
                        const row = Math.floor(mapID / 10);
                        const col = mapID % 10;
                        if (row >= 0 && row < 10 && col >= 0 && col < 10) {
                            initialMap[row][col] = user.colorType;
                        }
                    });
                }
            });
        }
        
        this.gameMap = initialMap;
    }
    updateGameState( round: number) {
        this.round = round;
    }

    setCardList(cardList: any[]) {
        this.cardList = cardList;
    }
    setOpponentCardList(opponentCardList: any[]) {
        this.opponentCardList = opponentCardList;
    }
    /** 타이머 값을 설정하는 함수 */
    setTimer(value: number) {
        this.timer = value;
    }

    /** 타이머 값을 업데이트하는 함수 */
    updateTimer(value: number) {
        this.timer = value;
    }
    
    
    /** 타이머 색상을 업데이트하는 함수 */
    updateTimerColor(color: string) {
        this.timerColor = color;
    }

    /** 타이머 정지 함수 */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.timer = 0;
    }

    /** 타이머 시작 함수 */
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.timerInterval = setInterval(() => {
            if (this.gameOver) {
                this.stopTimer();
                return;
            }
            if (this.timer > 0) {
                this.updateTimer(this.timer - 1);
            } else {
                this.stopTimer();
                console.log('🚨 TIME_OUT event 발생');
                // 타이머 종료 시 추가 이벤트 처리 가능
            }
        }, 1000);
    }

    /** 게임 상태 초기화 함수 */
    resetGameState() {
        this.timer = 60;
        this.round = 1;
        this.gameOver = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.timerColor = 'black';
    }

    setIsMyTurn(value: boolean) {
        this.isMyTurn = value;
    }

    /**
     * 현재 라운드와 내 turn 정보를 받아 내 차례인지 여부를 갱신
     * @param currentRound 서버에서 받은 currentRound
     * @param turn 내 user turn 정보 (0: 선, 1: 후)
     */
    updateTurn(currentRound: number, turn: number) {
        this.isMyTurn = (currentRound % 2 === turn);
    }

    // 시퀀스 설정 메서드 추가
    setMySequences(sequences: number[][]) {
        this.mySequences = sequences;
    }

    setOpponentSequences(sequences: number[][]) {
        this.opponentSequences = sequences;
    }
}

export const sequenceViewModel = new SequenceViewModel();

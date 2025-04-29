import { makeAutoObservable, action } from 'mobx';
import cardData from '../../../assets/data/cards.json';
class SlimeWarViewModel {
    hero = 4;
    timer = 60; // 초 단위 타이머
    round = 1; // 현재 라운드
    gameOver = false; // 게임 종료 여부
    timerInterval: NodeJS.Timeout | null = null; // 타이머 인터벌
    timerColor = 'black';
    kingIndex = 0;
    remainingSlime = 0;
    canMoveCardList: any[] = [];
    cardList: any[] = [];       // 현재 소유하고 있는 본인 카드
    opponentCardList: any[] = []; // 상대방 카드 
    gameMap: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));
    userColorType = 0;
    opponentColorType = 0;
    userID = 0;
    opponentID = 0;
    isMyTurn = false;

    constructor() {
        makeAutoObservable(this, {
            setTimer: action,
            updateTimer: action,
            updateTimerColor: action,
            stopTimer: action,
            startTimer: action,
            setKingIndex: action,
            resetGameState: action,
            setCardList: action,
            setOpponentCardList: action,
            setRemainingSlime: action,
            setGameMap: action,
            setUserColorType: action,
            setOpponentColorType: action,
            setIsMyTurn: action,
            updateTurn: action,
        });
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
    setGameMap(users: Array<{ userID: number; slimePositions: number[] }>) {
        const GRID_SIZE = 9; // 그리드의 크기

        // 9x9 맵 생성: 모든 셀은 기본값 0으로 초기화
        this.gameMap = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

        // 각 사용자 별로 슬라임 위치 적용
        users.forEach(user => {
            user.slimePositions.forEach(position => {
                const x = position % GRID_SIZE;
                const y = Math.floor(position / GRID_SIZE);
                this.gameMap[x][y] = user.userID;
            });
        });
    }
    updateGameState( round: number) {
        this.round = round;
    }

    setRemainingSlime(remainingSlime: number) {
        this.remainingSlime = remainingSlime;
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

    setKingIndex(index: number) {
        this.kingIndex = index;
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
}

export default SlimeWarViewModel;
export const slimeWarViewModel = new SlimeWarViewModel();

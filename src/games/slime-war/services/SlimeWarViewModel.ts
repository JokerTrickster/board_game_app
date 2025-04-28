import { makeAutoObservable, action } from 'mobx';

class SlimeWarViewModel {
    hero = 4;
    timer = 60; // 초 단위 타이머
    round = 1; // 현재 라운드
    gameOver = false; // 게임 종료 여부
    timerInterval: NodeJS.Timeout | null = null; // 타이머 인터벌
    timerColor = 'black';
    kingIndex = 0;
    remainingSlime = 0;
    canMove = true;
    cardList: any[] = [];
    opponentCardList: any[] = [];
    slimePositions: any[] = [];
    opponentSlimePositions: any[] = [];
    gameMap: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));

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
            setCanMove: action,
            setSlimePositions: action,
            setOpponentSlimePositions: action,
            setGameMap: action,
        });
    }
    setGameMap(gameMap: number[][]) {
        this.gameMap = gameMap;
    }

    setSlimePositions(slimePositions: any[]) {
        this.slimePositions = slimePositions;
    }
    setOpponentSlimePositions(opponentSlimePositions: any[]) {
        this.opponentSlimePositions = opponentSlimePositions;
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
    setCanMove() {
        console.log("🔍 카드 리스트 길이:", this.cardList);
        console.log("🔍 현재 슬라임 위치:", this.slimePositions);
        console.log("🔍 상대 슬라임 위치:", this.opponentSlimePositions);
        console.log("히어로 카드 ");
        console.log("왕 위치 ", this.kingIndex);
        if (this.cardList.length === 0) {
            this.canMove = true;
        } else {
            this.canMove = false;
        }
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
}

export default SlimeWarViewModel;
export const slimeWarViewModel = new SlimeWarViewModel();

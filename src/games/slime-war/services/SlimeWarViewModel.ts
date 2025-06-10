import { makeAutoObservable, action, observable } from 'mobx';
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
    gameMap: number[][] = Array(10).fill(null).map(() => Array(10).fill(0));
    userColorType = 0;
    opponentColorType = 0;
    userHeroCount = 0;
    opponentHeroCount = 0;
    userID = 0;
    opponentID = 0;
    opponentCanMove = false;
    myLastPlacedCard = 0;
    opponentLastPlacedCard = 0;
    myTurn = 0;
    isMyTurn = false;
    @observable isGameOver: boolean = false;
    @observable gameResult: {
        isSuccess: boolean;
        myScore: string;
        opponentScore: string;
    } | null = null;

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
            setUserHeroCount: action,
            setOpponentHeroCount: action,
            setUserID: action,
            setOpponentID: action,
            setMyTurn: action,
            setOpponentCanMove: action,
            setMyLastPlacedCard: action,
            setOpponentLastPlacedCard: action,
            setGameOver: action,
            resetGameOver: action,
        });
    }
    setMyLastPlacedCard(card: any) {
        this.myLastPlacedCard = card;
    }
    setOpponentLastPlacedCard(card: any) {
        this.opponentLastPlacedCard = card;
    }

    setMyTurn(turn: number) {
        this.myTurn = turn;
    }
    setOpponentCanMove(canMove: boolean) {
        this.opponentCanMove = canMove;
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
    setUserHeroCount(heroCount: number) {
        this.userHeroCount = heroCount;
    }
    setOpponentHeroCount(heroCount: number) {
        this.opponentHeroCount = heroCount;
    }
    /*
     * 슬라임 포지션을 이용하여 게임 맵을 초기화합니다.
     * @param users - 슬라임 정보를 포함하는 사용자 배열. 각 사용자는 userID와 0부터 80까지의 슬라임 위치 배열(slimePositions)을 가집니다.
     */
    setGameMap(users: Array<{ id: number; slimePositions: number[] }>) {
        const GRID_SIZE = 9; // 그리드의 크기

        // 9x9 맵 생성: 모든 셀은 기본값 0으로 초기화
        this.gameMap = Array.from({ length: GRID_SIZE+1 }, () => Array(GRID_SIZE+1).fill(0));

        // 각 사용자 별로 슬라임 위치 적용
        users.forEach(user => {
            user.slimePositions.forEach(position => {
                let x = position % GRID_SIZE;
                let y = Math.floor(position / GRID_SIZE);
                if (x === 0) {
                    x = GRID_SIZE;
                    y -= 1;
                }
                this.gameMap[x][y] = user.id;
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

    // 연결된 슬라임 그룹을 찾는 함수
    private findConnectedSlimes(gameMap: number[][], startX: number, startY: number, targetUserId: number, visited: boolean[][]): number {
        if (startX < 1 || startX > 9 || startY < 1 || startY > 9 || 
            visited[startY][startX] || gameMap[startX][startY] !== targetUserId) {
            return 0;
        }

        visited[startY][startX] = true;
        let count = 1;

        // 상하좌우 방향으로 탐색
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dx, dy] of directions) {
            const newX = startX + dx;
            const newY = startY + dy;
            count += this.findConnectedSlimes(gameMap, newX, newY, targetUserId, visited);
        }

        return count;
    }

    // 점수 계산 함수
    calculateScore(userId: number): number {
        const gameMap = this.gameMap;
        const visited: boolean[][] = Array(10).fill(0).map(() => Array(10).fill(false));
        let totalScore = 0;

        // 모든 칸을 순회하면서 연결된 슬라임 그룹 찾기
        for (let y = 1; y <= 9; y++) {
            for (let x = 1; x <= 9; x++) {
                if (!visited[y][x] && gameMap[x][y] === userId) {
                    const groupSize = this.findConnectedSlimes(gameMap, x, y, userId, visited);
                    totalScore += groupSize * groupSize; // 제곱하여 점수 계산
                }
            }
        }

        return totalScore;
    }
    calculateScoreString(userId: number): string {
        const gameMap = this.gameMap;
        const visited: boolean[][] = Array(10).fill(0).map(() => Array(10).fill(false));
        let totalScore = "";

        // 모든 칸을 순회하면서 연결된 슬라임 그룹 찾기
        for (let y = 1; y <= 9; y++) {
            for (let x = 1; x <= 9; x++) {
                if (!visited[y][x] && gameMap[x][y] === userId) {
                    const groupSize = this.findConnectedSlimes(gameMap, x, y, userId, visited);
                    if (totalScore === "") {
                        totalScore += "(" + groupSize + " * " + groupSize + ")"; // 제곱하여 점수 계산
                    } else {
                        totalScore += " + (" + groupSize + " * " + groupSize + ")"; // 제곱하여 점수 계산
                    }
                }
            }
        }

        return totalScore.trim();
    }

    @action
    setGameOver(result: { isSuccess: boolean; myScore: string; opponentScore: string }) {
        this.isGameOver = true;
        this.gameResult = result;
    }

    @action
    resetGameOver() {
        this.isGameOver = false;
        this.gameResult = null;
    }
}

export default SlimeWarViewModel;
export const slimeWarViewModel = new SlimeWarViewModel();

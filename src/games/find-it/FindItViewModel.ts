import { action, makeAutoObservable } from 'mobx';
import { webSocketService } from '../../services/WebSocketService';

class GameViewModel {
    life = 3; // 목숨 개수
    hints = 2; // 힌트 개수
    item_timer_stop = 3; // ✅ 타이머 멈춤 아이템 개수
    timer = 60; // 초 단위 타이머
    round = 1; // 현재 라운드
    gameOver = false; // 게임 종료 여부
    correctClicks: { x: number; y: number; userID:number}[] = []; // 맞춘 위치 저장
    wrongClicks: { x: number; y: number; userID: number }[] = []; // 틀린 위치 저장
    isClickable = true; // 연속 클릭 방지
    timerInterval: NodeJS.Timeout | null = null; // 타이머 인터벌
    timerStopped = false; // ✅ 타이머 멈춤 상태
    timerColor = 'black'; // ✅ 타이머 색상
    currentImageID = 0; // 현재 이미지 인덱스
    remainingTime = 60; // ✅ 현재 남은 타이머 시간 저장
    hintPosition: { x: number; y: number } | null = null; // ✅ 힌트 좌표 저장
    // ✅ 서버에서 받은 이미지 URL 저장
    normalImage: string | null = null;
    abnormalImage: string | null = null;
    roundClearEffect = false; // ✅ "클리어" 이펙트 상태 추가



    constructor() {
        makeAutoObservable(this, {
            nextRound: action,
            startTimer: action,
            stopTimer: action,
            updateTimer: action,
            useTimerStopItem: action, // ✅ 추가
            setHintPosition: action, // ✅ 추가
            setImage: action, // ✅ 이미지 설정 함수
            setRoundClearEffect: action, // ✅ 액션 추가
            setNormalImage: action,
            setAbnormalImage: action,
            updateGameState: action,  // ✅ 액션 선언
        });
    }

    /** 특정 좌표가 이미 클릭된 위치인지 확인 */
    isAlreadyClicked(x: number, y: number): boolean {
        return (
            this.correctClicks.some(click => this.isNearby(click.x, click.y, x, y)) ||
            this.wrongClicks.some(click => this.isNearby(click.x, click.y, x, y))
        );
    }

    /** 두 좌표가 일정 거리 이내인지 확인 */
    isNearby(x1: number, y1: number, x2: number, y2: number, radius: number = 20): boolean {
        const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        return distance <= radius;
    }
    /** ✅ 정답 클릭 저장 (유저 ID 포함) */
    addCorrectClick(x: number, y: number, userID: number) {
        if (this.isAlreadyClicked(x, y)) return; // 이미 클릭된 영역이면 무시
        this.correctClicks.push({ x, y, userID });
    }

    /** ✅ 오답 클릭 저장 (유저 ID 포함, 3초 후 삭제) */
    addWrongClick(x: number, y: number, userID: number) {
        if (this.isAlreadyClicked(x, y)) return; // 중복 클릭 방지
        this.isClickable = false;

        const wrongClick = { id: Date.now().toString(), x, y, userID };
        this.wrongClicks = [...this.wrongClicks, wrongClick];

        setTimeout(() => {
            this.wrongClicks = this.wrongClicks.filter(click => click.userID !== wrongClick.userID);
            this.isClickable = true;
        }, 1500); // 1.5초 후 제거
    }


    startTimer(callback?: () => void) {
        this.stopTimer();
        this.timerStopped = false;
        this.updateTimerColor('black');

        this.timerInterval = setInterval(() => {
            if (this.gameOver) {
                this.stopTimer();
            }
            if (this.timer > 0) {
                console.log(`⏲️ 남은 시간: ${this.timer}초`);
                this.updateTimer(this.timer - 1);
                this.remainingTime = this.timer; // ✅ 남은 시간 저장
            } else {
                this.stopTimer();
                console.log('🚨 타이머 종료! 남은 정답 개수를 목숨에서 차감');
                webSocketService.sendTimeOutEvent();
                if (this.life > 0) {
                    console.log('➡️ 다음 라운드로 이동');
                    webSocketService.sendNextRoundEvent();
                } else {
                    console.log('💀 게임 종료!');
                    this.gameOver = true;
                }

                if (callback) callback();
            }
        }, 1000);
    }
    // ✅ 게임 상태 업데이트 액션 추가
    updateGameState(life: number, hints: number, itemTimerStop: number, round: number) {
        this.life = life;
        this.hints = hints;
        this.item_timer_stop = itemTimerStop;
        this.round = round;
    }


    updateTimer(value: number) {
        this.timer = value;
    }

    /** ✅ 서버에서 받은 이미지 URL 설정 */
    setImage(normal: string, abnormal: string) {
        this.normalImage = normal;
        this.abnormalImage = abnormal;
    }
    
    // ✅ "클리어" 이펙트 상태 변경
    setRoundClearEffect(value: boolean) {
        this.roundClearEffect = value;
    }
    // ✅ 정상 이미지 설정 함수
    setNormalImage(url: string) {
        this.normalImage = url;
    }

    // ✅ 틀린 이미지 설정 함수
    setAbnormalImage(url: string) {
        this.abnormalImage = url;
    }
    /*
       아이템 사용
    */
    /** ✅ 타이머 멈춤 기능 (5초간 멈춤, 타이머 바 유지) */
    useTimerStopItem() {
        if (this.item_timer_stop > 0 && !this.timerStopped) {
            this.stopTimer();
            this.timerStopped = true;
            this.updateTimerColor('red');

            setTimeout(() => {
                console.log("▶ 타이머 다시 시작!");
                this.updateTimerColor('black');
                this.startTimer(); // ✅ 기존 진행 상태에서 재개
            }, 5000);
        }
    }


    setHintPosition(x: number, y: number) {
        this.hintPosition = { x, y };
        console.log("힌트 좌표 저장", this.hintPosition);   
        setTimeout(() => {
            this.hintPosition = null;
        }, 1500);
    }
 
    updateTimerColor(color: string) {
        this.timerColor = color;
    }

   
    stopTimer() {
        this.timerStopped = true;
        this.remainingTime = 0;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    nextRound() {
        this.updateTimer(60);
        this.remainingTime = 60; // ✅ 다음 라운드 타이머 초기화
        this.correctClicks = [];
        this.wrongClicks = [];
        this.startTimer();
    }
}

const gameViewModel = new GameViewModel();
export default gameViewModel;

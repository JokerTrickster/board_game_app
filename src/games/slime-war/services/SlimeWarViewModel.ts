import { makeAutoObservable, action } from 'mobx';

class SlimeWarGameViewModel {
    hero = 4;
    timer = 60; // 초 단위 타이머
    round = 1; // 현재 라운드
    gameOver = false; // 게임 종료 여부
    timerInterval: NodeJS.Timeout | null = null; // 타이머 인터벌
    timerColor = 'black';

    normalImage = "";
    abnormalImage = "";
    hintPosition: { x: number; y: number } | null = null;

    constructor() {
        makeAutoObservable(this, {
            setTimer: action,
            updateTimer: action,
            updateTimerColor: action,
            stopTimer: action,
            startTimer: action,
            setImage: action,
            setHintPosition: action,
            resetGameState: action,
        });
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

    /** 서버에서 받은 이미지 URL 설정 */
    setImage(normal: string, abnormal: string) {
        this.normalImage = normal;
        this.abnormalImage = abnormal;
    }

    /** 힌트 좌표 설정 함수 (1.5초 후 자동 초기화) */
    setHintPosition(x: number, y: number) {
        this.hintPosition = { x, y };
        setTimeout(() => {
            this.hintPosition = null;
        }, 1500);
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
        this.normalImage = "";
        this.abnormalImage = "";
        this.hintPosition = null;
        this.timerColor = 'black';
    }
}

export default SlimeWarGameViewModel;

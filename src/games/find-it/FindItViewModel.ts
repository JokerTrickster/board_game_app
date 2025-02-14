import { action, makeAutoObservable } from 'mobx';

class GameViewModel {
    lives = 3; // 목숨 개수
    hints = 2; // 힌트 개수
    item_timer_stop = 3; // ✅ 타이머 멈춤 아이템 개수
    timer = 60; // 초 단위 타이머
    round = 1; // 현재 라운드
    gameOver = false; // 게임 종료 여부
    correctClicks: { x: number; y: number }[] = []; // 맞춘 위치 저장
    wrongClicks: { id: string; x: number; y: number }[] = []; // 틀린 위치 저장
    isClickable = true; // 연속 클릭 방지
    timerInterval: NodeJS.Timeout | null = null; // 타이머 인터벌
    timerStopped = false; // ✅ 타이머 멈춤 상태
    timerColor = 'black'; // ✅ 타이머 색상
    currentImageIndex = 0; // 현재 이미지 인덱스
    images = [
        { normal: require('../../assets/images/normal1.png'), different: require('../../assets/images/different1.png') },
        { normal: require('../../assets/images/normal2.png'), different: require('../../assets/images/different2.png') },
    ];

    constructor() {
        makeAutoObservable(this, {
            decreaseLife: action,
            resetGame: action,
            nextRound: action,
            startTimer: action,
            stopTimer: action,
            updateTimer: action,
            useTimerStopItem: action,
        });
    }

    decreaseLife() {
        if (this.lives > 0) {
            this.lives -= 1;
        }
        if (this.lives === 0) {
            console.log('게임 종료!');
            this.gameOver = true;
            this.stopTimer();
        }
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

    /** 정답 클릭 */
    addCorrectClick(x: number, y: number) {
        if (this.isAlreadyClicked(x, y)) return; // 이미 클릭된 영역이면 무시
        this.correctClicks.push({ x, y });
    }

    /** 오답 클릭 */
    addWrongClick(x: number, y: number) {
        if (this.isAlreadyClicked(x, y)) return; // 연속 클릭 방지 + 이미 클릭된 영역 무시
        this.isClickable = false;

        // ✅ ❌에 고유 ID 추가
        const wrongClick = { id: Date.now().toString(), x, y };
        this.wrongClicks = [...this.wrongClicks, wrongClick]; // ❌ 여러 개 유지

        // ✅ 개별 ❌ 클릭마다 3초 후 삭제
        setTimeout(() => {
            this.wrongClicks = this.wrongClicks.filter(click => click.id !== wrongClick.id);
            this.isClickable = true;
        }, 3000);
    }

    useHint() {
        if (this.hints > 0) {
            this.hints -= 1;

            // 힌트로 정답 중 하나를 자동으로 추가
            const correctAreas = [
                { x: 50, y: 60 },
                { x: 200, y: 150 }
            ];

            const remainingHints = correctAreas.filter(
                (area) => !this.correctClicks.some((click) => click.x === area.x && click.y === area.y)
            );

            if (remainingHints.length > 0) {
                const hintSpot = remainingHints[0];
                this.addCorrectClick(hintSpot.x, hintSpot.y);
            }
        }
    }
    /** ✅ 타이머 멈춤 기능 (5초간 멈춤, 색상 변경) */
    useTimerStopItem() {
        if (this.item_timer_stop > 0) {
            this.item_timer_stop -= 1;
            if (!this.timerStopped) {
                console.log("⏸ 타이머 멈춤 기능 사용! 5초 동안 멈춥니다.");
                this.stopTimer();
                this.updateTimerColor('red'); // ✅ 타이머 색상 빨간색으로 변경

                setTimeout(() => {
                    console.log("▶ 타이머 재시작!");
                    this.updateTimerColor('black'); // ✅ 원래 색상으로 변경
                    this.startTimer();
                }, 5000); // 5초 후 재시작
            } else {
                console.log("❌ 이미 타이머가 멈춰 있습니다.");
            }
        }
    }
    updateTimerColor(color: string) {
        this.timerColor = color;
    }
    updateTimer(value: number) {
        this.timer = value;
    }
    startTimer(callback?: () => void) {
        this.stopTimer();
        this.timerStopped = false;
        this.updateTimerColor('black');

        this.timerInterval = setInterval(() => {
            if (this.timer > 0) {
                this.updateTimer(this.timer - 1);
            } else {
                this.stopTimer();
                console.log('🚨 타이머 종료! 남은 정답 개수를 목숨에서 차감');

                // ✅ 남은 정답 개수 계산
                const remainingMistakes = 5 - this.correctClicks.length;
                this.lives -= remainingMistakes;

                if (this.lives > 0) {
                    console.log('➡️ 다음 라운드로 이동');
                    this.nextRound();
                } else {
                    console.log('💀 게임 종료!');
                    this.gameOver = true;
                }

                if (callback) callback();
            }
        }, 1000);
    }
    stopTimer() {
        this.timerStopped = true;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    nextRound() {
        if (this.lives <= 0) return;
        this.round += 1;
        this.updateTimer(60);
        this.correctClicks = [];
        this.wrongClicks = [];
        this.startTimer();
        // ✅ 다음 이미지로 변경 (배열 길이를 초과하면 0으로 순환)
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }

    resetGame() {
        this.lives = 3;
        this.hints = 2;
        this.item_timer_stop = 2;
        this.round = 1;
        this.updateTimer(60);
        this.correctClicks = [];
        this.wrongClicks = [];
        this.gameOver = false;
        this.startTimer();
    }
}

const gameViewModel = new GameViewModel();
export default gameViewModel;

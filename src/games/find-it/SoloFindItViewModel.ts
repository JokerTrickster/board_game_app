import { action, makeAutoObservable, runInAction } from 'mobx';

class SoloGameViewModel {
    life = 3; // 목숨 개수
    hints = 2; // 힌트 개수
    item_timer_stop = 3; // ✅ 타이머 멈춤 아이템 개수
    timer = 6000; // 초 단위 타이머
    round = 1; // 현재 라운드
    gameOver = false; // 게임 종료 여부
    correctClicks: { x: number; y: number; userID: number }[] = []; // 맞춘 위치 저장
    wrongClicks: { x: number; y: number; userID: number }[] = []; // 틀린 위치 저장
    missedPositions: { x: number; y: number }[] = []; // ✅ 못 맞춘 좌표 상태 추가
    isClickable = true; // 연속 클릭 방지
    timerInterval: NodeJS.Timeout | null = null; // 타이머 인터벌
    timerStopped = false; // ✅ 타이머 멈춤 상태
    timerColor = 'black'; // ✅ 타이머 색상
    currentImageID = 0; // 현재 이미지 인덱스
    remainingTime = 6000; // ✅ 현재 남은 타이머 시간 저장
    hintPosition: { x: number; y: number } | null = null; // ✅ 힌트 좌표 저장
    // ✅ 서버에서 받은 이미지 URL 저장
    normalImage: string | null = null;
    abnormalImage: string | null = null;
    roundClearEffect = false; // ✅ "클리어" 이펙트 상태 추가
    roundFailEffect = false; // ✅ "실패" 이펙트 상태 추가


    constructor() {
        makeAutoObservable(this, {
            initClicks: action,
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
            setRoundFailEffect: action,
            setTimer: action,
            setMissedPositions: action,
        });
    }

    setMissedPositions(positions: { x: number; y: number }[]) {
        this.missedPositions = positions;
    }
    clearMissedPositions() {
        this.missedPositions = [];
    }

    /** ✅ 타이머 값을 안전하게 설정하는 함수 */
    setTimer(value: number) {
        this.timer = value;
        this.remainingTime = value;
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
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        runInAction(() => {
            this.timerStopped = false;
            this.updateTimerColor('black');
        });
        this.timerInterval = setInterval(() => {
            if (this.gameOver) {
                this.stopTimer();
                return;
            }

            if (this.timer > 0) {
                this.updateTimer(this.timer - 1);
                this.remainingTime = this.timer;
            } else {
                console.log("타임아웃");
                this.stopTimer();
                runInAction(() => {
                    this.life -= (5 - this.correctClicks.length);
                });
                console.log("남은 생명력 : ", this.life);
                //타임아웃 이벤트 처리
                if (this.life <= 0) {
                    runInAction(() => {
                        this.roundFailEffect = true;
                        this.gameOver = true;
                    });
                } else {
                    runInAction(() => {
                        this.roundClearEffect = true;
                        this.nextRound();
                    });
                }
            }
        }, 1000);
    }
    // ✅ 게임 상태 업데이트 액션 추가
    updateGameState(life: number, hints: number, itemTimerStop: number, round: number, timer: number) {
        this.life = life;
        this.hints = hints;
        this.item_timer_stop = itemTimerStop;
        this.round = round;
        this.timer = timer;
    }

    // ✅ 타이머 초기화 함수
    initTimer(value: number) {
        this.timer = value;
        this.remainingTime = value; // ✅ 서버에서 받은 타이머로 초기
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer(value: number) {
        this.timer = value;
    }

    /** ✅ 서버에서 받은 이미지 URL 설정 */
    setImage(normal: string, abnormal: string) {
        this.normalImage = normal;
        this.abnormalImage = abnormal;
    }
    setRoundFailEffect(value: boolean) {
        this.roundFailEffect = value;
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
    /** ✅ 타이머 멈춤 아이템 */
    useTimerStopItem() {
        if (this.item_timer_stop > 0 && !this.timerStopped) {
            this.timerStopped = true;
            this.stopTimer();
            this.updateTimerColor('red');

            setTimeout(() => {
                this.updateTimerColor('black');
                this.startTimer();
            }, 5000);
        }
    }

    // 힌트 아이템 사용
    
    useHintItem(correctPositions: { x: number; y: number }[]) {
        // 정답으로 체크되지 않은 좌표만 필터링
        //힌트 좌표를 넣을때 정답 좌표에 없는거를 넣어줘야 된다.
        if (this.correctClicks.length === 0) {
            this.setHintPosition(correctPositions[0].x, correctPositions[0].y);
            return;
        }
        for (let i = 0; i < correctPositions.length; i++) {
            // correctClicks에 없는 좌표를 찾아서 hintPosition에 설정
            if (!this.correctClicks.some(click => click.x === correctPositions[i].x && click.y === correctPositions[i].y)) {
                const currentClick = correctPositions[i];
                this.setHintPosition(currentClick.x, currentClick.y);
                break;
            }
        }

    }


    setHintPosition(x: number, y: number) {
        this.hintPosition = { x, y };
        setTimeout(() => {
            runInAction(() => {
                this.hintPosition = null;
            });
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

    initClicks() {
        this.correctClicks = [];
        this.wrongClicks = [];
    }
    nextRound() {
        this.timer = 60;
        this.remainingTime = 60;
        this.initClicks();
        this.wrongClicks = [];
        this.roundClearEffect = false;
        this.roundFailEffect = false;
        this.round += 1;
    }

    resetGameState() {
        this.correctClicks = [];
        this.wrongClicks = [];
        this.roundClearEffect = false;
        this.roundFailEffect = false;
        this.hintPosition = null;
        this.isClickable = true;
        this.timerStopped = true;
        this.gameOver = false;
        this.remainingTime = 0;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.life = 3;
        this.hints = 2;
        this.item_timer_stop = 3;
        this.timer = 60;
        this.round = 1;

    }
}

const soloGameViewModel = new SoloGameViewModel();
export default soloGameViewModel;

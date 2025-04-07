// src/services/FindItWebSocketService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameService } from './GameService';
import { webSocketService } from './WebSocketService';
import { NavigationRefType } from '../navigation/navigationTypes';
import findItViewModel from '../games/find-it/services/FindItViewModel';
import {findItService} from './FindItService';
import {WS_BASE_URL} from '../config';
class FindItWebSocketService {
    private accessToken: string | null = null;
    private userID: number | null = null;
    private roomID: number | null = null;
    private imageID: number | null = null;
    private round: number | null = null;
    private gameStarted: boolean = false;
    async initialize() {
        this.accessToken = await AsyncStorage.getItem('accessToken');
        const storedUserID = await AsyncStorage.getItem('userID');

        if (!this.accessToken || !storedUserID) {
            console.error("❌ 액세스 토큰 또는 유저 ID가 없습니다.");
            return false;
        }

        this.userID = parseInt(storedUserID, 10);
        return true;
    }
    async connect() {
        // ✅ 기존 상태 초기화
        this.gameStarted = false;
        this.roomID = null;
        this.imageID = null;
        this.round = null;
        const isInitialized = await this.initialize();
        if (!isInitialized) return;

        const wsUrl = WS_BASE_URL +`/find-it/v0.1/rooms/match/ws?tkn=${this.accessToken}`;
        webSocketService.connect(wsUrl, this.handleMessage);
        this.sendMatchEvent();
    }

    handleMessage = async (eventType: string, data: any) => {
        console.log("📩 서버 응답:", data);
        const navigation = webSocketService.getNavigation();

        try {
            
            // ✅ 유저 정보 업데이트 (정답 좌표 저장)
            if (data.users) {
                gameService.setUsers(data.users);
                // ✅ 모든 유저의 정답 & 오답을 처리
                data.users.forEach((user: any) => {
                    // ✅ 정답 처리 (각 유저의 correctPositions)
                    if (Array.isArray(user.correctPositions) && user.correctPositions.length > 0) {
                        console.log(`⭕ 유저 ${user.id} 정답 추가:`, user.correctPositions);

                        user.correctPositions.forEach((pos: any) => {
                            // ✅ pos가 배열인지, 객체인지 확인
                            let x, y;
                            if (Array.isArray(pos) && pos.length === 2) {
                                [x, y] = pos; // ✅ 배열 형태일 경우
                            } else if (typeof pos === "object" && pos !== null) {
                                x = pos.x;
                                y = pos.y;
                            } else {
                                console.warn("⚠️ 올바르지 않은 좌표 데이터:", pos);
                                return;
                            }

                            // ✅ 중복 확인: 이미 저장된 정답인지 체크
                            const isAlreadyAdded = findItViewModel.correctClicks.some(
                                (click) => findItViewModel.isNearby(click.x, click.y, x, y, 5) // 좌표 반경 내 존재 여부 확인
                            );

                            if (!isAlreadyAdded) {
                                findItViewModel.addCorrectClick(x, y, user.id);
                            }
                        });
                    }

                    // ✅ 오답 처리 (모든 유저에게 동일한 오답 표시)
                    if (data.gameInfo.wrongPosition && (data.gameInfo.wrongPosition.x !== 0 || data.gameInfo.wrongPosition.y !== 0)) {
                        console.log(`❌ 유저 ${user.id} 오답 표시:`, data.gameInfo.wrongPosition);
                        findItViewModel.addWrongClick(
                            data.gameInfo.wrongPosition.x,
                            data.gameInfo.wrongPosition.y,
                            user.id
                        );
                    }
                });
            }


            console.log("응답으로 온 타입 , ",eventType);
            // 게임이 시작한다. START 이벤트 
            // next_round -> round_start
            // 다음 라운드 진출하면 next_round 이벤트 호출
            //next_round : 라운드 실패하거나 성공했을때 호출, 좌표 5개 모두 맞췄을 때 
            // round_start : next_round에서 호출 
            switch (eventType) {
                case "MATCH":
                    console.log("✅ 매칭 성공!", data.message);
                    await gameService.setRoomID(data.gameInfo.roomID);  // ✅ roomID 저장
                    await gameService.setRound(data.gameInfo.round);
                    // ✅ 게임 정보가 있는 경우 처리
                    if (data.gameInfo) {
                        // ✅ 모든 플레이어가 준비되었고, 방이 가득 찼으며, 내가 방장인 경우 "START" 이벤트 요청
                        if (!this.gameStarted && data.gameInfo.allReady && data.gameInfo.isFull && data.users) {

                            const isOwner = data.users.some((user: any) => user.id === this.userID && user.isOwner);
                            if (isOwner) {
                                console.log(this.roomID);
                                console.log("방장이 게임 시작한다. ");
                                this.sendStartEvent();
                            } else {
                                console.log("🕒 게임 시작 대기 중...");
                            }
                        }
                    }
                    break;
                case "START":
                    findItService.deductCoin(-1);
                    if (navigation) {
                        navigation.navigate('Loading', { nextScreen: 'FindIt' });
                    }
                    this.handleGameStart(data);
                    // ✅ 게임 정보 저장
                    findItViewModel.updateGameState(
                        data.gameInfo.life,
                        data.gameInfo.itemHintCount,
                        data.gameInfo.itemTimerCount,
                        data.gameInfo.round,
                        data.gameInfo.timer
                    );
                    setTimeout(() => {
                    }, 2000);
                    
                    break;
                case "SUBMIT_POSITION":
                    // ✅ 게임 정보 저장
                    findItViewModel.updateGameState(
                        data.gameInfo.life,
                        data.gameInfo.itemHintCount,
                        data.gameInfo.itemTimerCount,
                        data.gameInfo.round,
                        data.gameInfo.timer
                    );
                    console.log("📥 좌표 제출 이벤트 수신:", data.message);
                    break;
                case "TIMER_ITEM":
                    // ✅ 게임 정보 저장
                    findItViewModel.updateGameState(
                        data.gameInfo.life,
                        data.gameInfo.itemHintCount,
                        data.gameInfo.itemTimerCount,
                        data.gameInfo.round,
                        data.gameInfo.timer
                    );
                    findItViewModel.useTimerStopItem();
                    break;
                case "HINT_ITEM":
                    // ✅ 게임 정보 저장
                    findItViewModel.updateGameState(
                        data.gameInfo.life,
                        data.gameInfo.itemHintCount,
                        data.gameInfo.itemTimerCount,
                        data.gameInfo.round,
                        data.gameInfo.timer
                    );
                    if (data.gameInfo.hintPosition) {
                        console.log("🔍 힌트 아이템 사용:", data.gameInfo.hintPosition);
                        findItViewModel.setHintPosition(data.gameInfo.hintPosition.x, data.gameInfo.hintPosition.y);
                    }
                    break;
                case "ROUND_START":
                    this.handleGameStart(data);
                    setTimeout(() => {
                    }, 2000);
                    break;
                case "TIME_OUT":
                    break;
                case "NEXT_ROUND":
                    findItViewModel.setTimer(data.gameInfo.timer);
                    findItViewModel.startTimer();
                    await gameService.setRoomID(data.gameInfo.roomID);  // ✅ roomID 저장
                    await gameService.setRound(data.gameInfo.round);
                     // ✅ 게임 정보 저장
                    findItViewModel.updateGameState(
                        data.gameInfo.life,
                        data.gameInfo.itemHintCount,
                        data.gameInfo.itemTimerCount,
                        data.gameInfo.round,
                        data.gameInfo.timer
                    );
                    console.log("🎉 라운드 클리어! 2초 후 다음 라운드 시작");
                    break;
                case "ROUND_FAIL":
                    findItViewModel.setRoundFailEffect(true);
                    console.log("❌ 못 맞춘 좌표:", data.gameInfo.failedPositions);
                    if (Array.isArray(data.gameInfo.failedPositions) && data.gameInfo.failedPositions.length > 0) {
                        findItViewModel.setMissedPositions(data.gameInfo.failedPositions);
                    }
                    setTimeout(() => {
                        // ✅ 못 맞춘 좌표를 ViewModel에 저장
                        findItViewModel.setRoundFailEffect(false);
                        findItViewModel.clearMissedPositions(); // 못 맞춘 좌표 초기화
                        this.sendNextRoundEvent();
                    }, 3000);
                    break;
                case "ROUND_CLEAR":
                    console.log("🎉 라운드 클리어! 2초 후 다음 라운드 시작");
                    findItViewModel.setRoundClearEffect(true);
                    setTimeout(() => {
                        findItViewModel.setRoundClearEffect(false);
                        this.sendNextRoundEvent();
                    }, 3000);
                    break;
                case "GAME_CLEAR":
                    // ✅ 웹소켓 종료
                    this.disconnect();
                    // ✅ 게임 결과 화면으로 이동
                    if (navigation) {
                        findItService.deductCoin(1);
                        navigation.navigate('MultiFindItResult', { isSuccess: true });
                    }
                    break;
                case "GAME_OVER":
                    // ✅ 웹소켓 종료
                    this.disconnect();
                    // ✅ 게임 결과 화면으로 이동
                    if (navigation) {
                        navigation.navigate('MultiFindItResult', { isSuccess: false });
                    }
                    break;
                case "MATCH_CANCEL":
                    console.log("🚫 매칭 취소:", data.message);
                    break;
                default:
                    console.warn("⚠️ 알 수 없는 이벤트:", data.event);
            }
            
        } catch (error) {
            console.error("❌ 데이터 처리 중 오류 발생:", error);
        }
    };

    async handleGameStart(data: any) {
        this.roomID = data.gameInfo.roomID;
        this.imageID = data.gameInfo.imageInfo.id;
        this.round = data.gameInfo.round;
        this.gameStarted = true;

        findItViewModel.updateGameState(
            data.gameInfo.life, data.gameInfo.itemHintCount, data.gameInfo.itemTimerCount, data.gameInfo.round, data.gameInfo.timer
        );

        findItViewModel.setImage(
            data.gameInfo.imageInfo.normalImageUrl,
            data.gameInfo.imageInfo.abnormalImageUrl
        );
        findItViewModel.initClicks();

    }
    sendNextRoundEvent() {
        webSocketService.sendMessage(this.userID as number, this.roomID as number, "NEXT_ROUND", { round: this.round, imageID: this.imageID });
    }
    sendTimeoutEvent() {
        webSocketService.sendMessage(this.userID as number, this.roomID as number, "TIME_OUT", { round: this.round, imageID: this.imageID });
    }

    sendMatchEvent() {
        webSocketService.sendMessage(this.userID as number, this.roomID as number, "MATCH", { userID: this.userID });
    }

    sendStartEvent() {
        webSocketService.sendMessage(this.userID as number, this.roomID as number, "START", { userID: this.userID, roomID: this.roomID });
    }

    sendMatchCancelEvent() {
        webSocketService.sendMessage(this.userID as number, this.roomID as number, "MATCH_CANCEL", { userID: this.userID });
    }

    sendSubmitPosition(xPosition: number, yPosition: number) {
        webSocketService.sendMessage(this.userID as number, this.roomID as number, "SUBMIT_POSITION", {
            round: this.round,
            imageId: this.imageID,
            xPosition,
            yPosition
        });
    }

    sendHintItemEvent() {
        webSocketService.sendMessage(this.userID as number, this.roomID as number, "HINT_ITEM", {
            round: this.round,
            imageID: this.imageID
        });
    }

    sendTimerItemEvent() {
        webSocketService.sendMessage(this.userID as number, this.roomID as number, "TIMER_ITEM", {
            round: this.round,
            imageID: this.imageID
        });
    }

    disconnect() {
        webSocketService.disconnect();
        // ✅ 게임 상태 초기화 (정답/오답 및 타이머 초기화)
        findItViewModel.resetGameState();
        // ✅ 게임 데이터 초기화
        this.gameStarted = false;
        this.roomID = null;
        this.imageID = null;
        this.round = null;
    }
}

export const findItWebSocketService = new FindItWebSocketService();

// src/services/FindItWebSocketService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameService } from './GameService';
import { webSocketService } from './WebSocketService';
import { NavigationRefType } from '../navigation/navigationTypes';
import findItViewModel from '../games/find-it/FindItViewModel';
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
            // ✅ 게임 정보가 있는 경우 처리
            if (data.gameInfo) {
                this.roomID = data.gameInfo.roomID; // ✅ roomID 저장
                this.imageID = data.gameInfo.imageInfo.id; // ✅ imageID 저장
                this.round = data.gameInfo.round; // ✅ 라운드 저장

                // ✅ 게임 정보 저장
                findItViewModel.updateGameState(
                    data.gameInfo.life,
                    data.gameInfo.itemHintCount,
                    data.gameInfo.itemTimerCount,
                    data.gameInfo.round,
                    data.gameInfo.timer
                );

                await gameService.setRoomID(data.gameInfo.roomID);  // ✅ roomID 저장
                await gameService.setRound(data.gameInfo.round);

                // ✅ 모든 플레이어가 준비되었고, 방이 가득 찼으며, 내가 방장인 경우 "START" 이벤트 요청
                if (!this.gameStarted && data.gameInfo.allReady && data.gameInfo.isFull && data.users) {
                  
                    const isOwner = data.users.some((user: any) => user.id === this.userID && user.isOwner);
                    if (isOwner) {
                        this.sendStartEvent();
                        this.gameStarted = true;
                    } else {
                        console.log("🕒 게임 시작 대기 중...");
                    }
                }
            }
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


            console.log(eventType);

            switch (eventType) {
                case "MATCH":
                    console.log("✅ 매칭 성공!", data.message);
                    break;
                case "START":
                    await this.handleGameStart(data);
                    break;
                case "SUBMIT_POSITION":
                    console.log("📥 좌표 제출 이벤트 수신:", data.message);
                    break;
                case "TIMER_ITEM":
                    findItViewModel.useTimerStopItem();
                    break;
                case "HINT_ITEM":
                    if (data.gameInfo.hintPosition) {
                        console.log("🔍 힌트 아이템 사용:", data.gameInfo.hintPosition);
                        findItViewModel.setHintPosition(data.gameInfo.hintPosition.x, data.gameInfo.hintPosition.y);
                    }
                    break;
                case "ROUND_START":
                    await gameService.setImageID(data.gameInfo.imageInfo.id);  // ✅ imageID 저장

                    // ✅ MobX 액션을 사용하여 이미지 변경 (strict-mode에서도 허용됨)
                    findItViewModel.setImage(
                        data.gameInfo.imageInfo.normalImageUrl,
                        data.gameInfo.imageInfo.abnormalImageUrl
                    );
                    break;
                case "TIME_OUT":
                    console.log("다음 라운드 진출");
                    this.sendNextRoundEvent();
                    break;
                case "NEXT_ROUND":
                    console.log("🎉 라운드 클리어! 2초 후 다음 라운드 시작");
                    break;

                case "ROUND_CLEAR":
                    // ✅ "클리어" 이펙트 활성화
                    findItViewModel.setRoundClearEffect(true);

                    setTimeout(() => {
                        // ✅ 클리어 이펙트 숨기기
                        findItViewModel.setRoundClearEffect(false);

                        // ✅ 타이머 초기화 및 라운드 변경
                        findItViewModel.updateTimer(data.gameInfo.timer); // 타이머 60초로 초기화
                        findItViewModel.nextRound(data.gameInfo.timer);
                        this.sendNextRoundEvent();
                    }, 2000);

                    break;
                case "GAME_OVER":
                    // ✅ 웹소켓 종료
                    this.disconnect();
                    findItViewModel.stopTimer();
                    // ✅ 게임 종료 시 상태 초기화
                    this.gameStarted = false;
                    this.roomID = null;
                    this.imageID = null;
                    this.round = null;

                    // ✅ 게임 결과 화면으로 이동
                    if (navigation) {
                        navigation.navigate('FindItGameOver');
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
        const navigation = webSocketService.getNavigation();
        this.roomID = data.gameInfo.roomID;
        this.imageID = data.gameInfo.imageInfo.id;
        this.round = data.gameInfo.round;

        findItViewModel.updateGameState(
            data.gameInfo.life, data.gameInfo.itemHintCount, data.gameInfo.itemTimerCount, data.gameInfo.round, data.gameInfo.timer
        );

        findItViewModel.setImage(
            data.gameInfo.imageInfo.normalImageUrl,
            data.gameInfo.imageInfo.abnormalImageUrl
        );

        navigation?.navigate('FindIt');
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

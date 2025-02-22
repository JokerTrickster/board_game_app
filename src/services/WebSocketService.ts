import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameService } from '../services/GameService';
import { NavigationRefType } from '../navigation/navigationTypes';
import findItViewModel from '../games/find-it/FindItViewModel';
class WebSocketService {
    private socket: WebSocket | null = null;
    private accessToken: string | null = null; // ✅ 액세스 토큰 저장
    private userID: number | null = null; // ✅ 사용자 ID 저장
    private roomID: number | null = null; // ✅ 방 ID 저장
    private imageID: number | null = null; // ✅ 이미지 ID 저장
    private round: number | null = null; // ✅ 라운드 저장
    private navigation: NavigationRefType = null;
    private gameStarted: boolean = false; // ✅ 게임 시작 여부
    constructor() { }
    // ✅ 네비게이션 설정 (외부에서 NavigationContainerRef를 받아 설정)
    setNavigation(navigation: NavigationRefType) {
        this.navigation = navigation;
    }

  
    // ✅ 게임 시작 후 화면 이동 처리
    handleGameStart() {
        if (this.navigation) {
            console.log("🎮 게임 시작! FindItScreen으로 이동");
            this.navigation.navigate('FindIt');
        } else {
            console.error("❌ 네비게이션이 설정되지 않았습니다.");
        }
    }



    // ✅ 웹소켓 연결 (AsyncStorage에서 토큰 가져와서 연결)
    async connect() {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const storedUserID = await AsyncStorage.getItem('user_id'); // ✅ 유저 ID 가져오기

            if (!token || !storedUserID) {
                console.error("❌ 액세스 토큰 또는 유저 ID가 없습니다. 웹소켓을 연결할 수 없습니다.");
                return;
            }

            this.accessToken = token; // ✅ 가져온 토큰을 저장
            this.userID = parseInt(storedUserID, 10); // ✅ 유저 ID 저장

            this.accessToken = token; // ✅ 가져온 토큰을 저장
            const wsUrl = `ws://10.0.2.2:8080/find-it/v0.1/rooms/match/ws?tkn=${this.accessToken}`;
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log("✅ 웹소켓 연결 성공!");
                this.sendMatchEvent(); // ✅ 매칭 이벤트 전송
            };

            this.socket.onmessage = async (event) => {
                console.log("📩 서버 응답:",event.data);
                try {
                    // ✅ event.data가 문자열인지 확인 후 JSON 파싱
                    const rawData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                    console.log(rawData.event);
                    // ✅ message 필드가 JSON 문자열인지 확인 후 추가 파싱
                    const data = typeof rawData.message === 'string' ? JSON.parse(rawData.message) : rawData.message;
                    
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
                            data.gameInfo.round
                        );

                        await gameService.setRoomID(data.gameInfo.roomID);  // ✅ roomID 저장
                        await gameService.setRound(data.gameInfo.round);

                        // ✅ 모든 플레이어가 준비되었고, 방이 가득 찼으며, 내가 방장인 경우 "START" 이벤트 요청
                        if (!this.gameStarted && data.gameInfo.allReady && data.gameInfo.isFull) {
                            if (gameService.isOwner(this.userID!)) {
                                this.gameStarted = true;
                                this.sendStartEvent();
                            } else {
                                console.log("🛑 나는 방장이 아닙니다. START 이벤트를 전송하지 않습니다.");
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
                    
                    // ✅ 이벤트별 처리
                    switch (rawData.event) {
                        case "MATCH":
                            console.log("✅ 매칭 성공! ", rawData.message);
                            break;
                        case "START":
                            await gameService.setImageID(data.gameInfo.imageInfo.id);  // ✅ imageID 저장
                            // ✅ MobX 액션을 사용하여 이미지 변경 (strict-mode에서도 허용됨)
                            findItViewModel.updateGameState(
                                data.gameInfo.life,
                                data.gameInfo.itemHintCount,
                                data.gameInfo.itemTimerCount,
                                data.gameInfo.round
                            );
                            findItViewModel.setImage(
                                data.gameInfo.imageInfo.normalImageUrl,
                                data.gameInfo.imageInfo.abnormalImageUrl
                            );
                            console.log("이미지 저장 ,ㅡ", findItViewModel.abnormalImage);
                            console.log("🎮 게임 시작! FindItScreen으로 이동");
                            if (this.navigation) {
                                this.navigation.navigate('FindIt'); // ✅ 게임 화면으로 이동
                            }
                            break;
                        case "SUBMIT_POSITION":
                            console.log("📥 좌표 제출 이벤트 수신:", rawData.message);
                            break;
                        case "TIMER_ITEM":
                            findItViewModel.useTimerStopItem(); // ✅ 타이머 멈춤 실행
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
                            console.log("이미지 저장 ,ㅡ", findItViewModel.abnormalImage);
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
                                findItViewModel.updateTimer(60); // 타이머 60초로 초기화
                                findItViewModel.nextRound();
                                webSocketService.sendNextRoundEvent();
                            }, 2000);
                        
                            break;
                        case "GAME_OVER":
                            // ✅ 웹소켓 종료
                            webSocketService.disconnect();
                            findItViewModel.stopTimer();

                            // ✅ 게임 결과 화면으로 이동
                            if (this.navigation) {
                                this.navigation.navigate('FindItGameOver');
                            }
                            break;
                        default:
                            console.warn("⚠️ 알 수 없는 이벤트:", rawData.event);
                    }

                } catch (error) {
                    console.error("❌ 응답 처리 중 JSON 파싱 오류 발생:", error);
                }
            };
            this.socket.onerror = (error) => {
                console.error("❌ 웹소켓 에러 발생:", JSON.stringify(error, null, 2));

                if (error instanceof Event) {
                    console.error("🔴 웹소켓 오류 이벤트:", error);
                } else if (typeof error === "object") {
                    console.error("🔴 상세 오류 정보:", error);
                } else {
                    console.error("🔴 알 수 없는 웹소켓 오류:", error);
                }
            };

            this.socket.onclose = (event) => {
                console.log(`🔌 웹소켓 연결 종료 (코드: ${event.code}, 이유: ${event.reason})`);
            };

        } catch (error) {
            console.error("❌ 액세스 토큰 가져오기 실패:", error);
        }
    }

    
    async sendNextRoundEvent() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("❌ 웹소켓이 연결되지 않았습니다.");
            return;
        }
        const nextRoundEvent = {
            roomID: this.roomID,
            userID: this.userID,
            event: "NEXT_ROUND",
            message: JSON.stringify({
                round: this.round,
                imageID: this.imageID
            })
        };
        console.log("📤 다음 라운드 이동 이벤트 전송:", nextRoundEvent);
        this.socket.send(JSON.stringify(nextRoundEvent));
    }

    async sendTimeOutEvent() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("❌ 웹소켓이 연결되지 않았습니다.");
            return;
        }

        const timeOutEvent = {
            roomID: this.roomID,
            userID: this.userID,
            event: "TIME_OUT",
            message: JSON.stringify({
                round: this.round,
                imageID: this.imageID
            })
        };
        console.log("📤 타임 아웃 이벤트 전송:", timeOutEvent);
        this.socket.send(JSON.stringify(timeOutEvent));

    }

    async sendHintItemEvent() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("❌ 웹소켓이 연결되지 않았습니다.");
            return;
        }

        // ✅ 필요한 값이 `null`인 경우 `AsyncStorage`에서 가져오기
        if (!this.roomID) this.roomID = await gameService.getRoomID();
        if (!this.userID) {
            const storedUserID = await AsyncStorage.getItem('user_id');
            this.userID = storedUserID ? parseInt(storedUserID, 10) : null;
        }
        if (!this.imageID) this.imageID = await gameService.getImageID();
        if (!this.round) this.round = await gameService.getRound();

        // ✅ 다시 한 번 `null` 체크 후 전송
        if (!this.roomID || !this.userID || !this.imageID || !this.round) {
            console.error("❌ 필요한 게임 정보가 누락되었습니다. 전송 중단:", {
                roomID: this.roomID,
                userID: this.userID,
                imageID: this.imageID,
                round: this.round
            });
            return;
        }

        const hintItemEvent = {
            roomID: this.roomID,
            userID: this.userID,
            event: "HINT_ITEM",
            message: JSON.stringify({
                round: this.round,
                imageID: this.imageID
            })
        };

        console.log("📤 힌트 아이템 이벤트 전송:", hintItemEvent);
        this.socket.send(JSON.stringify(hintItemEvent));
    }

    async sendTimerItemEvent() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("❌ 웹소켓이 연결되지 않았습니다.");
            return;
        }

        if (!this.roomID) this.roomID = await gameService.getRoomID();
        if (!this.userID) {
            const storedUserID = await AsyncStorage.getItem('user_id');
            this.userID = storedUserID ? parseInt(storedUserID, 10) : null;
        }
        if (!this.imageID) this.imageID = await gameService.getImageID();
        if (!this.round) this.round = await gameService.getRound();

        if (!this.roomID || !this.userID || !this.imageID || !this.round) {
            console.error("❌ 필요한 게임 정보가 누락되었습니다. 전송 중단:", {
                roomID: this.roomID,
                userID: this.userID,
                imageID: this.imageID,
                round: this.round
            });
            return;
        }

        const timerItemEvent = {
            roomID: this.roomID,
            userID: this.userID,
            event: "TIMER_ITEM",
            message: JSON.stringify({
                round: this.round,
                imageID: this.imageID
            })
        };

        console.log("📤 타이머 정지 아이템 이벤트 전송:", timerItemEvent);
        this.socket.send(JSON.stringify(timerItemEvent));
    }

    // ✅ 매칭 요청 이벤트 전송
    sendMatchEvent() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("❌ 웹소켓이 연결되지 않았습니다.");
            return;
        }

        const matchEvent = {
            userID: this.userID, // ✅ 실제 로그인된 사용자 ID로 변경 필요
            event: "MATCH",
            message: "",
        };

        this.socket.send(JSON.stringify(matchEvent));
        console.log("🚀 매칭 이벤트 전송:", matchEvent);
    }

    // ✅ 게임 시작 이벤트 전송 (방장만 수행)
    sendStartEvent() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("❌ 웹소켓이 연결되지 않았습니다.");
            return;
        }

        const startEvent = {
            userID: this.userID,
            roomID:this.roomID,
            event: "START",
            message: "",
        };

        this.socket.send(JSON.stringify(startEvent));
        console.log("🚀 게임 시작 이벤트 전송:", startEvent);
    }
    // ✅ 클릭한 좌표를 서버로 전송하는 메서드 추가
    sendSubmitPosition(round: number,  xPosition: number, yPosition: number) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("❌ 웹소켓이 연결되지 않았습니다.");
            return;
        }

        const submitEvent = {
            roomID: this.roomID,  // 방 ID
            userID: this.userID,  // 사용자 ID
            event: "SUBMIT_POSITION", // 이벤트 타입
            message: JSON.stringify({
                round: round,
                imageId: this.imageID,
                xPosition: xPosition,
                yPosition: yPosition
            })
        };

        this.socket.send(JSON.stringify(submitEvent));
        console.log("📤 좌표 제출 이벤트 전송:", submitEvent);
    }

    // ✅ 웹소켓 종료
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

export const webSocketService = new WebSocketService();

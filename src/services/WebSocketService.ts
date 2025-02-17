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
    private navigation: NavigationRefType = null;
    private messageListeners: ((data: any) => void)[] = []; // ✅ 메시지 리스너 배열 추가
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
                console.log("📩 서버 응답:", event.data);
                try {
                    // ✅ event.data가 문자열인지 확인 후 JSON 파싱
                    const rawData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                    // ✅ message 필드가 JSON 문자열인지 확인 후 추가 파싱
                    const data = typeof rawData.message === 'string' ? JSON.parse(rawData.message) : rawData.message;
                    
                    // ✅ 게임 정보가 있는 경우 처리
                    if (data.gameInfo) {
                        await gameService.setRoomID(data.gameInfo.roomID);  // ✅ roomID 저장
                        await gameService.setImageID(data.gameInfo.imageInfo.id);  // ✅ imageID 저장
                        findItViewModel.life = data.gameInfo.life; // ✅ 목숨 업데이트
                        findItViewModel.hints = data.gameInfo.itemHintCount; // ✅ 힌트 아이템 수 업데이트
                        findItViewModel.item_timer_stop = data.gameInfo.itemTimerCount; // ✅ 타이머 정지 아이템 수 업데이트
                        findItViewModel.round = data.gameInfo.round; // ✅ 라운드 업데이트
                        // ✅ 모든 플레이어가 준비되었고, 방이 가득 찼으며, 내가 방장인 경우 "START" 이벤트 요청
                        if (data.gameInfo.allReady && data.gameInfo.isFull) {
                            if (gameService.isOwner(this.userID!)) {
                                this.sendStartEvent();
                            } else {
                                console.log("🛑 나는 방장이 아닙니다. START 이벤트를 전송하지 않습니다.");
                            }
                        }
                    }
                    // ✅ 유저 정보 업데이트 (정답 좌표 저장)
                    if (data.users) {
                        gameService.setUsers(data.users);
                    }
                    // ✅ 모든 유저의 정답 & 오답을 처리
                    data.users.forEach((user: any) => {
                        // ✅ 정답 처리 (각 유저의 correctPositions)
                        if (user.correctPositions && user.correctPositions.length > 0) {
                            console.log(`⭕ 유저 ${user.id} 정답 추가:`, user.correctPositions);
                            user.correctPositions.forEach((pos: number[]) => {
                                findItViewModel.addCorrectClick(pos[0], pos[1], user.id);
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
                    

                    // ✅ 이벤트별 처리
                    switch (rawData.event) {
                        case "MATCH":
                            console.log("✅ 매칭 성공! ", rawData.message);
                            break;
                        case "START":
                            console.log("🎮 게임 시작! FindItScreen으로 이동");
                            if (this.navigation) {
                                this.navigation.navigate('FindIt'); // ✅ 게임 화면으로 이동
                            }
                            break;
                        case "SUBMIT_POSITION":
                            console.log("📥 좌표 제출 이벤트 수신:", rawData.message);
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
    sendSubmitPosition(round: number, imageId: number, xPosition: number, yPosition: number) {
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
                imageId: imageId,
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
